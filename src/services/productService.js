import { pool } from '../config/postgresConfig.js';
import { httpError } from '../utils/httpError.js';

// Ensure the database pool is available before running queries.
const assertPool = () => {
  if (!pool) throw httpError('Database connection is not initialized.', 500);
};

// Insert a new product.
export const createProduct = async ({ name_product, sku, amount, price }) => {
  assertPool();

  const { rows } = await pool.query(
    `
      INSERT INTO productos (nombre_producto, cantidad, skun, precio)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre_producto, cantidad, skun, precio
    `,
    [name_product, amount, sku, price]
  );

  return rows[0];
};

// Fetch all products.
export const getProducts = async () => {
  assertPool();

  const { rows } = await pool.query(
    'SELECT id, name_product, cantidad, sku, price FROM products ORDER BY id ASC'
  );

  return rows;
};

// Fetch one product by id.
export const getProductById = async (id) => {
  assertPool();

  const { rows } = await pool.query(
    'SELECT id, name_product, cantidad, sku, price FROM products WHERE id = $1',
    [id]
  );

  return rows[0] ?? null;
};

// Update one product by id.
export const updateProduct = async (id, { name_product, cantidad, sku, price }) => {
  assertPool();

  const { rows } = await pool.query(
    `
      UPDATE products
      SET name_product = $1, amount = $2, sku = $3, price = $4
      WHERE id = $5
      RETURNING id, name_product, amount, sku, price        
    `,
    [name_product, cantidad, sku, price, id]
  );

  return rows[0] ?? null;
};

// Delete one product by id.
export const deleteProduct = async (id) => {
  assertPool();

  const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return rowCount > 0;
};
