import express from 'express';
import {
  createCategoryHandler,
  deleteCategoryHandler,
  getCategoryByIdHandler,
  getCategoriesHandler,
  updateCategoryHandler
} from '../controllers/categoryController.js';

const router = express.Router();

router.post('/', createCategoryHandler);
router.get('/', getCategoriesHandler);
router.get('/:id', getCategoryByIdHandler);
router.patch('/:id', updateCategoryHandler);
router.delete('/:id', deleteCategoryHandler);

export default router;
