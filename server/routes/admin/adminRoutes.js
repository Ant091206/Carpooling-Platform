import express from 'express';
import { body, param, query } from 'express-validator';
import adminController from '../../controllers/admin/adminController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';

const router = express.Router();

// Require JWT authentication & ADMIN role for all routes in this router
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

/**
 * Dashboard Overview
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * User Management
 */
router.get(
  '/users',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('role').optional().isIn(['ADMIN', 'EMPLOYEE']),
    query('status').optional().isIn(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']),
  ],
  validateRequest,
  adminController.getUsers
);

router.get(
  '/users/:id',
  [param('id').isInt({ min: 1 }).withMessage('Valid user ID is required.')],
  validateRequest,
  adminController.getUserById
);

router.patch(
  '/users/:id/status',
  [
    param('id').isInt({ min: 1 }).withMessage('Valid user ID is required.'),
    body('status').isIn(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']).withMessage('Valid status is required.'),
  ],
  validateRequest,
  adminController.updateUserStatus
);

/**
 * Ride Management
 */
router.get(
  '/rides',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('status').optional().isIn(['Scheduled', 'Started', 'InProgress', 'Completed', 'Cancelled']),
  ],
  validateRequest,
  adminController.getRides
);

router.get(
  '/rides/:id',
  [param('id').isInt({ min: 1 }).withMessage('Valid ride ID is required.')],
  validateRequest,
  adminController.getRideById
);

/**
 * Payments & Financial Audit
 */
router.get(
  '/payments',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('method').optional().isIn(['WALLET', 'CASH', 'UPI', 'RAZORPAY']),
    query('status').optional().isIn(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']),
  ],
  validateRequest,
  adminController.getPayments
);

/**
 * Analytics
 */
router.get('/analytics', adminController.getAnalytics);

/**
 * Announcements CRUD
 */
router.get('/announcements', adminController.getAnnouncements);

router.post(
  '/announcements',
  [
    body('title').isString().notEmpty().withMessage('Announcement title is required.'),
    body('message').isString().notEmpty().withMessage('Announcement message is required.'),
    body('isActive').optional().isBoolean(),
  ],
  validateRequest,
  adminController.createAnnouncement
);

router.put(
  '/announcements/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Valid announcement ID is required.'),
    body('title').optional().isString().notEmpty(),
    body('message').optional().isString().notEmpty(),
    body('isActive').optional().isBoolean(),
  ],
  validateRequest,
  adminController.updateAnnouncement
);

router.delete(
  '/announcements/:id',
  [param('id').isInt({ min: 1 }).withMessage('Valid announcement ID is required.')],
  validateRequest,
  adminController.deleteAnnouncement
);

/**
 * Activity Logs
 */
router.get('/activity-logs', adminController.getActivityLogs);

export default router;
