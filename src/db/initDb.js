import { pool } from '../config/postgresConfig.js';

// Create required tables for the activity if they do not exist.
export const initDb = async () => {
  if (!pool) {
    throw new Error('Postgres pool is not initialized.');
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      phone VARCHAR(30),
      address  VARCHAR(255)
    );
  `);

  await pool.query(`
    ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS name VARCHAR(120),
    ADD COLUMN IF NOT EXISTS email VARCHAR(150),
    ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
    ADD COLUMN IF NOT EXISTS address VARCHAR(255);
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'customers'
          AND column_name = 'full_name'
      ) THEN
        UPDATE customers
        SET name = COALESCE(name, full_name)
        WHERE name IS NULL;
      END IF;
    END
    $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE
    );
  `);

  await pool.query(`
    ALTER TABLE suppliers
    ADD COLUMN IF NOT EXISTS name VARCHAR(120),
    ADD COLUMN IF NOT EXISTS email VARCHAR(150);
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'suppliers'
          AND column_name = 'contact_email'
      ) THEN
        UPDATE suppliers
        SET email = COALESCE(email, contact_email)
        WHERE email IS NULL;
      END IF;
    END
    $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name_product VARCHAR(150) NOT NULL,
      amount INTEGER NOT NULL DEFAULT 0 CHECK (amount >= 0),
      skun VARCHAR(80) NOT NULL UNIQUE,
      price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0)
    );
  `);

  await pool.query(`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS name_product VARCHAR(150),
    ADD COLUMN IF NOT EXISTS amount INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS skun VARCHAR(80),
    ADD COLUMN IF NOT EXISTS price NUMERIC(12, 2) DEFAULT 0;
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'name'
      ) THEN
        UPDATE products
        SET name_product = COALESCE(name_product, name)
        WHERE name_product IS NULL;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'sku'
      ) THEN
        UPDATE products
        SET skun = COALESCE(skun, sku)
        WHERE skun IS NULL;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'unit_price'
      ) THEN
        UPDATE products
        SET price = COALESCE(price, unit_price)
        WHERE price IS NULL;
      END IF;
    END
    $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transacctions (
      id SERIAL PRIMARY KEY,
      order_date TIMESTAMP NOT NULL
    );
  `);

  await pool.query(`
    ALTER TABLE transacctions
    ADD COLUMN IF NOT EXISTS order_date TIMESTAMP;
  `);

  console.log('Database schema initialized successfully.');
};
