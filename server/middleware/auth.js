import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/responseHelper.js';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authentication token missing or malformed', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_carpooling_key_12345');
    req.user = decoded; // Contains id, email, role, etc.
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Authentication token expired', 401);
    }
    return errorResponse(res, 'Invalid or untrusted authentication token', 403);
  }
};

/**
 * Role authorization builder
 * @param {string[]} roles Allowed roles (e.g. ['admin', 'driver', 'passenger'])
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'User authentication context not found', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Access denied. You do not have permissions for this action', 403);
    }

    next();
  };
};

export default {
  authenticateJWT,
  authorizeRoles
};
