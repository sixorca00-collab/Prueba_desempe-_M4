import express from 'express';
import {
  createOrderHandler,
  deleteOrderHandler,
  getOrderByIdHandler,
  getOrdersHandler
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrderHandler);
router.get('/', getOrdersHandler);
router.get('/:id', getOrderByIdHandler);
router.delete('/:id', deleteOrderHandler);

export default router;
