import express from 'express';
import clientRoutes from './routes/clientRoutes.js';
import productRoutes from './routes/productRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import transferRoutes from './routes/transferRoutes.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/api/clientes', clientRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/transferencias', transferRoutes);
app.use('/api/proveedores', providerRoutes);

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error.';
  res.status(status).json({ message });
});

export default app;
