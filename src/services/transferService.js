import { pool } from '../config/postgresConfig.js';
import { httpError } from '../utils/httpError.js';

const assertPool = () => {
  if (!pool) throw httpError('Database connection is not initialized.', 500);
};

export const createTransfer = async ({ fecha }) => {
  assertPool();
  const { rows } = await pool.query(
    `
      INSERT INTO transferencias (fecha)
      VALUES ($1)
      RETURNING id, fecha
    `,
    [fecha]
  );
  return rows[0];
};

export const getTransfers = async () => {
  assertPool();
  const { rows } = await pool.query('SELECT id, fecha FROM transferencias ORDER BY id ASC');
  return rows;
};

export const getTransferById = async (id) => {
  assertPool();
  const { rows } = await pool.query('SELECT id, fecha FROM transferencias WHERE id = $1', [id]);
  return rows[0] ?? null;
};

export const updateTransfer = async (id, { fecha }) => {
  assertPool();
  const { rows } = await pool.query(
    `
      UPDATE transferencias
      SET fecha = $1
      WHERE id = $2
      RETURNING id, fecha
    `,
    [fecha, id]
  );
  return rows[0] ?? null;
};

export const deleteTransfer = async (id) => {
  assertPool();
  const { rowCount } = await pool.query('DELETE FROM transferencias WHERE id = $1', [id]);
  return rowCount > 0;
};
