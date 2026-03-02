import { pool } from '../config/postgresConfig.js';
import { httpError } from '../utils/httpError.js';

const assertPool = () => {
  if (!pool) throw httpError('Database connection is not initialized.', 500);
};

export const createProduct = async ({ nombre_producto, cantidad, skun, precio }) => {
  assertPool();
  const { rows } = await pool.query(
    `
      INSERT INTO products(name_product, amount, skun, price)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name_product, amount, skun, price
    `,
    [nombre_producto, cantidad, skun, precio]
  );
  return rows[0];
};

export const getProducts = async () => {
  assertPool();
  const { rows } = await pool.query('SELECT id, name_product, amount, skun, price FROM products ORDER BY id ASC');
  return rows;
};

export const getProductById = async (id) => {
  assertPool();
  const { rows } = await pool.query(
    'SELECT id, name_product, amount, skun, price FROM products WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
};

export const updateProduct = async (id, { nombre_producto, cantidad, skun, precio }) => {
  assertPool();
  const { rows } = await pool.query(
    `
      UPDATE products
      SET name_product = $1, amount = $2, skun = $3, price = $4
      WHERE id = $5
      RETURNING id, name_product, amount, skun, price
    `,
    [nombre_producto, cantidad, skun, precio, id]
  );
  return rows[0] ?? null;
};

export const deleteProduct = async (id) => {
  assertPool();
  const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return rowCount > 0;
};
