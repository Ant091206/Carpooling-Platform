import express from 'express';
import { body, param, query } from 'express-validator';
import bookingController from '../controllers/bookingController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Passenger booking and driver management API
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rideId
 *               - requestedSeats
 *             properties:
 *               rideId:
 *                 type: integer
 *                 example: 12
 *               requestedSeats:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error / insufficient seats / ride not active
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Cannot book own ride
 *       404:
 *         description: Ride not found
 *       409:
 *         description: Duplicate booking
 */
router.post(
    '/',
    authMiddleware,
    [
        body('rideId').isInt({ min: 1 }).withMessage('Valid ride ID is required.'),
        body('requestedSeats')
            .isInt({ min: 1 })
            .withMessage('Requested seats must be at least 1.'),
    ],
    validateRequest,
    bookingController.createBooking
);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: List bookings for the authenticated user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [driver]
 *         description: Pass "driver" to see bookings on your rides
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/',
    authMiddleware,
    [query('role').optional().isIn(['driver']).withMessage('Role must be "driver" if provided.')],
    validateRequest,
    bookingController.listBookings
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get details of a single booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.get(
    '/:id',
    authMiddleware,
    [param('id').isInt({ min: 1 }).withMessage('Invalid booking ID.')],
    validateRequest,
    bookingController.getBooking
);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   patch:
 *     summary: Passenger cancels a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       400:
 *         description: Cannot cancel in current status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not your booking
 *       404:
 *         description: Booking not found
 */
router.patch(
    '/:id/cancel',
    authMiddleware,
    [param('id').isInt({ min: 1 }).withMessage('Invalid booking ID.')],
    validateRequest,
    bookingController.cancelBooking
);

/**
 * @swagger
 * /api/bookings/{id}/accept:
 *   patch:
 *     summary: Driver accepts a pending booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking accepted successfully
 *       400:
 *         description: Booking not in PENDING status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not your ride
 *       404:
 *         description: Booking not found
 */
router.patch(
    '/:id/accept',
    authMiddleware,
    [param('id').isInt({ min: 1 }).withMessage('Invalid booking ID.')],
    validateRequest,
    bookingController.acceptBooking
);

/**
 * @swagger
 * /api/bookings/{id}/reject:
 *   patch:
 *     summary: Driver rejects a pending booking (seats restored)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking rejected successfully
 *       400:
 *         description: Booking not in PENDING status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not your ride
 *       404:
 *         description: Booking not found
 */
router.patch(
    '/:id/reject',
    authMiddleware,
    [param('id').isInt({ min: 1 }).withMessage('Invalid booking ID.')],
    validateRequest,
    bookingController.rejectBooking
);

export default router;
