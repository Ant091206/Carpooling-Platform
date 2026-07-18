import express from 'express';
import { param } from 'express-validator';
import tripController from '../controllers/tripController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Passenger Trip lists
router.get('/', authMiddleware, tripController.getPassengerTrips);
router.get('/upcoming', authMiddleware, tripController.getUpcomingTrips);
router.get('/ongoing', authMiddleware, tripController.getOngoingTrips);
router.get('/completed', authMiddleware, tripController.getCompletedTrips);

// Get single trip details
router.get(
    '/:id',
    authMiddleware,
    [param('id').isInt({ min: 1 }).withMessage('Invalid trip ID.')],
    validateRequest,
    tripController.getTripById
);

// Driver Trip updates
router.patch(
    '/:id/start',
    authMiddleware,
    [param('id').isInt({ min: 1 }).withMessage('Invalid trip ID.')],
    validateRequest,
    tripController.startTrip
);

router.patch(
    '/:id/progress',
    authMiddleware,
    [param('id').isInt({ min: 1 }).withMessage('Invalid trip ID.')],
    validateRequest,
    tripController.updateTripProgress
);

router.patch(
    '/:id/complete',
    authMiddleware,
    [param('id').isInt({ min: 1 }).withMessage('Invalid trip ID.')],
    validateRequest,
    tripController.completeTrip
);

export default router;
