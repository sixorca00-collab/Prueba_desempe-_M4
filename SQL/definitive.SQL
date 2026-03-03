-- Create and select the project schema.
CREATE SCHEMA IF NOT EXISTS megastore_juanolarte;
SET search_path TO megastore_juanolarte;

-- Drop tables in dependency-safe order for a clean reset (optional).
-- DROP TABLE IF EXISTS transferencias;
-- DROP TABLE IF EXISTS productos;
-- DROP TABLE IF EXISTS proveedores;
-- DROP TABLE IF EXISTS clientes;

-- Core table for clients.
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(30),
  direccion VARCHAR(255)
);

-- Core table for providers.
CREATE TABLE IF NOT EXISTS proveedores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE
);

-- Core table for products.
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre_producto VARCHAR(150) NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  skun VARCHAR(80) NOT NULL UNIQUE,
  precio NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (precio >= 0)
);

-- Core table for transfers.
CREATE TABLE IF NOT EXISTS transferencias (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMP NOT NULL
);

-- Useful indexes for common lookups.
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_proveedores_email ON proveedores(email);
CREATE INDEX IF NOT EXISTS idx_productos_skun ON productos(skun);
CREATE INDEX IF NOT EXISTS idx_transferencias_fecha ON transferencias(fecha);

-- Minimal seed data (optional).
-- INSERT INTO clientes (nombre, email, telefono, direccion)
-- VALUES ('Juan Olarte', 'juan@example.com', '3000000000', 'Calle 123')
-- ON CONFLICT (email) DO NOTHING;
