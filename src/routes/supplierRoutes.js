import express from 'express';
import {
  createSupplierHandler,
  deleteSupplierHandler,
  getSupplierByIdHandler,
  getSuppliersHandler,
  updateSupplierHandler
} from '../controllers/supplierController.js';

const router = express.Router();

router.post('/', createSupplierHandler);
router.get('/', getSuppliersHandler);
router.get('/:id', getSupplierByIdHandler);
router.patch('/:id', updateSupplierHandler);
router.delete('/:id', deleteSupplierHandler);

export default router;
