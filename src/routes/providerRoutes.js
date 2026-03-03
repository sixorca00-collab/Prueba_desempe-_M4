import { Router } from 'express';
import {
  createProviderHandler,
  deleteProviderHandler,
  getProviderByIdHandler,
  getProvidersHandler,
  updateProviderHandler
} from '../controllers/providerController.js';

// Define HTTP routes for providers.
const router = Router();

router.post('/', createProviderHandler);
router.get('/', getProvidersHandler);
router.get('/:id', getProviderByIdHandler);
router.put('/:id', updateProviderHandler);
router.delete('/:id', deleteProviderHandler);

export default router;
