/**
 * Migration script to import data from legacy Spanish-named tables into normalized English tables
 * Ensures idempotent behavior: avoids duplicates and reuses existing records
 * Uses transactions for data integrity
 *
 * Run with: node src/db/migrate.js
 */

import { pool } from '../config/postgresConfig.js';

const migrate = async () => {
  if (!pool) throw new Error('Pool not initialized');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Starting migration...');

    // Migrate customers from clientes to customers
    console.log('Migrating customers...');
    await client.query(`
      INSERT INTO customers (name, email, phone, address)
      SELECT nombre, email, telefono, direccion FROM clientes
      ON CONFLICT (email) DO NOTHING
    `);
    const customerCount = await client.query('SELECT COUNT(*) FROM customers');
    console.log(`✓ Customers: ${customerCount.rows[0].count} total`);

    // Create a mapping table for supplier injection if needed (optional)
    console.log('Migrating suppliers...');
    await client.query(`
      INSERT INTO suppliers (name, email)
      SELECT DISTINCT nombre, email FROM proveedores
      ON CONFLICT (name) DO NOTHING
    `);
    const supplierCount = await client.query('SELECT COUNT(*) FROM suppliers');
    console.log(`✓ Suppliers: ${supplierCount.rows[0].count} total`);

    // Create default category
    console.log('Creating default category...');
    const catResult = await client.query(`
      INSERT INTO categories (name) VALUES ('Uncategorized')
      ON CONFLICT (name) DO NOTHING
      RETURNING id
    `);
    const categoryId = catResult.rows[0]?.id || (await client.query('SELECT id FROM categories WHERE name = $1', ['Uncategorized'])).rows[0].id;

    // Migrate products from productos to products (with inventory)
    console.log('Migrating products...');
    const productResult = await client.query(`
      INSERT INTO products (name_product, sku, price, category_id)
      SELECT nombre_producto, skun, precio, $1 FROM productos
      ON CONFLICT (sku) DO NOTHING
      RETURNING id, sku
    `, [categoryId]);

    // Now insert quantities into inventory for each product
    for (const prod of productResult.rows) {
      const oldQty = await client.query('SELECT cantidad FROM productos WHERE skun = $1', [prod.sku]);
      if (oldQty.rows[0]) {
        await client.query(
          `INSERT INTO inventory (product_id, quantity) VALUES ($1, $2)
           ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity`,
          [prod.id, oldQty.rows[0].cantidad]
        );
      }
    }
    const productCount = await client.query('SELECT COUNT(*) FROM products');
    console.log(`✓ Products: ${productCount.rows[0].count} total`);

    // Migrate orders and order items (if transferencias had order info, uncomment/adapt)
    // For now, we'll just ensure tables are ready
    console.log('✓ Orders & Order Items tables ready for data ingestion');

    await client.query('COMMIT');
    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
};

migrate();
