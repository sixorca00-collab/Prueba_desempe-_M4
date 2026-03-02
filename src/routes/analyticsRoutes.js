import express from 'express';
import {
  getSuppliersAnalyticsHandler,
  getCustomerAnalyticsHandler,
  getCategoryTopProductsHandler
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/suppliers', getSuppliersAnalyticsHandler);
router.get('/customer/:id', getCustomerAnalyticsHandler);
router.get('/category/:id/top-products', getCategoryTopProductsHandler);

export default router;
