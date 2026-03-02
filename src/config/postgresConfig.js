import { Pool } from 'pg';
import { env } from './env.js';

export let pool;

export const conectPostgres = async () => {
  try {
    const poolPg = new Pool({
      host: env.DB.HOST,
      port: env.DB.PORT,
      database: env.DB.NAME,
      user: env.DB.USER,
      password: env.DB.PASSWORD
    });

    await poolPg.query('SELECT 1');
    console.log('Postgres connected successfully.');
    pool = poolPg;
  } catch (error) {
    console.error('Error connecting to Postgres:', error.message);
    throw error;
  }
};
