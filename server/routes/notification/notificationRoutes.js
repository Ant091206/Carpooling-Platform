import express from 'express';
import { param, query } from 'express-validator';
import notificationController from '../../controllers/notification/notificationController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';

const router = express.Router();

// ─── Notification CRUD ──────────────────────────────────────────────────────

// GET /api/notifications — paginated list
router.get(
  '/',
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
    query('type').optional().isIn(['INFO', 'SUCCESS', 'WARNING', 'ERROR']).withMessage('Invalid notification type.'),
    query('category').optional().isIn(['BOOKING', 'PAYMENT', 'RIDE', 'SYSTEM', 'PROFILE', 'REMINDER']).withMessage('Invalid category.'),
    query('isRead').optional().isIn(['true', 'false']).withMessage('isRead must be true or false.')
  ],
  validateRequest,
  notificationController.getNotifications
);

// GET /api/notifications/unread-count
router.get(
  '/unread-count',
  authMiddleware,
  notificationController.getUnreadCount
);

// PATCH /api/notifications/read-all (must be before :id route)
router.patch(
  '/read-all',
  authMiddleware,
  notificationController.markAllRead
);

// PATCH /api/notifications/:id/read
router.patch(
  '/:id/read',
  authMiddleware,
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid notification ID.')
  ],
  validateRequest,
  notificationController.markRead
);

// DELETE /api/notifications/:id
router.delete(
  '/:id',
  authMiddleware,
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid notification ID.')
  ],
  validateRequest,
  notificationController.deleteNotification
);

// DELETE /api/notifications — delete all
router.delete(
  '/',
  authMiddleware,
  notificationController.deleteAllNotifications
);

// ─── Notification Preferences ───────────────────────────────────────────────

// GET /api/notification-preferences
router.get(
  '/preferences',
  authMiddleware,
  notificationController.getPreferences
);

// PUT /api/notification-preferences
router.put(
  '/preferences',
  authMiddleware,
  notificationController.updatePreferences
);

export default router;
