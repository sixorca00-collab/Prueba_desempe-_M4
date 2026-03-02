import {
  createTransfer,
  deleteTransfer,
  getTransferById,
  getTransfers,
  updateTransfer
} from '../services/transferService.js';
import { parseId, requiredDateString } from '../utils/validators.js';

const parseTransferPayload = (body, { partial = false } = {}) => {
  const fecha = body?.fecha;

  if (partial && fecha === undefined) return { fecha: undefined };

  return {
    fecha: requiredDateString(fecha, 'date')
  };
};

export const createTransferHandler = async (req, res, next) => {
  try {
    const payload = parseTransferPayload(req.body);
    const transfer = await createTransfer(payload);
    res.status(201).json(transfer);
  } catch (error) {
    next(error);
  }
};

export const getTransfersHandler = async (_req, res, next) => {
  try {
    const transfers = await getTransfers();
    res.status(200).json(transfers);
  } catch (error) {
    next(error);
  }
};

export const getTransferByIdHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const transfer = await getTransferById(id);
    if (!transfer) return res.status(404).json({ message: 'Transfer not found.' });
    return res.status(200).json(transfer);
  } catch (error) {
    next(error);
  }
};

export const updateTransferHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const current = await getTransferById(id);
    if (!current) return res.status(404).json({ message: 'Transfer not found.' });

    const payload = parseTransferPayload(req.body, { partial: true });
    const updated = await updateTransfer(id, {
      fecha: payload.fecha ?? current.fecha
    });

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteTransferHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const deleted = await deleteTransfer(id);
    if (!deleted) return res.status(404).json({ message: 'Transfer not found.' });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
