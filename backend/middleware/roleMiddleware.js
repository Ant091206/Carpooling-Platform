import ApiError from '../utils/ApiError.js';

/**
 * Verify user roles permission guard builder
 * @param {...string} roles Allowed roles list (e.g. 'ADMIN', 'EMPLOYEE')
 */
export const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication credentials not set.');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Access denied. You do not have permissions for this resource.');
    }

    next();
  };
};

export default roleMiddleware;
