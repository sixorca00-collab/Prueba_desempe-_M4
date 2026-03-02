import {
  getSuppliersAnalytics,
  getCustomerAnalytics,
  getCategoryTopProducts
} from '../services/analyticsService.js';
import { parseId } from '../utils/validators.js';

export const getSuppliersAnalyticsHandler = async (_req, res, next) => {
  try {
    const data = await getSuppliersAnalytics();
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getCustomerAnalyticsHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const data = await getCustomerAnalytics(id);
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getCategoryTopProductsHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const data = await getCategoryTopProducts(id);
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
