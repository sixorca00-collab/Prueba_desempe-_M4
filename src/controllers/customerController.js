import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer
} from '../services/customerService.js';
import { httpError } from '../utils/httpError.js';
import { optionalString, parseId, requiredString } from '../utils/validators.js';

const parseCustomerPayload = (body, { partial = false } = {}) => {
  const name = body?.name;
  const email = body?.email;
  const phone = body?.phone;
  const address = body?.address;

  return {
    name: partial && name === undefined ? undefined : requiredString(name, 'Customer name'),
    email: partial && email === undefined ? undefined : requiredString(email, 'Email'),
    phone: optionalString(phone, 'Phone'),
    address: optionalString(address, 'Address')
  };
};

export const createCustomerHandler = async (req, res, next) => {
  try {
    const payload = parseCustomerPayload(req.body);
    const customer = await createCustomer(payload);
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

export const getCustomersHandler = async (_req, res, next) => {
  try {
    const customers = await getCustomers();
    res.status(200).json(customers);
  } catch (error) {
    next(error);
  }
};

export const getCustomerByIdHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const customer = await getCustomerById(id);
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });
    return res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomerHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const current = await getCustomerById(id);
    if (!current) return res.status(404).json({ message: 'Customer not found.' });

    const payload = parseCustomerPayload(req.body, { partial: true });
    const updated = await updateCustomer(id, {
      name: payload.name ?? current.name,
      email: payload.email ?? current.email,
      phone: payload.phone ?? current.phone,
      address: payload.address ?? current.address
    });

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomerHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const deleted = await deleteCustomer(id);
    if (!deleted) return res.status(404).json({ message: 'Customer not found.' });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
