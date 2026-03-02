import express from 'express';
import { conectPostgres } from './config/postgresConfig.js';
import { connectMongo } from './config/mongoConfig';

connectMongo();
    await conectPostgres();

const app = express();
app.use(express.json);