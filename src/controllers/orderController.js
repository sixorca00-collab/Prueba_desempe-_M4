import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders
} from '../services/orderService.js';
import { parseId, requiredString } from '../utils/validators.js';

const parseOrderPayload = (body) => {
  const { customer_id, items } = body;

  if (!customer_id || typeof customer_id !== 'number') {
    throw new Error('Customer ID is required and must be a number.');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order items is required and must be a non-empty array.');
  }

  for (const item of items) {
    if (!item.product_id || !item.quantity || !item.unit_price) {
      throw new Error('Each item requires product_id, quantity, and unit_price.');
    }
  }

  return { customer_id, items };
};

export const createOrderHandler = async (req, res, next) => {
  try {
    const payload = parseOrderPayload(req.body);
    const order = await createOrder(payload);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const getOrdersHandler = async (_req, res, next) => {
  try {
    const orders = await getOrders();
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderByIdHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const order = await getOrderById(id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    return res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const deleteOrderHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const deleted = await deleteOrder(id);
    if (!deleted) return res.status(404).json({ message: 'Order not found.' });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
