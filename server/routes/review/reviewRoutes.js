import express from 'express';
import { body, param } from 'express-validator';
import reviewController from '../../controllers/review/reviewController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';

const router = express.Router();

// Create review for ride participant
router.post(
  '/',
  authMiddleware,
  [
    body('rideId').isInt({ min: 1 }).withMessage('Valid ride ID is required.'),
    body('revieweeId').isInt({ min: 1 }).withMessage('Valid reviewee ID is required.'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.'),
    body('review').trim().notEmpty().withMessage('Review description cannot be empty.')
  ],
  validateRequest,
  reviewController.createReview
);

// Get rating statistics and reviews summary for a user
router.get(
  '/user/:userId',
  authMiddleware,
  [
    param('userId').isInt({ min: 1 }).withMessage('Invalid user ID format.')
  ],
  validateRequest,
  reviewController.getUserReviewStats
);

// Get reviews submitted for a specific ride
router.get(
  '/ride/:rideId',
  authMiddleware,
  [
    param('rideId').isInt({ min: 1 }).withMessage('Invalid ride ID format.')
  ],
  validateRequest,
  reviewController.getRideReviews
);

export default router;
