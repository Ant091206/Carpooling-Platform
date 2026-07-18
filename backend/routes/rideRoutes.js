import express from 'express';
import { body, param } from 'express-validator';
import rideController from '../controllers/rideController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rides
 *   description: Ride publishing and management API
 */

router.post(
    '/',
    authMiddleware,
    [
        body('vehicle_id').isInt().withMessage('Valid vehicle ID is required'),
        body('pickup_name').notEmpty().withMessage('Pickup name is required'),
        body('pickup_lng').isFloat().withMessage('Valid pickup longitude is required'),
        body('pickup_lat').isFloat().withMessage('Valid pickup latitude is required'),
        body('destination_name').notEmpty().withMessage('Destination name is required'),
        body('dest_lng').isFloat().withMessage('Valid destination longitude is required'),
        body('dest_lat').isFloat().withMessage('Valid destination latitude is required'),
        body('departure_time').isISO8601().withMessage('Valid departure time is required'),
        body('available_seats').isInt({ min: 1 }).withMessage('Available seats must be greater than 0'),
        body('fare_per_seat').isFloat({ gt: 0 }).withMessage('Fare must be greater than 0'),
        body('is_recurring').optional().isBoolean(),
        body('notes').optional().isString()
    ],
    validateRequest,
    rideController.publishRide
);

router.get('/my', authMiddleware, rideController.getMyRides);

router.get(
    '/:id',
    authMiddleware,
    [param('id').isInt().withMessage('Invalid ride ID')],
    validateRequest,
    rideController.getRideById
);

router.put(
    '/:id',
    authMiddleware,
    [
        param('id').isInt().withMessage('Invalid ride ID'),
        body('departure_time').optional().isISO8601().withMessage('Valid departure time is required'),
        body('available_seats').optional().isInt({ min: 1 }).withMessage('Available seats must be greater than 0'),
        body('fare_per_seat').optional().isFloat({ gt: 0 }).withMessage('Fare must be greater than 0'),
        body('notes').optional().isString()
    ],
    validateRequest,
    rideController.updateRide
);

router.delete(
    '/:id',
    authMiddleware,
    [param('id').isInt().withMessage('Invalid ride ID')],
    validateRequest,
    rideController.deleteRide
);

router.patch(
    '/:id/start',
    authMiddleware,
    [param('id').isInt().withMessage('Invalid ride ID')],
    validateRequest,
    rideController.startRide
);

router.patch(
    '/:id/complete',
    authMiddleware,
    [param('id').isInt().withMessage('Invalid ride ID')],
    validateRequest,
    rideController.completeRide
);

router.patch(
    '/:id/cancel',
    authMiddleware,
    [param('id').isInt().withMessage('Invalid ride ID')],
    validateRequest,
    rideController.cancelRide
);

export default router;
