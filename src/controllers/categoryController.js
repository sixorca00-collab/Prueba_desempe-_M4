import {
  createCategory,
  deleteCategory,
  getCategoryById,
  getCategories,
  updateCategory
} from '../services/categoryService.js';
import { parseId, requiredString } from '../utils/validators.js';

const parseCategoryPayload = (body, { partial = false } = {}) => {
  const name = body?.name;
  return {
    name: partial && name === undefined ? undefined : requiredString(name, 'Category name')
  };
};

export const createCategoryHandler = async (req, res, next) => {
  try {
    const payload = parseCategoryPayload(req.body);
    const category = await createCategory(payload);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const getCategoriesHandler = async (_req, res, next) => {
  try {
    const categories = await getCategories();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryByIdHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const category = await getCategoryById(id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    return res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategoryHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const current = await getCategoryById(id);
    if (!current) return res.status(404).json({ message: 'Category not found.' });

    const payload = parseCategoryPayload(req.body, { partial: true });
    const updated = await updateCategory(id, {
      name: payload.name ?? current.name
    });

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryHandler = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const deleted = await deleteCategory(id);
    if (!deleted) return res.status(404).json({ message: 'Category not found.' });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
