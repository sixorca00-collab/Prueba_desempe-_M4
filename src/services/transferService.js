import { pool } from '../config/postgresConfig.js';
import { httpError } from '../utils/httpError.js';

// Ensure the database pool is available before running queries.
const assertPool = () => {
  if (!pool) throw httpError('Database connection is not initialized.', 500);
};

// Insert a new transfer.
export const createTransfer = async ({order_date }) => {
  assertPool();

  const { rows } = await pool.query(
    `
      INSERT INTO transacctions (order_date)
      VALUES ($1)
      RETURNING id, order_date
    `,
    [order_date]
  );

  return rows[0];
};

// Fetch all transfers.
export const getTransfers = async () => {
  assertPool();

  const { rows } = await pool.query(
    'SELECT id, order_date FROM transacctions ORDER BY id ASC'
  );

  return rows;
};

// Fetch one transfer by id.
export const getTransferById = async (id) => {
  assertPool();

  const { rows } = await pool.query('SELECT id, order_date FROM transacctions WHERE id = $1', [id]);
  return rows[0] ?? null;
};

// Update one transfer by id.
export const updateTransfer = async (id, { order_date }) => {
  assertPool();

  const { rows } = await pool.query(
    `
      UPDATE transacctions
      SET order_date = $1
      WHERE id = $2
      RETURNING id, order_date
    `,
    [order_date, id]
  );

  return rows[0] ?? null;
};

// Delete one transfer by id.
export const deleteTransfer = async (id) => {
  assertPool();

  const { rowCount } = await pool.query('DELETE FROM transacctions WHERE id = $1', [id]);
  return rowCount > 0;
};
