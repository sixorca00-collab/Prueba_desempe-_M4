import { Router } from 'express';
import {
  createClientHandler,
  deleteClientHandler,
  getClientByIdHandler,
  getClientsHandler,
  updateClientHandler
} from '../controllers/clientController.js';

const router = Router();

router.post('/', createClientHandler);
router.get('/', getClientsHandler);
router.get('/:id', getClientByIdHandler);
router.put('/:id', updateClientHandler);
router.delete('/:id', deleteClientHandler);

export default router;
