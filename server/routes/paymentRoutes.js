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

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1–100.'),
  ],
  validateRequest,
  paymentController.getPayments
);

router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid payment ID.')],
  validateRequest,
  paymentController.getPaymentById
);

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

router.post(
  '/:id/refund',
  [param('id').isInt({ min: 1 }).withMessage('Invalid payment ID.')],
  validateRequest,
  paymentController.refundPayment
);

export default router;
