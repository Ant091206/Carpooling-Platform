import express from 'express';
import { body } from 'express-validator';
import matchingController from '../../controllers/matching/matchingController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

/**
 * POST /api/matching/find
 */
router.post(
  '/find',
  [
    body('pickupLat').optional().isNumeric(),
    body('pickupLng').optional().isNumeric(),
    body('destinationLat').optional().isNumeric(),
    body('destinationLng').optional().isNumeric(),
    body('seatsNeeded').optional().isInt({ min: 1, max: 8 }),
  ],
  validateRequest,
  matchingController.findMatches
);

/**
 * GET /api/matching/recommendations
 */
router.get('/recommendations', matchingController.getRecommendations);

/**
 * GET /api/matching/history
 */
router.get('/history', matchingController.getMatchHistory);

/**
 * GET & PUT /api/matching/preferences
 */
router.get('/preferences', matchingController.getPreferences);

router.put(
  '/preferences',
  [
    body('maxDetourDistance').optional().isFloat({ min: 0.5, max: 50 }),
    body('maxWaitingTime').optional().isInt({ min: 5, max: 180 }),
    body('preferredGender').optional().isIn(['ANY', 'MALE', 'FEMALE']),
    body('allowMixedGender').optional().isBoolean(),
    body('allowRecurringMatches').optional().isBoolean(),
  ],
  validateRequest,
  matchingController.updatePreferences
);

export default router;
