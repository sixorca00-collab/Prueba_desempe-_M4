import app from './app.js';
import { env } from './config/env.js';
import { conectPostgres } from './config/postgresConfig.js';
import { connectMongo } from './config/mongoConfig.js';
import { initDb } from './db/initDb.js';

const startServer = async () => {
  try {
    await conectPostgres();
    await initDb();

    if (env.MONGO.URI) {
      await connectMongo();
    } else {
      console.warn('MONGO_URI_DB no configurada: se omite conexion a MongoDB.');
    }

    app.listen(env.APP_PORT, () => {
      console.log(`Server running on port: ${env.APP_PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
};

startServer();
