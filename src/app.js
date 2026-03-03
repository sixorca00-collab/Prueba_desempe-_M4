import express from 'express';
import clientRoutes from './routes/clientRoutes.js';
import productRoutes from './routes/productRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import providerRoutes from './routes/providerRoutes.js';

// Create the Express application instance.
const app = express();

// Parse incoming JSON payloads.
app.use(express.json());

// Basic endpoint to verify that the API is up.
app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

// Mount business routes by resource.
app.use('/api/clientes', clientRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/transferencias', transferRoutes);
app.use('/api/proveedores', providerRoutes);

// Global error handler.
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error.';
  res.status(status).json({ message });
});

export default app;
