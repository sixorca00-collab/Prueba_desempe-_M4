import { pool } from '../config/postgresConfig.js';
import { httpError } from '../utils/httpError.js';

const assertPool = () => {
  if (!pool) throw httpError('Database connection is not initialized.', 500);
};

export const createProvider = async ({ nombre, email }) => {
  assertPool();
  const { rows } = await pool.query(
    `
      INSERT INTO providers(name, email)
      VALUES ($1, $2)
      RETURNING id, name, email
    `,
    [nombre, email]
  );
  return rows[0];
};

export const getProviders = async () => {
  assertPool();
  const { rows } = await pool.query('SELECT id, name, email FROM providers ORDER BY id ASC');
  return rows;
};

export const getProviderById = async (id) => {
  assertPool();
  const { rows } = await pool.query('SELECT id, name, email FROM providers WHERE id = $1', [id]);
  return rows[0] ?? null;
};

export const updateProvider = async (id, { nombre, email }) => {
  assertPool();
  const { rows } = await pool.query(
    `
      UPDATE providers
      SET name = $1, email = $2
      WHERE id = $3
      RETURNING id, nombre, email
    `,
    [nombre, email, id]
  );
  return rows[0] ?? null;
};

export const deleteProvider = async (id) => {
  assertPool();
  const { rowCount } = await pool.query('DELETE FROM providers WHERE id = $1', [id]);
  return rowCount > 0;
};
