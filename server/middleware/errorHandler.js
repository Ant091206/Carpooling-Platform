import logger from '../utils/logger.js';
import { errorResponse } from '../utils/responseHelper.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled error during ${req.method} ${req.originalUrl}`, err);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'An unexpected error occurred on the server.'
    : err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode, err.errors || null);
};

export default errorHandler;
