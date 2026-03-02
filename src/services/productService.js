import { pool } from '../config/postgresConfig.js';
import { httpError } from '../utils/httpError.js';
import DeletionLog from '../models/deletionLogModel.js';

const assertPool = () => {
  if (!pool) throw httpError('Database connection is not initialized.', 500);
};

export const createProduct = async ({ nombre_producto, cantidad, skun, precio }) => {
  assertPool();

  // Start a transaction to create product and initial inventory atomically
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertProduct = await client.query(
      `INSERT INTO products(name_product, sku, price)
       VALUES ($1, $2, $3)
       RETURNING id, name_product, sku, price`,
      [nombre_producto, skun, precio]
    );

    const product = insertProduct.rows[0];

    await client.query(
      `INSERT INTO inventory(product_id, quantity) VALUES ($1, $2)
       ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity`,
      [product.id, cantidad]
    );

    await client.query('COMMIT');
    return { id: product.id, name_product: product.name_product, amount: cantidad, skun: product.sku, price: product.price };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getProducts = async () => {
  assertPool();
  const { rows } = await pool.query(
    `SELECT p.id, p.name_product, coalesce(i.quantity,0) as amount, p.sku as skun, p.price
     FROM products p
     LEFT JOIN inventory i ON i.product_id = p.id
     ORDER BY p.id ASC`
  );
  return rows;
};

export const getProductById = async (id) => {
  assertPool();
  const { rows } = await pool.query(
    `SELECT p.id, p.name_product, coalesce(i.quantity,0) as amount, p.sku as skun, p.price
     FROM products p
     LEFT JOIN inventory i ON i.product_id = p.id
     WHERE p.id = $1`,
    [id]
  );
  return rows[0] ?? null;
};

export const updateProduct = async (id, { nombre_producto, cantidad, skun, precio }) => {
  assertPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updateProduct = await client.query(
      `UPDATE products SET name_product = $1, sku = $2, price = $3 WHERE id = $4 RETURNING id, name_product, sku, price`,
      [nombre_producto, skun, precio, id]
    );

    await client.query(
      `INSERT INTO inventory(product_id, quantity) VALUES ($1, $2)
       ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity`,
      [id, cantidad]
    );

    await client.query('COMMIT');

    const prod = updateProduct.rows[0];
    const { rows } = await pool.query('SELECT coalesce(quantity,0) as amount FROM inventory WHERE product_id = $1', [id]);
    const amount = rows[0]?.amount ?? 0;
    return { id: prod.id, name_product: prod.name_product, amount, skun: prod.sku, price: prod.price };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const deleteProduct = async (id) => {
  assertPool();

  const client = await pool.connect();
  try {
    // Fetch product with inventory
    const { rows } = await client.query(
      `SELECT p.id, p.name_product, p.sku as skun, p.price, coalesce(i.quantity,0) as amount
       FROM products p LEFT JOIN inventory i ON i.product_id = p.id WHERE p.id = $1`,
      [id]
    );
    const product = rows[0];
    if (!product) return false;

    // Save deletion record in MongoDB first (audit requirement)
    await DeletionLog.create({ entity: 'product', entity_id: product.id, deleted_data: product, deleted_at: new Date() });

    // Then delete from Postgres inside transaction
    await client.query('BEGIN');
    const del = await client.query('DELETE FROM products WHERE id = $1', [id]);
    await client.query('COMMIT');

    return del.rowCount > 0;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {}
    throw error;
  } finally {
    client.release();
  }
};
