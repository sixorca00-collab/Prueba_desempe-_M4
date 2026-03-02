-- ============================================================================
-- MegaStore Global Database Structure - PostgreSQL (3NF Normalized)
-- ============================================================================
-- Author: Senior Backend Engineer
-- Date: 2026-03-02
-- Purpose: Migration from unnormalized Excel data to relational database (3NF)
--
-- NORMALIZATION APPROACH:
-- - Legacy Spanish-named tables kept for backwards compatibility
-- - New English-named tables created with proper normalization
-- - All tables enforce 3NF constraints and referential integrity
--
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS megastore_juanolarte;
SET search_path TO megastore_juanolarte;

-- ============================================================================
-- LEGACY TABLES (Spanish naming, kept for backwards compatibility)
-- ============================================================================

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

-- ============================================================================
-- NORMALIZED TABLES (English naming, 3NF)
-- ============================================================================

-- CUSTOMERS: Core entity for clients
-- Normalized - no redundancy, unique email constraint
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
-- 3NF: depends on supplier_id and category_id (foreign keys)
-- SKU is unique identifier
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
-- Non-key attributes dedicated to inventory management
-- One-to-one relationship with products
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT inventory_product_unique UNIQUE (product_id)
);

-- ORDERS: Customer purchases
-- 3NF: customer_id is foreign key, total_amount calculated
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0
);

-- ORDER_ITEMS: Line items in orders (bridge table)
-- 3NF: separates order from products, many-to-many through this table
-- Includes unit_price snapshot to preserve historical data
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL,
  total NUMERIC(14,2) NOT NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
