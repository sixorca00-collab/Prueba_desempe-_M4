import { httpError } from './httpError.js';

// Parse and validate a numeric id parameter.
export const parseId = (idParam) => {
  const id = Number.parseInt(idParam, 10);

  if (!Number.isInteger(id) || id < 1) {
    throw httpError('id must be a positive integer.', 400);
  }

  return id;
};

// Validate a required non-empty string.
export const requiredString = (value, fieldName) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw httpError(`${fieldName} is required and must be a non-empty string.`, 400);
  }

  return value.trim();
};

// Validate an optional string.
export const optionalString = (value, fieldName) => {
  if (value === undefined) return undefined;
  if (value === null) return null;

  if (typeof value !== 'string') {
    throw httpError(`${fieldName} must be a string.`, 400);
  }

  return value.trim();
};

// Validate an optional integer.
export const optionalInteger = (value, fieldName) => {
  if (value === undefined) return undefined;

  if (!Number.isInteger(value)) {
    throw httpError(`${fieldName} must be an integer.`, 400);
  }

  return value;
};

// Validate an optional numeric value.
export const optionalNumber = (value, fieldName) => {
  if (value === undefined) return undefined;

  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw httpError(`${fieldName} must be a valid number.`, 400);
  }

  return value;
};

// Validate a required date string.
export const requiredDateString = (value, fieldName) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw httpError(`${fieldName} is required and must be a valid date string.`, 400);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw httpError(`${fieldName} must be a valid date string.`, 400);
  }

  return value;
};
