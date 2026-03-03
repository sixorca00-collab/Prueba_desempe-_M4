import { pool } from '../config/postgresConfig.js';
import { httpError } from '../utils/httpError.js';

const assertPool = () => {
  if (!pool) throw httpError('Database connection is not initialized.', 500);
};

 //Create a new category (unique by name).
 
export const createCategory = async ({ name }) => {
  assertPool();
  try {
    const { rows } = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING id, name',
      [name]
    );
    return rows[0];
  } catch (error) {
    if (error.code === '23505') throw httpError('Category name already exists.', 409);
    throw error;
  }
};


 //Retrieve all categories.

export const getCategories = async () => {
  assertPool();
  const { rows } = await pool.query('SELECT id, name FROM categories ORDER BY id ASC');
  return rows;
};


//Retrieve a single category by ID.
 
export const getCategoryById = async (id) => {
  assertPool();
  const { rows } = await pool.query('SELECT id, name FROM categories WHERE id = $1', [id]);
  return rows[0] ?? null;
};


 // Update category name.

export const updateCategory = async (id, { name }) => {
  assertPool();
  try {
    const { rows } = await pool.query(
      'UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name',
      [name, id]
    );
    return rows[0] ?? null;
  } catch (error) {
    if (error.code === '23505') throw httpError('Category name already exists.', 409);
    throw error;
  }
};


 //Delete category.

export const deleteCategory = async (id) => {
  assertPool();
  const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  return rowCount > 0;
};
