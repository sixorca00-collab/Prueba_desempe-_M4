import express from 'express';
import {
  createCustomerHandler,
  deleteCustomerHandler,
  getCustomerByIdHandler,
  getCustomersHandler,
  updateCustomerHandler
} from '../controllers/customerController.js';

const router = express.Router();

router.post('/', createCustomerHandler);
router.get('/', getCustomersHandler);
router.get('/:id', getCustomerByIdHandler);
router.patch('/:id', updateCustomerHandler);
router.delete('/:id', deleteCustomerHandler);

export default router;
