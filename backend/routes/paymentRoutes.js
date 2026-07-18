import express from 'express';
import { body, param, query } from 'express-validator';
import paymentController from '../controllers/paymentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

// All payment routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Ride payment processing — Wallet, Cash, UPI, Razorpay
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Initiate a ride payment after trip completion
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - paymentMethod
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 example: 42
 *               paymentMethod:
 *                 type: string
 *                 enum: [WALLET, CASH, UPI, RAZORPAY]
 *                 example: WALLET
 *     responses:
 *       201:
 *         description: Payment processed successfully
 *       400:
 *         description: Ride not yet Completed / validation error
 *       402:
 *         description: Insufficient wallet balance
 *       403:
 *         description: Not the passenger of this booking
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Payment already made for this booking
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  [
    body('bookingId')
      .isInt({ min: 1 })
      .withMessage('A valid booking ID is required.'),
    body('paymentMethod')
      .isIn(['WALLET', 'CASH', 'UPI', 'RAZORPAY'])
      .withMessage('Payment method must be one of: WALLET, CASH, UPI, RAZORPAY.'),
  ],
  validateRequest,
  paymentController.createPayment
);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get authenticated user's payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1–100.'),
  ],
  validateRequest,
  paymentController.getPayments
);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get a single payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Payment not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid payment ID.')],
  validateRequest,
  paymentController.getPaymentById
);

/**
 * @swagger
 * /api/payments/{id}/verify-razorpay:
 *   post:
 *     summary: Verify Razorpay payment signature after checkout
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_order_id:   { type: string }
 *               razorpay_payment_id: { type: string }
 *               razorpay_signature:  { type: string }
 *     responses:
 *       200:
 *         description: Razorpay payment verified successfully
 *       400:
 *         description: Signature mismatch — payment marked FAILED
 *       404:
 *         description: Payment not found
 *       409:
 *         description: Already verified
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:id/verify-razorpay',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid payment ID.'),
    body('razorpay_order_id').notEmpty().withMessage('razorpay_order_id is required.'),
    body('razorpay_payment_id').notEmpty().withMessage('razorpay_payment_id is required.'),
    body('razorpay_signature').notEmpty().withMessage('razorpay_signature is required.'),
  ],
  validateRequest,
  paymentController.verifyRazorpay
);

/**
 * @swagger
 * /api/payments/{id}/refund:
 *   post:
 *     summary: Refund a completed payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Payment refunded successfully
 *       400:
 *         description: Payment not in SUCCESS state
 *       403:
 *         description: Not authorised to refund
 *       404:
 *         description: Payment not found
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:id/refund',
  [param('id').isInt({ min: 1 }).withMessage('Invalid payment ID.')],
  validateRequest,
  paymentController.refundPayment
);

export default router;
