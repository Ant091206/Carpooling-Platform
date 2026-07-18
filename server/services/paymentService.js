import paymentRepository from '../repositories/paymentRepository.js';
import walletService from './walletService.js';
import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

/**
 * PaymentService
 * Business logic for processing payments after trip completion.
 */
class PaymentService {
  #strategies = {
    WALLET:   this._processWallet.bind(this),
    CASH:     this._processCash.bind(this),
    UPI:      this._processUPI.bind(this),
    RAZORPAY: this._processRazorpay.bind(this),
  };

  /**
   * Initiate and process a ride payment.
   */
  async createPayment(payerId, { bookingId, paymentMethod }) {
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

    if (booking.passengerId !== payerId) {
      throw new ApiError(403, 'You are not the passenger of this booking.');
    }

    if (!['ACCEPTED', 'COMPLETED'].includes(booking.status)) {
      throw new ApiError(
        400,
        `Payment is only allowed for ACCEPTED or COMPLETED bookings. Current status: ${booking.status}.`
      );
    }

    const existing = await paymentRepository.findByBookingId(bookingId);
    if (existing && existing.status === 'SUCCESS') {
      throw new ApiError(409, `Booking #${bookingId} has already been paid successfully.`);
    }

    const amount = parseFloat(
      (parseFloat(booking.ride.farePerSeat) * booking.requestedSeats).toFixed(2)
    );

    const validMethods = ['WALLET', 'CASH', 'UPI', 'RAZORPAY'];
    if (!validMethods.includes(paymentMethod)) {
      throw new ApiError(400, `Invalid payment method. Allowed: ${validMethods.join(', ')}.`);
    }

    const payment = await paymentRepository.create({
      bookingId,
      payerId,
      receiverId: booking.ride.driverId,
      paymentMethod,
      amount,
    });

    const strategy = this.#strategies[paymentMethod];
    return await strategy(payment, {});
  }

  async _processWallet(payment) {
    const walletResult = await walletService.debit({
      userId:    payment.payerId,
      amount:    parseFloat(payment.amount),
      bookingId: payment.bookingId,
      paymentId: payment.id,
      description: `Ride payment: ${payment.booking?.ride?.pickupName ?? ''} → ${payment.booking?.ride?.destinationName ?? ''}`,
    });

    const updated = await paymentRepository.markSuccess(payment.id);
    await this._notifySuccess(updated);

    return {
      payment:     updated,
      transaction: walletResult.transaction,
      method:      'WALLET',
      message:     `₹${parseFloat(payment.amount).toFixed(2)} paid via wallet. New balance: ₹${parseFloat(walletResult.wallet.balance).toFixed(2)}.`,
    };
  }

  async _processCash(payment) {
    const updated = await paymentRepository.markSuccess(payment.id);
    await this._notifySuccess(updated);
    return {
      payment:  updated,
      method:   'CASH',
      message:  `Cash payment of ₹${parseFloat(payment.amount).toFixed(2)} recorded. Please pay the driver directly.`,
    };
  }

  async _processUPI(payment) {
    const upiId = process.env.DEMO_UPI_ID || 'enterprisepool@upi';
    const upiLink = `upi://pay?pa=${upiId}&pn=EnterprisePool&am=${payment.amount}&cu=INR&tn=Ride%20Payment%20%23${payment.bookingId}`;

    const updated = await paymentRepository.markSuccess(payment.id, {
      gatewayPaymentId: `UPI-DEMO-${Date.now()}`,
    });
    await this._notifySuccess(updated);

    return {
      payment:  updated,
      method:   'UPI',
      upiId,
      upiLink,
      qrData:   upiLink,
      message:  `Demo UPI payment initiated for ₹${parseFloat(payment.amount).toFixed(2)}.`,
    };
  }

  async _processRazorpay(payment) {
    const keyId     = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_SECRET;

    if (!keyId || keyId.includes('dummy') || keyId.includes('your_')) {
      const updated = await paymentRepository.markSuccess(payment.id, {
        gatewayOrderId:   `order_sandbox_${Date.now()}`,
        gatewayPaymentId: `pay_sandbox_${Date.now()}`,
      });
      await this._notifySuccess(updated);
      return {
        payment:       updated,
        method:        'RAZORPAY',
        isSandbox:     true,
        gatewayOrderId: updated.gatewayOrderId,
        razorpayKey:   keyId,
        amount:        Math.round(parseFloat(payment.amount) * 100),
        message:       'Razorpay sandbox order created.',
      };
    }

    try {
      const Razorpay = (await import('razorpay')).default;
      const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const order = await rzp.orders.create({
        amount:   Math.round(parseFloat(payment.amount) * 100),
        currency: 'INR',
        receipt:  `receipt_${payment.id}`,
        notes:    { booking_id: payment.bookingId },
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data:  { gatewayOrderId: order.id },
      });

      return {
        payment,
        method:        'RAZORPAY',
        gatewayOrderId: order.id,
        razorpayKey:   keyId,
        amount:        order.amount,
        message:       'Razorpay order created. Complete payment via checkout.',
      };
    } catch (err) {
      await paymentRepository.markFailed(payment.id);
      try {
        const failedPayment = await paymentRepository.findById(payment.id);
        await this._notifyFailure(failedPayment || payment);
      } catch (e) {
        console.error(e);
      }
      throw new ApiError(502, `Razorpay gateway error: ${err.message}`);
    }
  }

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
      await this._notifyFailure(payment);
      throw new ApiError(400, 'Razorpay signature verification failed. Payment marked as FAILED.');
    }

    const updated = await paymentRepository.markSuccess(paymentId, {
      gatewayOrderId:   razorpay_order_id,
      gatewayPaymentId: razorpay_payment_id,
      gatewaySignature: razorpay_signature,
    });
    await this._notifySuccess(updated);
    return updated;
  }

  async refundPayment(paymentId, requestingUserId) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw new ApiError(404, 'Payment not found.');

    if (payment.payerId !== requestingUserId) {
      throw new ApiError(403, 'You are not authorised to refund this payment.');
    }

    if (payment.status !== 'SUCCESS') {
      throw new ApiError(400, `Cannot refund a payment with status: ${payment.status}.`);
    }

    const refundedPayment = await paymentRepository.markRefunded(paymentId);

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
        : `Refund recorded for ${payment.paymentMethod} payment.`,
    };
  }

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

  async _notifySuccess(payment) {
    try {
      const payer = await prisma.user.findUnique({
        where: { id: payment.payerId },
        select: { name: true, email: true }
      });
      const paymentDetails = {
        paymentId: payment.id,
        amount: parseFloat(payment.amount)
      };
      const triggerService = (await import('./notification/notificationTriggerService.js')).default;
      await triggerService.notifyPaymentSuccess({
        userId: payment.payerId,
        userName: payer.name,
        userEmail: payer.email,
        paymentDetails
      });
    } catch (err) {
      console.error('Error triggering payment success notification:', err);
    }
  }

  async _notifyFailure(payment) {
    try {
      const payer = await prisma.user.findUnique({
        where: { id: payment.payerId },
        select: { name: true, email: true }
      });
      const paymentDetails = {
        paymentId: payment.id,
        amount: parseFloat(payment.amount)
      };
      const triggerService = (await import('./notification/notificationTriggerService.js')).default;
      await triggerService.notifyPaymentFailed({
        userId: payment.payerId,
        userName: payer.name,
        userEmail: payer.email,
        paymentDetails
      });
    } catch (err) {
      console.error('Error triggering payment failure notification:', err);
    }
  }
}

export default new PaymentService();
