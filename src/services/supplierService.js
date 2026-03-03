import { pool } from '../config/postgresConfig.js';
import { httpError } from '../utils/httpError.js';
import DeletionLog from '../models/deletionLogModel.js';

const assertPool = () => {
  if (!pool) throw httpError('Database connection is not initialized.', 500);
};

// Create a new supplier in the normalized suppliers table.
export const createSupplier = async ({ name, email }) => {
  assertPool();
  try {
    const { rows } = await pool.query(
      `INSERT INTO suppliers (name, email)
       VALUES ($1, $2)
       RETURNING id, name, email, created_at`,
      [name, email ?? null]
    );
    return rows[0];
  } catch (error) {
    if (error.code === '23505') throw httpError('Supplier name already exists.', 409);
    throw error;
  }
};

//  Retrieve all suppliers.
export const getSuppliers = async () => {
  assertPool();
  const { rows } = await pool.query(
    'SELECT id, name, email, created_at FROM suppliers ORDER BY id ASC'
  );
  return rows;
};

// Retrieve a single supplier by ID.
export const getSupplierById = async (id) => {
  assertPool();
  const { rows } = await pool.query(
    'SELECT id, name, email, created_at FROM suppliers WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
};

// Update supplier details (partial or full update).
export const updateSupplier = async (id, { name, email }) => {
  assertPool();
  try {
    const { rows } = await pool.query(
      `UPDATE suppliers
       SET name = COALESCE($1, name), email = COALESCE($2, email)
       WHERE id = $3
       RETURNING id, name, email, created_at`,
      [name ?? null, email ?? null, id]
    );
    return rows[0] ?? null;
  } catch (error) {
    if (error.code === '23505') throw httpError('Supplier name already exists.', 409);
    throw error;
  }
};

// Delete supplier - logs to MongoDB then deletes from Postgres.
export const deleteSupplier = async (id) => {
  assertPool();
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      'SELECT id, name, email, created_at FROM suppliers WHERE id = $1',
      [id]
    );
    const supplier = rows[0];
    if (!supplier) return false;

    // Log deletion in MongoDB
    await DeletionLog.create({ entity: 'supplier', entity_id: supplier.id, deleted_data: supplier, deleted_at: new Date() });

    await client.query('BEGIN');
    const result = await client.query('DELETE FROM suppliers WHERE id = $1', [id]);
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
