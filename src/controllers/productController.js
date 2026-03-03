import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct
} from '../services/productService.js';
import { httpError } from '../utils/httpError.js';
import { optionalInteger, optionalNumber, parseId, requiredString } from '../utils/validators.js';

// Validate product payload for create and update operations.
const parseProductPayload = (body, { partial = false } = {}) => {
  const nombre_producto = body?.nombre_producto;
  const cantidad = body?.cantidad;
  const skun = body?.skun;
  const precio = body?.precio;

  return {
    nombre_producto:
      partial && nombre_producto === undefined
        ? undefined
        : requiredString(nombre_producto, 'nombre_producto'),
    cantidad: optionalInteger(cantidad, 'cantidad'),
    skun: partial && skun === undefined ? undefined : requiredString(skun, 'skun'),
    precio: optionalNumber(precio, 'precio')
  };
};

// Create a product.
export const createProductHandler = async (req, res, next) => {
  try {
    const payload = parseProductPayload(req.body);

    if (payload.cantidad === undefined) throw httpError('amount is required.', 400);
    if (payload.precio === undefined) throw httpError('price is required.', 400);

    const product = await createProduct(payload);
    res.status(201).json(product);
  } catch (error) {
    if (error.code === '23505') return next(httpError('skun already exists.', 409));
    next(error);
  }
};

// Get all products.
export const getProductsHandler = async (_req, res, next) => {
  try {
    const products = await getProducts();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// Get one product by id.
export const getProductByIdHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const product = await getProductById(id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    return res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// Update one product by id.
export const updateProductHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const current = await getProductById(id);
    if (!current) return res.status(404).json({ message: 'Product not found.' });

    const payload = parseProductPayload(req.body, { partial: true });
    const updated = await updateProduct(id, {
      nombre_producto: payload.nombre_producto ?? current.nombre_producto,
      cantidad: payload.cantidad ?? current.cantidad,
      skun: payload.skun ?? current.skun,
      precio: payload.precio ?? current.precio
    });

    return res.status(200).json(updated);
  } catch (error) {
    if (error.code === '23505') return next(httpError('skun already exists.', 409));
    next(error);
  }
};

// Delete one product by id.
export const deleteProductHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const deleted = await deleteProduct(id);
    if (!deleted) return res.status(404).json({ message: 'Product not found.' });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
