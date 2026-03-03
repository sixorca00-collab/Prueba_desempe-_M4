import app from './app.js';
import { env } from './config/env.js';
import { connectPostgres } from './config/postgresConfig.js';
import { initDb } from './db/initDb.js';

// Start the API after the database connection is ready.
const startServer = async () => {
  try {
    await connectPostgres();
    await initDb();

    app.listen(env.APP_PORT, () => {
      console.log(`Server running on port: ${env.APP_PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
};

startServer();
