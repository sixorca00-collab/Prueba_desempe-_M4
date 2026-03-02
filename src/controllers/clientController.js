import {
  createClient,
  deleteClient,
  getClientById,
  getClients,
  updateClient
} from '../services/clientService.js';
import { httpError } from '../utils/httpError.js';
import { optionalString, parseId, requiredString } from '../utils/validators.js';

const parseClientPayload = (body, { partial = false } = {}) => {
  const nombre = body?.nombre;
  const email = body?.email;
  const telefono = body?.telefono;
  const direccion = body?.direccion;

  return {
    nombre: partial && nombre === undefined ? undefined : requiredString(nombre, 'nombre'),
    email: partial && email === undefined ? undefined : requiredString(email, 'email'),
    telefono: optionalString(telefono, 'telefono'),
    direccion: optionalString(direccion, 'direccion')
  };
};

export const createClientHandler = async (req, res, next) => {
  try {
    const payload = parseClientPayload(req.body);
    const client = await createClient(payload);
    res.status(201).json(client);
  } catch (error) {
    if (error.code === '23505') return next(httpError('email already exists.', 409));
    next(error);
  }
};

export const getClientsHandler = async (_req, res, next) => {
  try {
    const clients = await getClients();
    res.status(200).json(clients);
  } catch (error) {
    next(error);
  }
};

export const getClientByIdHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const client = await getClientById(id);
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado.' });
    return res.status(200).json(client);
  } catch (error) {
    next(error);
  }
};

export const updateClientHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const current = await getClientById(id);
    if (!current) return res.status(404).json({ message: 'Cliente no encontrado.' });

    const payload = parseClientPayload(req.body, { partial: true });
    const updated = await updateClient(id, {
      nombre: payload.nombre ?? current.nombre,
      email: payload.email ?? current.email,
      telefono: payload.telefono ?? current.telefono,
      direccion: payload.direccion ?? current.direccion
    });

    return res.status(200).json(updated);
  } catch (error) {
    if (error.code === '23505') return next(httpError('email already exists.', 409));
    next(error);
  }
};

export const deleteClientHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const deleted = await deleteClient(id);
    if (!deleted) return res.status(404).json({ message: 'Cliente no encontrado.' });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
