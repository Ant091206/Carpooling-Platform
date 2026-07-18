import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import { jwtConfig } from '../config/jwt.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Access denied. Authentication token missing or malformed.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.accessSecret);
    req.user = decoded; // Contains user ID, email, organization_id, and role
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token has expired. Please refresh token.');
    }
    throw new ApiError(401, 'Invalid or corrupted access token.');
  }
};

export default authMiddleware;
