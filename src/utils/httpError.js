// Build a standard HTTP error object with custom status code.
export const httpError = (message, status = 500) => {
  const error = new Error(message);
  error.status = status;
  return error;
};
