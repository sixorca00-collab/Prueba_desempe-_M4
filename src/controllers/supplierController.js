import {
  createSupplier,
  deleteSupplier,
  getSupplierById,
  getSuppliers,
  updateSupplier
} from '../services/supplierService.js';
import { httpError } from '../utils/httpError.js';
import { optionalString, parseId, requiredString } from '../utils/validators.js';

const parseSupplierPayload = (body, { partial = false } = {}) => {
  const name = body?.name;
  const email = body?.email;

  return {
    name: partial && name === undefined ? undefined : requiredString(name, 'Supplier name'),
    email: optionalString(email, 'Email')
  };
};

export const createSupplierHandler = async (req, res, next) => {
  try {
    const payload = parseSupplierPayload(req.body);
    const supplier = await createSupplier(payload);
    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

export const getSuppliersHandler = async (_req, res, next) => {
  try {
    const suppliers = await getSuppliers();
    res.status(200).json(suppliers);
  } catch (error) {
    next(error);
  }
};

export const getSupplierByIdHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const supplier = await getSupplierById(id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found.' });
    return res.status(200).json(supplier);
  } catch (error) {
    next(error);
  }
};

export const updateSupplierHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const current = await getSupplierById(id);
    if (!current) return res.status(404).json({ message: 'Supplier not found.' });

    const payload = parseSupplierPayload(req.body, { partial: true });
    const updated = await updateSupplier(id, {
      name: payload.name ?? current.name,
      email: payload.email ?? current.email
    });

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteSupplierHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const deleted = await deleteSupplier(id);
    if (!deleted) return res.status(404).json({ message: 'Supplier not found.' });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
