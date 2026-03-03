-- CUSTOMERS

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- SUPPLIERS

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- CATEGORIES

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);


-- PRODUCTS

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ORDERS

CREATE TABLE IF NOT EXISTS transacctions (
    id SERIAL PRIMARY KEY,
    transaction_code VARCHAR(100) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    order_date DATE NOT NULL,
    total_amount NUMERIC(14,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ORDER ITEMS

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(14,2)
);

COMMIT;


-- INSERT SUPPLIERS
INSERT INTO suppliers (name, email)
SELECT DISTINCT
    supplier_name,
    supplier_email
FROM sales_raw
WHERE supplier_name IS NOT NULL
ON CONFLICT (name) DO NOTHING;

--  INSERT CATEGORIES
INSERT INTO categories (name)
SELECT DISTINCT
    product_category
FROM sales_raw
WHERE product_category IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- INSERT PRODUCTS
INSERT INTO products (name_product, sku, price, category_id, supplier_id)
SELECT DISTINCT
    sr.product_name,
    sr.product_sku,
    sr.unit_price,
    c.id as category_id,
    s.id as supplier_id
FROM sales_raw sr
LEFT JOIN categories c ON c.name = sr.product_category
LEFT JOIN suppliers s ON s.name = sr.supplier_name
WHERE sr.product_sku IS NOT NULL
ON CONFLICT (sku) DO NOTHING;

--  INSERT CUSTOMERS
INSERT INTO customers (name, email, phone, address)
SELECT DISTINCT
    sr.customer_name,
    sr.customer_email,
    sr.customer_phone,
    sr.customer_address
FROM sales_raw sr
WHERE sr.customer_email IS NOT NULL
ON CONFLICT (email) DO NOTHING;

-- INSERT ORDERS
INSERT INTO orders (customer_id, total_amount)
SELECT
    c.id as customer_id,
    MAX(sr.total_value) as total_amount
FROM sales_raw sr
INNER JOIN customers c ON c.email = sr.customer_email
WHERE sr.transaction_id IS NOT NULL AND sr.customer_email IS NOT NULL
GROUP BY c.id, sr.transaction_id;

--  INSERT ORDER_ITEMS
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total)
SELECT
    o.id as order_id,
    p.id as product_id,
    sr.quantity,
    sr.unit_price,
    (sr.quantity * sr.unit_price) as total
FROM sales_raw sr
INNER JOIN customers c ON c.email = sr.customer_email
INNER JOIN orders o ON o.customer_id = c.id
INNER JOIN products p ON p.sku = sr.product_sku
WHERE sr.quantity > 0 AND sr.unit_price > 0 
  AND sr.customer_email IS NOT NULL AND sr.product_sku IS NOT NULL;



COMMIT;