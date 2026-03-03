import { pool } from '../config/postgresConfig.js';
import { httpError } from '../utils/httpError.js';

// Ensure the database pool is available before running queries.
const assertPool = () => {
  if (!pool) throw httpError('Database connection is not initialized.', 500);
};

// Insert a new client.
export const createClient = async ({ nombre, email, telefono, direccion }) => {
  assertPool();

  const { rows } = await pool.query(
    `
      INSERT INTO clientes (nombre, email, telefono, direccion)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, email, telefono, direccion
    `,
    [nombre, email, telefono ?? null, direccion ?? null]
  );

  return rows[0];
};

// Fetch all clients.
export const getClients = async () => {
  assertPool();

  const { rows } = await pool.query(
    'SELECT id, nombre, email, telefono, direccion FROM clientes ORDER BY id ASC'
  );

  return rows;
};

// Fetch one client by id.
export const getClientById = async (id) => {
  assertPool();

  const { rows } = await pool.query(
    'SELECT id, nombre, email, telefono, direccion FROM clientes WHERE id = $1',
    [id]
  );

  return rows[0] ?? null;
};

// Update one client by id.
export const updateClient = async (id, { nombre, email, telefono, direccion }) => {
  assertPool();

  const { rows } = await pool.query(
    `
      UPDATE clientes
      SET nombre = $1, email = $2, telefono = $3, direccion = $4
      WHERE id = $5
      RETURNING id, nombre, email, telefono, direccion
    `,
    [nombre, email, telefono ?? null, direccion ?? null, id]
  );

  return rows[0] ?? null;
};

// Delete one client by id.
export const deleteClient = async (id) => {
  assertPool();

  const { rowCount } = await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
  return rowCount > 0;
};
