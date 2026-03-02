import express from 'express';
import clientRoutes from './routes/clientRoutes.js';
import productRoutes from './routes/productRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

// Legacy routes (Spanish naming)
app.use('/api/clientS', clientRoutes);
app.use('/api/productS', productRoutes);
app.use('/api/transfS', transferRoutes);
app.use('/api/providers', providerRoutes);

// New normalized routes (English naming, 3NF)
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

// Analytics endpoints
app.use('/api/analytics', analyticsRoutes);

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error.';
  res.status(status).json({ message });
});

export default app;
