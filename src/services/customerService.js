import { pool } from '../config/postgresConfig.js';
import { httpError } from '../utils/httpError.js';
import DeletionLog from '../models/deletionLogModel.js';

const assertPool = () => {
  if (!pool) throw httpError('Database connection is not initialized.', 500);
};

/**
 * Create a new customer in the normalized customers table.
 * Email is unique constraint.
 */
export const createCustomer = async ({ name, email, phone, address }) => {
  assertPool();
  try {
    const { rows } = await pool.query(
      `INSERT INTO customers (name, email, phone, address)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, address, created_at`,
      [name, email, phone ?? null, address ?? null]
    );
    return rows[0];
  } catch (error) {
    if (error.code === '23505') throw httpError('Email already exists.', 409);
    throw error;
  }
};

/**
 * Retrieve all customers.
 */
export const getCustomers = async () => {
  assertPool();
  const { rows } = await pool.query(
    'SELECT id, name, email, phone, address, created_at FROM customers ORDER BY id ASC'
  );
  return rows;
};

/**
 * Retrieve a single customer by ID.
 */
export const getCustomerById = async (id) => {
  assertPool();
  const { rows } = await pool.query(
    'SELECT id, name, email, phone, address, created_at FROM customers WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
};

/**
 * Update customer details (partial or full update).
 */
export const updateCustomer = async (id, { name, email, phone, address }) => {
  assertPool();
  try {
    const { rows } = await pool.query(
      `UPDATE customers
       SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone), address = COALESCE($4, address)
       WHERE id = $5
       RETURNING id, name, email, phone, address, created_at`,
      [name ?? null, email ?? null, phone ?? null, address ?? null, id]
    );
    return rows[0] ?? null;
  } catch (error) {
    if (error.code === '23505') throw httpError('Email already exists.', 409);
    throw error;
  }
};

/**
 * Delete customer - logs to MongoDB then deletes from Postgres.
 * Will cascade-delete all related orders and order_items.
 */
export const deleteCustomer = async (id) => {
  assertPool();
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      'SELECT id, name, email, phone, address, created_at FROM customers WHERE id = $1',
      [id]
    );
    const customer = rows[0];
    if (!customer) return false;

    // Log deletion in MongoDB
    await DeletionLog.create({ entity: 'customer', entity_id: customer.id, deleted_data: customer, deleted_at: new Date() });

    await client.query('BEGIN');
    const result = await client.query('DELETE FROM customers WHERE id = $1', [id]);
    await client.query('COMMIT');

    return result.rowCount > 0;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {}
    throw error;
  } finally {
    client.release();
  }
};
