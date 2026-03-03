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
    CREATE TABLE IF NOT EXISTS providers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE
    );
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
    CREATE TABLE IF NOT EXISTS transacctions| (
      id SERIAL PRIMARY KEY,
      order_date TIMESTAMP NOT NULL
    );
  `);

  console.log('Database schema initialized successfully.');
};
