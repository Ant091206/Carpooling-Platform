import paymentRepository from '../repositories/paymentRepository.js';
import walletService from './walletService.js';
import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

/**
 * PaymentService
 * Business logic for processing payments after trip completion.
 *
 * Architecture note:
 *   Payment gateways are implemented as a strategy map.
 *   To add a new gateway (e.g. PhonePe), add an entry to PAYMENT_STRATEGIES
 *   and implement _processPhonePe — no changes needed elsewhere.
 *
 * Module 9 independence:
 *   This service depends on Booking and Ride status (Completed).
 *   It does NOT depend on GPS, Socket.io, or Live Tracking.
 *   When Module 9 is built, the frontend will call POST /api/payments after
 *   the trip completes — zero changes required here.
 */
class PaymentService {
  // ─── Strategy map ────────────────────────────────────────────
  // Each strategy receives (payment, data) and returns { success, meta }

  #strategies = {
    WALLET:   this._processWallet.bind(this),
    CASH:     this._processCash.bind(this),
    UPI:      this._processUPI.bind(this),
    RAZORPAY: this._processRazorpay.bind(this),
  };

  // ─── Core: Create & Process Payment ─────────────────────────

  /**
   * Initiate and process a ride payment.
   *
   * Business rules enforced:
   *  1. Booking must exist and belong to the payer (passenger).
   *  2. Ride status must be Completed.
   *  3. No duplicate payment for same booking.
   *  4. Amount is calculated from the booking (not client-provided).
   *  5. Wallet balance cannot go negative.
   */
  async createPayment(payerId, { bookingId, paymentMethod }) {
    // 1. Validate booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ride: {
          select: {
            id: true,
            pickupName: true,
            destinationName: true,
            farePerSeat: true,
            rideStatus: true,
            driverId: true,
          },
        },
      },
    });

    if (!booking) {
      throw new ApiError(404, 'Booking not found.');
    }

    // 2. Only the passenger can pay
    if (booking.passengerId !== payerId) {
      throw new ApiError(403, 'You are not the passenger of this booking.');
    }

    // 3. Booking must be ACCEPTED or COMPLETED
    if (!['ACCEPTED', 'COMPLETED'].includes(booking.status)) {
      throw new ApiError(
        400,
        `Payment is only allowed for ACCEPTED or COMPLETED bookings. Current status: ${booking.status}.`
      );
    }

    // 4. Ride MUST be Completed
    if (booking.ride.rideStatus !== 'Completed') {
      throw new ApiError(
        400,
        `Payment is only allowed after the ride is Completed. Current ride status: ${booking.ride.rideStatus}.`
      );
    }

    // 5. Duplicate payment guard (unique constraint on booking_id)
    const existing = await paymentRepository.findByBookingId(bookingId);
    if (existing && existing.status === 'SUCCESS') {
      throw new ApiError(409, `Booking #${bookingId} has already been paid successfully.`);
    }

    // 6. Calculate amount server-side (never trust client)
    const amount = parseFloat(
      (parseFloat(booking.ride.farePerSeat) * booking.requestedSeats).toFixed(2)
    );

    // 7. Validate payment method
    const validMethods = ['WALLET', 'CASH', 'UPI', 'RAZORPAY'];
    if (!validMethods.includes(paymentMethod)) {
      throw new ApiError(400, `Invalid payment method. Allowed: ${validMethods.join(', ')}.`);
    }

    // 8. Create payment record
    const payment = await paymentRepository.create({
      bookingId,
      payerId,
      receiverId: booking.ride.driverId,
      paymentMethod,
      amount,
    });

    // 9. Dispatch to strategy
    const strategy = this.#strategies[paymentMethod];
    const result = await strategy(payment, {});

    return result;
  }

  // ─── Private strategy implementations ───────────────────────

  /**
   * WALLET payment — deducts from passenger's wallet atomically.
   */
  async _processWallet(payment) {
    // Deduct from wallet (validates balance inside walletRepository)
    const walletResult = await walletService.debit({
      userId:    payment.payerId,
      amount:    parseFloat(payment.amount),
      bookingId: payment.bookingId,
      paymentId: payment.id,
      description: `Ride payment: ${payment.booking?.ride?.pickupName ?? ''} → ${payment.booking?.ride?.destinationName ?? ''}`,
    });

    // Mark payment success
    const updated = await paymentRepository.markSuccess(payment.id);

    return {
      payment:     updated,
      transaction: walletResult.transaction,
      method:      'WALLET',
      message:     `₹${parseFloat(payment.amount).toFixed(2)} paid via wallet. New balance: ₹${parseFloat(walletResult.wallet.balance).toFixed(2)}.`,
    };
  }

  /**
   * CASH payment — just records it as success (driver collects physically).
   */
  async _processCash(payment) {
    const updated = await paymentRepository.markSuccess(payment.id);
    return {
      payment:  updated,
      method:   'CASH',
      message:  `Cash payment of ₹${parseFloat(payment.amount).toFixed(2)} recorded. Please pay the driver directly.`,
    };
  }

  /**
   * UPI payment — Demo/Sandbox flow (no real UPI gateway called).
   * Returns a UPI deeplink and marks success immediately for demo purposes.
   * Replace with real UPI PSP integration for production.
   */
  async _processUPI(payment) {
    const upiId = process.env.DEMO_UPI_ID || 'enterprisepool@upi';
    const upiLink = `upi://pay?pa=${upiId}&pn=EnterprisePool&am=${payment.amount}&cu=INR&tn=Ride%20Payment%20%23${payment.bookingId}`;

    const updated = await paymentRepository.markSuccess(payment.id, {
      gatewayPaymentId: `UPI-DEMO-${Date.now()}`,
    });

    return {
      payment:  updated,
      method:   'UPI',
      upiId,
      upiLink,
      qrData:   upiLink,
      message:  `Demo UPI payment initiated for ₹${parseFloat(payment.amount).toFixed(2)}.`,
    };
  }

  /**
   * RAZORPAY payment — creates a Razorpay order (test mode).
   * Frontend handles the Razorpay checkout popup; verification happens via
   * POST /api/payments/:id/verify-razorpay.
   */
  async _processRazorpay(payment) {
    const keyId     = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_SECRET;

    if (!keyId || keyId.includes('dummy')) {
      // Sandbox fallback when real keys are not configured
      const updated = await paymentRepository.markSuccess(payment.id, {
        gatewayOrderId:   `order_sandbox_${Date.now()}`,
        gatewayPaymentId: `pay_sandbox_${Date.now()}`,
      });
      return {
        payment:       updated,
        method:        'RAZORPAY',
        isSandbox:     true,
        gatewayOrderId: updated.gatewayOrderId,
        razorpayKey:   keyId,
        amount:        Math.round(parseFloat(payment.amount) * 100), // paise
        message:       'Razorpay sandbox order created.',
      };
    }

    // Real Razorpay order creation
    try {
      const Razorpay = (await import('razorpay')).default;
      const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const order = await rzp.orders.create({
        amount:   Math.round(parseFloat(payment.amount) * 100),
        currency: 'INR',
        receipt:  `receipt_${payment.id}`,
        notes:    { booking_id: payment.bookingId },
      });

      // Update payment with gateway order id
      await prisma.payment.update({
        where: { id: payment.id },
        data:  { gatewayOrderId: order.id },
      });

      return {
        payment:       payment,
        method:        'RAZORPAY',
        gatewayOrderId: order.id,
        razorpayKey:   keyId,
        amount:        order.amount,
        message:       'Razorpay order created. Complete payment via checkout.',
      };
    } catch (err) {
      await paymentRepository.markFailed(payment.id);
      throw new ApiError(502, `Razorpay gateway error: ${err.message}`);
    }
  }

  // ─── Razorpay verification ───────────────────────────────────

  /**
   * Verify Razorpay payment signature and mark payment as SUCCESS.
   */
  async verifyRazorpay(paymentId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw new ApiError(404, 'Payment not found.');
    if (payment.status === 'SUCCESS') throw new ApiError(409, 'Payment already verified.');

    const crypto = await import('crypto');
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      await paymentRepository.markFailed(paymentId);
      throw new ApiError(400, 'Razorpay signature verification failed. Payment marked as FAILED.');
    }

    return await paymentRepository.markSuccess(paymentId, {
      gatewayOrderId:   razorpay_order_id,
      gatewayPaymentId: razorpay_payment_id,
      gatewaySignature: razorpay_signature,
    });
  }

  // ─── Refund ──────────────────────────────────────────────────

  /**
   * Refund a completed payment.
   * Refunds wallet payments only (cash/UPI refunds are physical).
   */
  async refundPayment(paymentId, requestingUserId) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw new ApiError(404, 'Payment not found.');

    // Only the payer or an admin can request a refund
    if (payment.payerId !== requestingUserId) {
      throw new ApiError(403, 'You are not authorised to refund this payment.');
    }

    if (payment.status !== 'SUCCESS') {
      throw new ApiError(400, `Cannot refund a payment with status: ${payment.status}.`);
    }

    // Mark payment refunded
    const refundedPayment = await paymentRepository.markRefunded(paymentId);

    // For wallet payments, credit the amount back
    if (payment.paymentMethod === 'WALLET') {
      await walletService.refund({
        userId:      payment.payerId,
        amount:      parseFloat(payment.amount),
        bookingId:   payment.bookingId,
        paymentId:   payment.id,
        description: `Refund for booking #${payment.bookingId}`,
      });
    }

    return {
      payment: refundedPayment,
      message: payment.paymentMethod === 'WALLET'
        ? `₹${parseFloat(payment.amount).toFixed(2)} has been refunded to your wallet.`
        : `Refund recorded. For ${payment.paymentMethod} payments, the physical refund must be arranged separately.`,
    };
  }

  // ─── Queries ─────────────────────────────────────────────────

  async getPaymentById(paymentId, userId) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw new ApiError(404, 'Payment not found.');
    if (payment.payerId !== userId && payment.receiverId !== userId) {
      throw new ApiError(403, 'Access denied to this payment.');
    }
    return payment;
  }

  async getPaymentHistory(userId, pagination) {
    return await paymentRepository.findAllByPayer(userId, pagination);
  }
}

export default new PaymentService();
