import {
  createTransfer,
  deleteTransfer,
  getTransferById,
  getTransfers,
  updateTransfer
} from '../services/transferService.js';
import { parseId, requiredDateString } from '../utils/validators.js';

// Validate transfer payload for create and update operations.
const parseTransferPayload = (body, { partial = false } = {}) => {
  const order_date = body?.order_date;

  if (partial && order_date === undefined) return { order_date: undefined };

  return {
    order_date: requiredDateString(order_date, 'order_date')
  };
};

// Create a transfer.
export const createTransferHandler = async (req, res, next) => {
  try {
    const payload = parseTransferPayload(req.body);
    const transfer = await createTransfer(payload);
    res.status(201).json(transfer);
  } catch (error) {
    next(error);
  }
};

// Get all transfers.
export const getTransfersHandler = async (_req, res, next) => {
  try {
    const transfers = await getTransfers();
    res.status(200).json(transfers);
  } catch (error) {
    next(error);
  }
};

// Get one transfer by id.
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

// Update one transfer by id.
export const updateTransferHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const current = await getTransferById(id);
    if (!current) return res.status(404).json({ message: 'Transfer not found.' });

    const payload = parseTransferPayload(req.body, { partial: true });
    const updated = await updateTransfer(id, {
      order_date: payload.order_date ?? current.order_date
    });

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// Delete one transfer by id.
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
