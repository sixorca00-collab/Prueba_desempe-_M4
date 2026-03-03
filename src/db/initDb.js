import { pool } from '../config/postgresConfig.js';

export const initDb = async () => {
  if (!pool) throw new Error('Postgres pool is not initialized.');

  try {
    // Legacy tables (kept for backwards compatibility with existing imports)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(120) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        telefono VARCHAR(30),
        direccion VARCHAR(255)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre_producto VARCHAR(150) NOT NULL,
        cantidad INTEGER NOT NULL DEFAULT 0,
        skun VARCHAR(80) NOT NULL UNIQUE,
        precio NUMERIC(12, 2) NOT NULL DEFAULT 0
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS proveedores (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(120) NOT NULL UNIQUE,
        email VARCHAR(150)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transferencias (
        id SERIAL PRIMARY KEY,
        fecha TIMESTAMP NOT NULL
      );
    `);

    // Create base entities FIRST (no foreign keys in CREATE)

    // Customers: core customer entity
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        phone VARCHAR(40),
        address VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);

    // Suppliers: core supplier entity (MUST exist before products references it)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        email VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);

    // Categories: product classification (MUST exist before products references it)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE
      );
    `);

    // Products: product catalog (WITHOUT foreign keys initially)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name_product VARCHAR(200) NOT NULL,
        sku VARCHAR(100) NOT NULL UNIQUE,
        price NUMERIC(12, 2) NOT NULL DEFAULT 0,
        supplier_id INTEGER,
        category_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);

    // Add foreign key constraints separately to avoid creation order issues
    await pool.query(`
      ALTER TABLE products
      ADD CONSTRAINT fk_products_supplier 
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
    `).catch(() => {
      // Constraint may already exist, ignore error
    });

    await pool.query(`
      ALTER TABLE products
      ADD CONSTRAINT fk_products_category 
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    `).catch(() => {
      // Constraint may already exist, ignore error
    });

    // Inventory: product stock (one-to-one with products)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL UNIQUE,
        quantity INTEGER NOT NULL DEFAULT 0
      );
    `);

    await pool.query(`
      ALTER TABLE inventory
      ADD CONSTRAINT fk_inventory_product 
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    `).catch(() => {
      // Constraint may already exist, ignore error
    });

    // Orders: customer purchases (WITHOUT foreign keys initially)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0
      );
    `);

    await pool.query(`
      ALTER TABLE orders
      ADD CONSTRAINT fk_orders_customer 
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    `).catch(() => {
      // Constraint may already exist, ignore error
    });

    // Order Items: line items in orders (WITHOUT foreign keys initially)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price NUMERIC(12, 2) NOT NULL,
        total NUMERIC(14, 2) NOT NULL
      );
    `);

    await pool.query(`
      ALTER TABLE order_items
      ADD CONSTRAINT fk_order_items_order 
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    `).catch(() => {
      // Constraint may already exist, ignore error
    });

    await pool.query(`
      ALTER TABLE order_items
      ADD CONSTRAINT fk_order_items_product 
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    `).catch(() => {
      // Constraint may already exist, ignore error
    });

    // Create indexes for performance
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);`);

    console.log('Database schema initialized successfully.');
  } catch (error) {
    console.error('Database initialization error:', error.message);
    throw error;
  }
};
