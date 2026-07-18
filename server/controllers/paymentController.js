import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { successResponse } from '../utils/responseFormat.js';
import { notifyUser } from '../utils/socketIo.js';

let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
    key_secret: process.env.RAZORPAY_SECRET || 'dummy_secret',
  });
} catch (e) {
  console.error("Razorpay initialization failed:", e.message);
}

class PaymentController {
  /**
   * Create Razorpay Order
   * POST /api/payments/order
   */
  async createOrder(req, res, next) {
    try {
      const { bookingId } = req.body;
      if (!bookingId) {
        throw new ApiError(400, 'Booking ID is required to generate payment order.');
      }

      const booking = await prisma.booking.findUnique({
        where: { id: parseInt(bookingId, 10) },
        include: { ride: true }
      });

      if (!booking) {
        throw new ApiError(404, 'Booking record not found.');
      }

      const fareAmount = parseFloat(booking.ride.farePerSeat) * booking.requestedSeats;
      
      const options = {
        amount: Math.round(fareAmount * 100), // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `receipt_booking_${bookingId}_${Date.now()}`
      };

      if (!razorpay) {
        // Fallback for mock environment when Razorpay key isn't loaded/valid
        return res.status(201).json(successResponse('Mock Payment order created successfully', {
          id: `mock_order_${Date.now()}`,
          amount: options.amount,
          currency: 'INR',
          isMock: true
        }));
      }

      const order = await razorpay.orders.create(options);
      res.status(201).json(successResponse('Razorpay order created successfully', order));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Razorpay Payment Signature
   * POST /api/payments/verify
   */
  async verifyPayment(req, res, next) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, isMock } = req.body;

      if (!bookingId) {
        throw new ApiError(400, 'Booking ID is required for verification.');
      }

      const booking = await prisma.booking.findUnique({
        where: { id: parseInt(bookingId, 10) },
        include: { passenger: true, driver: true, ride: true }
      });

      if (!booking) {
        throw new ApiError(404, 'Booking not found.');
      }

      if (isMock) {
        // Accept mock payments during testing if Razorpay is not configured
        const updatedBooking = await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'ACCEPTED' }
        });

        // Notify both passenger and driver via Socket.io
        notifyUser(booking.passengerId, 'ride_notification', {
          type: 'RIDE_ACCEPTED',
          message: `Your booking for ride from ${booking.ride.pickupName} has been paid and accepted!`,
          booking: updatedBooking
        });
        
        notifyUser(booking.driverId, 'ride_notification', {
          type: 'RIDE_ACCEPTED',
          message: `Booking request from ${booking.passenger.name} has been paid and confirmed.`,
          booking: updatedBooking
        });

        return res.status(200).json(successResponse('Mock payment verified and booking accepted', updatedBooking));
      }

      const keySecret = process.env.RAZORPAY_SECRET || 'dummy_secret';
      const hmac = crypto.createHmac('sha256', keySecret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature !== razorpay_signature) {
        throw new ApiError(400, 'Invalid payment signature. Verification failed.');
      }

      // Update Booking status
      const updatedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'ACCEPTED' }
      });

      // Notify passenger and driver
      notifyUser(booking.passengerId, 'ride_notification', {
        type: 'RIDE_ACCEPTED',
        message: `Your booking for ride to ${booking.ride.destinationName} has been paid and accepted!`,
        booking: updatedBooking
      });

      notifyUser(booking.driverId, 'ride_notification', {
        type: 'RIDE_ACCEPTED',
        message: `Booking request from ${booking.passenger.name} has been paid and confirmed.`,
        booking: updatedBooking
      });

      res.status(200).json(successResponse('Payment verified and booking accepted successfully', updatedBooking));
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();
