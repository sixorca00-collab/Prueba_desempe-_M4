import { pool } from '../config/postgresConfig.js';
import { httpError } from '../utils/httpError.js';

const assertPool = () => {
  if (!pool) throw httpError('Database connection is not initialized.', 500);
};

export const createClient = async ({ nombre, email, telefono, direccion }) => {
  assertPool();
  const { rows } = await pool.query(
    `
      INSERT INTO clientes (name, email, phone, address)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, phone, address
    `,
    [nombre, email, telefono ?? null, direccion ?? null]
  );
  return rows[0];
};

export const getClients = async () => {
  assertPool();
  const { rows } = await pool.query('SELECT id, name, email, phone, address FROM clientes ORDER BY id ASC');
  return rows;
};

export const getClientById = async (id) => {
  assertPool();
  const { rows } = await pool.query(
    'SELECT id, name, email, phone, address FROM clientes WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
};

export const updateClient = async (id, { nombre, email, telefono, direccion }) => {
  assertPool();
  const { rows } = await pool.query(
    `
      UPDATE clientes
      SET name = $1, email = $2, phone = $3, address = $4
      WHERE id = $5
      RETURNING id, name, email, phone, address
    `,
    [nombre, email, telefono ?? null, direccion ?? null, id]
  );
  return rows[0] ?? null;
};

export const deleteClient = async (id) => {
  assertPool();
  const { rowCount } = await pool.query('DELETE FROM clients WHERE id = $1', [id]);
  return rowCount > 0;
};
