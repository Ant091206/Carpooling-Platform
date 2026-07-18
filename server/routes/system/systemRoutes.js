import express from 'express';
import { query } from 'express-validator';
import systemController from '../../controllers/system/systemController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';

const router = express.Router();

// Public / Health routes
router.get('/health', systemController.getHealth);
router.get('/status', systemController.getStatus);

// Admin-only System Management routes
router.get(
  '/system/info',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  systemController.getSystemInfo
);

router.get(
  '/system/logs',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 200 }),
    query('level').optional().isIn(['INFO', 'WARN', 'ERROR']),
    query('module').optional().isIn(['AUTH', 'PAYMENT', 'RIDE', 'BOOKING', 'NOTIFICATION', 'ADMIN', 'SYSTEM']),
    query('search').optional().isString()
  ],
  validateRequest,
  systemController.getLogs
);

router.get(
  '/system/settings',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  systemController.getSettings
);

router.put(
  '/system/settings',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  systemController.updateSettings
);

router.get(
  '/system/backup',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  systemController.getBackup
);

router.post(
  '/system/restore',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  systemController.restoreBackup
);

export default router;
