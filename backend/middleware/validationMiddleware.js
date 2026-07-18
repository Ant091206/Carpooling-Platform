import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Collect error messages into a single user-friendly list description string
    const errorMessages = errors.array().map((err) => err.msg).join(', ');
    throw new ApiError(400, `Validation failed: ${errorMessages}`, errors.array());
  }
  next();
};

export default validateRequest;
