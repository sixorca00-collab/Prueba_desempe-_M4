import { Pool } from 'pg';
import { env } from './env.js';

// Shared PostgreSQL pool instance.
export let pool;

// Create and validate the PostgreSQL connection.
export const connectPostgres = async () => {
  const poolPg = new Pool({
    host: env.DB.HOST,
    port: env.DB.PORT,
    database: env.DB.NAME,
    user: env.DB.USER,
    password: env.DB.PASSWORD
  });

  await poolPg.query('SELECT 1');
  pool = poolPg;
  console.log('Postgres connected successfully.');
};
