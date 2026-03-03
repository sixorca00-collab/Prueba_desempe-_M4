import 'dotenv/config';

// Centralized environment variables used by the app.
export const env = {
  APP_PORT: Number(process.env.APP_PORT) || 3000,
  DB: {
    HOST: process.env.DB_HOST,
    PORT: Number(process.env.DB_PORT) || 5432,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PWD,
    NAME: process.env.DB_NAME
  }
};
