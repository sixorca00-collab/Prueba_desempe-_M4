import { Router } from 'express';
import {
  createTransferHandler,
  deleteTransferHandler,
  getTransferByIdHandler,
  getTransfersHandler,
  updateTransferHandler
} from '../controllers/transferController.js';

const router = Router();

router.post('/', createTransferHandler);
router.get('/', getTransfersHandler);
router.get('/:id', getTransferByIdHandler);
router.put('/:id', updateTransferHandler);
router.delete('/:id', deleteTransferHandler);

export default router;
