

CREATE SCHEMA IF NOT EXISTS megastore_juanolarte;
SET search_path TO megastore_juanolarte;


CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(30),
  direccion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre_producto VARCHAR(150) NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 0,
  skun VARCHAR(80) NOT NULL UNIQUE,
  precio NUMERIC(12, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS proveedores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  email VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS transferencias (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(40),
  address VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SUPPLIERS: Core entity for product suppliers
-- Normalized - unique name constraint to prevent duplication
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  email VARCHAR(150),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CATEGORIES: Classification of products
-- Normalized - independent entity, unique names
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE
);

-- PRODUCTS: Core product catalog
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name_product VARCHAR(200) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- INVENTORY: Separate table for quantity tracking (3NF decomposition)

CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT inventory_product_unique UNIQUE (product_id)
);

-- ORDERS: Customer purchases

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0
);

-- ORDER_ITEMS: Line items in orders (bridge table)

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL,
  total NUMERIC(14,2) NOT NULL
);


CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);


-- ============================================================
-- INSERCIONES DE DATOS
-- ============================================================

BEGIN;

-- 1️⃣ INSERT SUPPLIERS
INSERT INTO suppliers (name, email)
SELECT DISTINCT
    TRIM(supplier_name) as supplier_name,
    TRIM(COALESCE(supplier_email, '')) as supplier_email
FROM sales_raw
WHERE TRIM(supplier_name) <> ''
ON CONFLICT (name) DO NOTHING;

-- 2️⃣ INSERT CATEGORIES
INSERT INTO categories (name)
SELECT DISTINCT
    TRIM(product_category) as product_category
FROM sales_raw
WHERE TRIM(product_category) <> ''
ON CONFLICT (name) DO NOTHING;

-- 3️⃣ INSERT PRODUCTS
INSERT INTO products (name_product, sku, price, category_id, supplier_id)
SELECT DISTINCT
    TRIM(sr.product_name) as product_name,
    TRIM(sr.product_sku) as product_sku,
    COALESCE(sr.unit_price, 0) as unit_price,
    c.id as category_id,
    s.id as supplier_id
FROM sales_raw sr
LEFT JOIN categories c ON TRIM(c.name) = TRIM(sr.product_category)
LEFT JOIN suppliers s ON TRIM(s.name) = TRIM(sr.supplier_name)
WHERE TRIM(sr.product_sku) <> ''
ON CONFLICT (sku) DO NOTHING;

-- 4️⃣ INSERT CUSTOMERS
INSERT INTO customers (name, email, phone, address)
SELECT DISTINCT
    TRIM(sr.customer_name) as customer_name,
    TRIM(sr.customer_email) as customer_email,
    TRIM(COALESCE(sr.customer_phone, '')) as customer_phone,
    TRIM(COALESCE(sr.customer_address, '')) as customer_address
FROM sales_raw sr
WHERE TRIM(sr.customer_email) <> ''
ON CONFLICT (email) DO NOTHING;

-- 5️⃣ INSERT ORDERS
INSERT INTO orders (customer_id, total_amount)
SELECT
    c.id as customer_id,
    COALESCE(MAX(sr.total_value), 0) as total_amount
FROM sales_raw sr
INNER JOIN customers c ON TRIM(c.email) = TRIM(sr.customer_email)
WHERE TRIM(sr.customer_email) <> '' 
  AND sr.transaction_id IS NOT NULL
GROUP BY c.id, sr.transaction_id;

-- 6️⃣ INSERT ORDER_ITEMS
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total)
SELECT
    o.id as order_id,
    p.id as product_id,
    COALESCE(sr.quantity, 1) as quantity,
    COALESCE(sr.unit_price, 0) as unit_price,
    COALESCE((sr.quantity * sr.unit_price), 0) as total
FROM sales_raw sr
INNER JOIN customers c ON TRIM(c.email) = TRIM(sr.customer_email)
INNER JOIN orders o ON (o.customer_id = c.id AND o.id = (
    SELECT MAX(id) FROM orders WHERE customer_id = c.id
))
INNER JOIN products p ON TRIM(p.sku) = TRIM(sr.product_sku)
WHERE TRIM(sr.customer_email) <> ''
  AND TRIM(sr.product_sku) <> ''
  AND COALESCE(sr.quantity, 0) > 0;

-- 7️⃣ INSERT INVENTORY
INSERT INTO inventory (product_id, quantity)
SELECT
    p.id,
    COALESCE(sr.quantity_available, 0) as quantity
FROM sales_raw sr
INNER JOIN products p ON TRIM(p.sku) = TRIM(sr.product_sku)
WHERE COALESCE(sr.quantity_available, 0) >= 0
ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

COMMIT;

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
