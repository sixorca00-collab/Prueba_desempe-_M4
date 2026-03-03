import { pool } from '../config/postgresConfig.js';
import { httpError } from '../utils/httpError.js';

// Ensure the database pool is available before running queries.
const assertPool = () => {
  if (!pool) throw httpError('Database connection is not initialized.', 500);
};

// Insert a new provider.
export const createProvider = async ({ name, email }) => {
  assertPool();

  const { rows } = await pool.query(
    `
      INSERT INTO suppliers (name, email)
      VALUES ($1, $2)
      RETURNING id, name, email
    `,
    [name, email]
  );

  return rows[0];
};

// Fetch all providers.
export const getProviders = async () => {
  assertPool();

  const { rows } = await pool.query('SELECT id, name, email FROM suppliers ORDER BY id ASC');
  return rows;
};

// Fetch one provider by id.
export const getProviderById = async (id) => {
  assertPool();

  const { rows } = await pool.query('SELECT id, name, email FROM suppliers WHERE id = $1', [id]);
  return rows[0] ?? null;
};

// Update one provider by id.
export const updateProvider = async (id, { name, email }) => {
  assertPool();

  const { rows } = await pool.query(
    `
      UPDATE suppliers
      SET name = $1, email = $2
      WHERE id = $3
      RETURNING id, name, email
    `,
    [name, email, id]
  );

  return rows[0] ?? null;
};

// Delete one provider by id.
export const deleteProvider = async (id) => {
  assertPool();

  const { rowCount } = await pool.query('DELETE FROM suppliers WHERE id = $1', [id]);
  return rowCount > 0;
};
