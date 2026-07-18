import express from 'express';
import { param } from 'express-validator';
import historyController from '../../controllers/history/historyController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';

const router = express.Router();

// Get logged-in user's rides history list
router.get(
  '/my-rides',
  authMiddleware,
  historyController.getMyRides
);

// Get specific ride history details
router.get(
  '/:rideId',
  authMiddleware,
  [
    param('rideId').isInt({ min: 1 }).withMessage('Invalid ride ID format.')
  ],
  validateRequest,
  historyController.getRideDetails
);

export default router;
