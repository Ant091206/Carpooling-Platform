import rateLimit from 'express-rate-limit';
import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

/**
 * General API Rate Limiter — 500 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

/**
 * Auth Rate Limiter — 30 authentication requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  }
});

/**
 * Maintenance Mode Middleware
 * Checks if maintenance mode is enabled in system_settings table
 */
export const checkMaintenanceMode = async (req, res, next) => {
  try {
    // Skip maintenance check for health/status and system administration endpoints
    if (req.path.startsWith('/api/health') || req.path.startsWith('/api/status') || req.path.startsWith('/api/system') || req.path.startsWith('/api/auth/login')) {
      return next();
    }

    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'maintenance_mode' }
    });

    if (setting && (setting.value === 'true' || setting.value === '1')) {
      // Allow ADMIN users through if authenticated
      if (req.user && req.user.role === 'ADMIN') {
        return next();
      }
      return res.status(503).json({
        success: false,
        message: 'System is currently undergoing scheduled maintenance. Please try again later.'
      });
    }

    next();
  } catch (error) {
    next(); // Don't block requests if DB query fails
  }
};

/**
 * Basic Input Sanitization Guard
 */
export const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Strip control characters & dangerous script tags
        req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    }
  }
  next();
};

export default {
  apiLimiter,
  authLimiter,
  checkMaintenanceMode,
  sanitizeInput
};
