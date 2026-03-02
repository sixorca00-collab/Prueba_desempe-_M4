import { Router } from 'express';
import {
  createProductHandler,
  deleteProductHandler,
  getProductByIdHandler,
  getProductsHandler,
  updateProductHandler
} from '../controllers/productController.js';

const router = Router();

router.post('/', createProductHandler);
router.get('/', getProductsHandler);
router.get('/:id', getProductByIdHandler);
router.put('/:id', updateProductHandler);
router.delete('/:id', deleteProductHandler);

export default router;
