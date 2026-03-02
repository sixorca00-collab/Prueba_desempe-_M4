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

app.use('/api/clientS', clientRoutes);
app.use('/api/productS', productRoutes);
app.use('/api/transfS', transferRoutes);
app.use('/api/providers', providerRoutes);

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error.';
  res.status(status).json({ message });
});

export default app;
