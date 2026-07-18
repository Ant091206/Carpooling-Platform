import paymentService from '../services/paymentService.js';
import { successResponse } from '../utils/responseFormat.js';

/**
 * PaymentController
 * Thin HTTP layer — zero business logic.
 */
class PaymentController {
  /**
   * POST /api/payments
   * Initiate a ride payment after trip completion.
   */
  async createPayment(req, res, next) {
    try {
      const { bookingId, paymentMethod } = req.body;
      const result = await paymentService.createPayment(req.user.id, {
        bookingId:     parseInt(bookingId, 10),
        paymentMethod: paymentMethod?.toUpperCase(),
      });
      res.status(201).json(successResponse('Payment processed successfully.', result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/payments
   * Get payment history for the authenticated user.
   */
  async getPayments(req, res, next) {
    try {
      const page  = parseInt(req.query.page  || '1', 10);
      const limit = parseInt(req.query.limit || '20', 10);
      const result = await paymentService.getPaymentHistory(req.user.id, { page, limit });
      res.status(200).json(successResponse('Payment history retrieved successfully.', result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/payments/:id
   * Get a single payment by ID.
   */
  async getPaymentById(req, res, next) {
    try {
      const paymentId = parseInt(req.params.id, 10);
      const payment   = await paymentService.getPaymentById(paymentId, req.user.id);
      res.status(200).json(successResponse('Payment retrieved successfully.', payment));
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/payments/:id/verify-razorpay
   * Verify Razorpay payment signature after frontend checkout.
   */
  async verifyRazorpay(req, res, next) {
    try {
      const paymentId = parseInt(req.params.id, 10);
      const payment   = await paymentService.verifyRazorpay(paymentId, req.body);
      res.status(200).json(successResponse('Razorpay payment verified successfully.', payment));
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/payments/:id/refund
   * Refund a completed payment.
   */
  async refundPayment(req, res, next) {
    try {
      const paymentId = parseInt(req.params.id, 10);
      const result    = await paymentService.refundPayment(paymentId, req.user.id);
      res.status(200).json(successResponse(result.message, result.payment));
    } catch (err) {
      next(err);
    }
  }
}

export default new PaymentController();
