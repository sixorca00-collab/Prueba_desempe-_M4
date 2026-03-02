import { pool } from '../config/postgresConfig.js';

export const initDb = async () => {
  if (!pool) {
    throw new Error('Postgres pool is not initialized.');
  }

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
    CREATE TABLE IF NOT EXISTS transferencias (
      id SERIAL PRIMARY KEY,
      fecha TIMESTAMP NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS proveedores (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(120) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE
    );
  `);
};
