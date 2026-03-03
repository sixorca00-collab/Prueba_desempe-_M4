import {
  createProvider,
  deleteProvider,
  getProviderById,
  getProviders,
  updateProvider
} from '../services/providerService.js';
import { httpError } from '../utils/httpError.js';
import { parseId, requiredString } from '../utils/validators.js';

// Validate provider payload for create and update operations.
const parseProviderPayload = (body, { partial = false } = {}) => {
  const nombre = body?.nombre;
  const email = body?.email;

  return {
    nombre: partial && nombre === undefined ? undefined : requiredString(nombre, 'nombre'),
    email: partial && email === undefined ? undefined : requiredString(email, 'email')
  };
};

// Create a provider.
export const createProviderHandler = async (req, res, next) => {
  try {
    const payload = parseProviderPayload(req.body);
    const provider = await createProvider(payload);
    res.status(201).json(provider);
  } catch (error) {
    if (error.code === '23505') return next(httpError('email already exists.', 409));
    next(error);
  }
};

// Get all providers.
export const getProvidersHandler = async (_req, res, next) => {
  try {
    const providers = await getProviders();
    res.status(200).json(providers);
  } catch (error) {
    next(error);
  }
};

// Get one provider by id.
export const getProviderByIdHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const provider = await getProviderById(id);
    if (!provider) return res.status(404).json({ message: 'Provider not found.' });
    return res.status(200).json(provider);
  } catch (error) {
    next(error);
  }
};

// Update one provider by id.
export const updateProviderHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const current = await getProviderById(id);
    if (!current) return res.status(404).json({ message: 'Provider not found.' });

    const payload = parseProviderPayload(req.body, { partial: true });
    const updated = await updateProvider(id, {
      nombre: payload.nombre ?? current.nombre,
      email: payload.email ?? current.email
    });

    return res.status(200).json(updated);
  } catch (error) {
    if (error.code === '23505') return next(httpError('email already exists.', 409));
    next(error);
  }
};

// Delete one provider by id.
export const deleteProviderHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const deleted = await deleteProvider(id);
    if (!deleted) return res.status(404).json({ message: 'Provider not found.' });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
