const express = require('express');
const { body, param } = require('express-validator');
const rideController = require('../controllers/rideController');
const mockAuth = require('../middlewares/mockAuth');
const validate = require('../middlewares/validate');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rides
 *   description: Ride publishing and management API
 */

/**
 * @swagger
 * /rides:
 *   post:
 *     summary: Publish a new ride
 *     tags: [Rides]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle_id
 *               - pickup_name
 *               - pickup_lng
 *               - pickup_lat
 *               - destination_name
 *               - dest_lng
 *               - dest_lat
 *               - departure_time
 *               - available_seats
 *               - fare_per_seat
 *             properties:
 *               vehicle_id:
 *                 type: integer
 *               pickup_name:
 *                 type: string
 *               pickup_lng:
 *                 type: number
 *               pickup_lat:
 *                 type: number
 *               destination_name:
 *                 type: string
 *               dest_lng:
 *                 type: number
 *               dest_lat:
 *                 type: number
 *               departure_time:
 *                 type: string
 *                 format: date-time
 *               available_seats:
 *                 type: integer
 *                 minimum: 1
 *               fare_per_seat:
 *                 type: number
 *                 minimum: 1
 *               is_recurring:
 *                 type: boolean
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ride published successfully
 */
router.post(
    '/',
    mockAuth,
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
    validate,
    rideController.publishRide
);

/**
 * @swagger
 * /rides/my:
 *   get:
 *     summary: Get all published rides by the authenticated driver
 *     tags: [Rides]
 *     responses:
 *       200:
 *         description: Rides retrieved successfully
 */
router.get('/my', mockAuth, rideController.getMyRides);

/**
 * @swagger
 * /rides/{id}:
 *   get:
 *     summary: Get ride details by ID
 *     tags: [Rides]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ride retrieved successfully
 */
router.get(
    '/:id',
    mockAuth,
    [param('id').isInt().withMessage('Invalid ride ID')],
    validate,
    rideController.getRideById
);

/**
 * @swagger
 * /rides/{id}:
 *   put:
 *     summary: Update an existing scheduled ride
 *     tags: [Rides]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departure_time:
 *                 type: string
 *                 format: date-time
 *               available_seats:
 *                 type: integer
 *                 minimum: 1
 *               fare_per_seat:
 *                 type: number
 *                 minimum: 1
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ride updated successfully
 */
router.put(
    '/:id',
    mockAuth,
    [
        param('id').isInt().withMessage('Invalid ride ID'),
        body('departure_time').optional().isISO8601().withMessage('Valid departure time is required'),
        body('available_seats').optional().isInt({ min: 1 }).withMessage('Available seats must be greater than 0'),
        body('fare_per_seat').optional().isFloat({ gt: 0 }).withMessage('Fare must be greater than 0'),
        body('notes').optional().isString()
    ],
    validate,
    rideController.updateRide
);

/**
 * @swagger
 * /rides/{id}:
 *   delete:
 *     summary: Delete a scheduled ride
 *     tags: [Rides]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ride deleted successfully
 */
router.delete(
    '/:id',
    mockAuth,
    [param('id').isInt().withMessage('Invalid ride ID')],
    validate,
    rideController.deleteRide
);

/**
 * @swagger
 * /rides/{id}/start:
 *   patch:
 *     summary: Start a ride
 *     tags: [Rides]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ride started successfully
 */
router.patch(
    '/:id/start',
    mockAuth,
    [param('id').isInt().withMessage('Invalid ride ID')],
    validate,
    rideController.startRide
);

/**
 * @swagger
 * /rides/{id}/complete:
 *   patch:
 *     summary: Complete a ride
 *     tags: [Rides]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ride completed successfully
 */
router.patch(
    '/:id/complete',
    mockAuth,
    [param('id').isInt().withMessage('Invalid ride ID')],
    validate,
    rideController.completeRide
);

/**
 * @swagger
 * /rides/{id}/cancel:
 *   patch:
 *     summary: Cancel a ride
 *     tags: [Rides]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ride cancelled successfully
 */
router.patch(
    '/:id/cancel',
    mockAuth,
    [param('id').isInt().withMessage('Invalid ride ID')],
    validate,
    rideController.cancelRide
);

module.exports = router;
