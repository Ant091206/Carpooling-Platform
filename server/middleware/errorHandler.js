import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If the error is not a custom ApiError instance, wrap it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors, err.stack);
  }

  // Log error using custom logger
  logger.error(`${req.method} ${req.originalUrl} - Unhandled Exception`, error);

  // Return the error response exactly matching the specified design payload format
  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV !== 'production' && error.errors && error.errors.length ? { errors: error.errors } : {})
  });
};

export default errorHandler;
