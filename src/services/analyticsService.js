import { pool } from '../config/postgresConfig.js';
import { httpError } from '../utils/httpError.js';

const assertPool = () => {
  if (!pool) throw httpError('Database connection is not initialized.', 500);
};

export const getSuppliersAnalytics = async () => {
  assertPool();

  // For each supplier compute total sold value and current inventory value
  const { rows } = await pool.query(
    `SELECT
       s.id as supplier_id,
       s.name as supplier_name,
       COALESCE(sold.total_quantity, 0) as total_quantity_sold,
       COALESCE(sold.total_revenue, 0) as total_revenue,
       COALESCE(inv.inventory_value, 0) as inventory_value
     FROM suppliers s
     LEFT JOIN (
       SELECT p.supplier_id,
              SUM(oi.quantity) as total_quantity,
              SUM(oi.quantity * oi.unit_price) as total_revenue
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       GROUP BY p.supplier_id
     ) as sold ON sold.supplier_id = s.id
     LEFT JOIN (
       SELECT p.supplier_id,
              SUM(i.quantity * p.price) as inventory_value
       FROM inventory i
       JOIN products p ON p.id = i.product_id
       GROUP BY p.supplier_id
     ) as inv ON inv.supplier_id = s.id
     ORDER BY s.id`
  );

  return rows;
};

export const getCustomerAnalytics = async (customerId) => {
  assertPool();

  // Retrieve orders with items and totals per order
  const { rows } = await pool.query(
    `SELECT o.id as order_id, o.created_at, o.total_amount,
       json_agg(json_build_object('product_id', p.id, 'name', p.name_product, 'quantity', oi.quantity, 'unit_price', oi.unit_price, 'total', oi.total)) as items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE o.customer_id = $1
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [customerId]
  );

  return rows;
};

export const getCategoryTopProducts = async (categoryId) => {
  assertPool();

  const { rows } = await pool.query(
    `SELECT p.id as product_id, p.name_product, SUM(oi.quantity * oi.unit_price) as revenue, SUM(oi.quantity) as quantity_sold
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE p.category_id = $1
     GROUP BY p.id
     ORDER BY revenue DESC
     LIMIT 10`,
    [categoryId]
  );

  return rows;
};
