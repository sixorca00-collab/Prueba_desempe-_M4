import { pool } from '../config/postgresConfig.js';
import { httpError } from '../utils/httpError.js';

// Ensure the database pool is available before running queries.
const assertPool = () => {
  if (!pool) throw httpError('Database connection is not initialized.', 500);
};

// Insert a new client.
export const createClient = async ({ name, email, phone, address }) => {
  assertPool();

  const { rows } = await pool.query(
    `
      INSERT INTO customers (name, email, phone, address)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, phone, address
    `,
    [name, email, phone ?? null, address ?? null]
  );

  return rows[0];
};

// Fetch all clients.
export const getClients = async () => {
  assertPool();

  const { rows } = await pool.query(
    'SELECT id, name, email, phone, address FROM customers ORDER BY id ASC'
  );

  return rows;
};

// Fetch one client by id.
export const getClientById = async (id) => {
  assertPool();

  const { rows } = await pool.query(
    'SELECT id, name, email, phone, address FROM customers WHERE id = $1',
    [id]
  );

  return rows[0] ?? null;
};

// Update one client by id.
export const updateClient = async (id, { name, email, phone, address }) => {
  assertPool();

  const { rows } = await pool.query(
    `
      UPDATE customers
      SET name = $1, email = $2, phone = $3, address = $4
      WHERE id = $5
      RETURNING id, name, email, phone, address
    `,
    [name, email, phone ?? null, address ?? null, id]
  );

  return rows[0] ?? null;
};

// Delete one client by id.
export const deleteClient = async (id) => {
  assertPool();

  const { rowCount } = await pool.query('DELETE FROM customers WHERE id = $1', [id]);
  return rowCount > 0;
};
