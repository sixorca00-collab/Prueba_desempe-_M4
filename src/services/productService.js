import { pool } from '../config/postgresConfig.js';
import { httpError } from '../utils/httpError.js';

// Ensure the database pool is available before running queries.
const assertPool = () => {
  if (!pool) throw httpError('Database connection is not initialized.', 500);
};

// Insert a new product.
export const createProduct = async ({ nombre_producto, cantidad, skun, precio }) => {
  assertPool();

  const { rows } = await pool.query(
    `
      INSERT INTO productos (nombre_producto, cantidad, skun, precio)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre_producto, cantidad, skun, precio
    `,
    [nombre_producto, cantidad, skun, precio]
  );

  return rows[0];
};

// Fetch all products.
export const getProducts = async () => {
  assertPool();

  const { rows } = await pool.query(
    'SELECT id, nombre_producto, cantidad, skun, precio FROM productos ORDER BY id ASC'
  );

  return rows;
};

// Fetch one product by id.
export const getProductById = async (id) => {
  assertPool();

  const { rows } = await pool.query(
    'SELECT id, nombre_producto, cantidad, skun, precio FROM productos WHERE id = $1',
    [id]
  );

  return rows[0] ?? null;
};

// Update one product by id.
export const updateProduct = async (id, { nombre_producto, cantidad, skun, precio }) => {
  assertPool();

  const { rows } = await pool.query(
    `
      UPDATE productos
      SET nombre_producto = $1, cantidad = $2, skun = $3, precio = $4
      WHERE id = $5
      RETURNING id, nombre_producto, cantidad, skun, precio
    `,
    [nombre_producto, cantidad, skun, precio, id]
  );

  return rows[0] ?? null;
};

// Delete one product by id.
export const deleteProduct = async (id) => {
  assertPool();

  const { rowCount } = await pool.query('DELETE FROM productos WHERE id = $1', [id]);
  return rowCount > 0;
};
