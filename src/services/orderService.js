import { pool } from '../config/postgresConfig.js';
import { httpError } from '../utils/httpError.js';

const assertPool = () => {
  if (!pool) throw httpError('Database connection is not initialized.', 500);
};

//create a new order with items. Calculates total amount. Uses transaction for atomicity.
export const createOrder = async ({ customer_id, items }) => {
  assertPool();

  if (!Array.isArray(items) || items.length === 0) {
    throw httpError('Order must have at least one item.', 400);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create order
    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (customer_id, total_amount) VALUES ($1, 0) RETURNING id`,
      [customer_id]
    );
    const orderId = orderRows[0].id;

    // Insert items and calculate total
    let totalAmount = 0;
    for (const item of items) {
      const { product_id, quantity, unit_price } = item;
      const itemTotal = quantity * unit_price;
      totalAmount += itemTotal;

      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, product_id, quantity, unit_price, itemTotal]
      );
    }

    // Update order with calculated total
    const { rows: updatedOrder } = await client.query(
      `UPDATE orders SET total_amount = $1 WHERE id = $2 RETURNING id, customer_id, created_at, total_amount`,
      [totalAmount, orderId]
    );

    await client.query('COMMIT');
    return updatedOrder[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Retrieve all orders (without items for list view).
export const getOrders = async () => {
  assertPool();
  const { rows } = await pool.query(
    `SELECT id, customer_id, created_at, total_amount FROM orders ORDER BY created_at DESC`
  );
  return rows;
};

// Retrieve single order with items.
export const getOrderById = async (id) => {
  assertPool();
  const { rows: orderRows } = await pool.query(
    'SELECT id, customer_id, created_at, total_amount FROM orders WHERE id = $1',
    [id]
  );
  if (!orderRows[0]) return null;

  const { rows: itemRows } = await pool.query(
    `SELECT id, product_id, quantity, unit_price, total FROM order_items WHERE order_id = $1`,
    [id]
  );

  return { order: orderRows[0], items: itemRows };
};

// Delete order and its items (cascades via foreign key). Logs deletion to MongoDB.
export const deleteOrder = async (id) => {
  assertPool();
  const { rowCount } = await pool.query('DELETE FROM orders WHERE id = $1', [id]);
  return rowCount > 0;
};
