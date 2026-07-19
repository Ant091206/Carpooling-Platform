import prisma from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * PaymentRepository
 * All Prisma interactions for the payments table.
 * Designed so new payment gateways (e.g. Stripe, PhonePe) can be added
 * without modifying this class — just extend the service layer's strategy map.
 */
class PaymentRepository {
  // ─── Core CRUD ──────────────────────────────────────────────

  /**
   * Create a new payment record in PENDING status.
   */
  async create({ bookingId, payerId, receiverId, paymentMethod, amount }) {
    const existing = await prisma.payment.findUnique({
      where: { bookingId },
    });

    if (existing) {
      return await prisma.payment.update({
        where: { bookingId },
        data: {
          paymentMethod,
          amount,
          status: 'PENDING',
          transactionReference: `TXN-${uuidv4().toUpperCase().replace(/-/g, '').slice(0, 20)}`,
          gatewayOrderId: null,
          gatewayPaymentId: null,
          gatewaySignature: null,
          paidAt: null,
        },
        include: {
          booking:  { select: { id: true, rideId: true, requestedSeats: true } },
          payer:    { select: { id: true, name: true, email: true } },
          receiver: { select: { id: true, name: true, email: true } },
        },
      });
    }

    return await prisma.payment.create({
      data: {
        bookingId,
        payerId,
        receiverId,
        paymentMethod,
        amount,
        status:               'PENDING',
        transactionReference: `TXN-${uuidv4().toUpperCase().replace(/-/g, '').slice(0, 20)}`,
      },
      include: {
        booking:  { select: { id: true, rideId: true, requestedSeats: true } },
        payer:    { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Find payment by ID with full relations.
   */
  async findById(paymentId) {
    return await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            ride: {
              select: {
                id: true,
                pickupName: true,
                destinationName: true,
                departureTime: true,
                farePerSeat: true,
              },
            },
          },
        },
        payer:    { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Find payment by bookingId (one-to-one unique constraint).
   */
  async findByBookingId(bookingId) {
    return await prisma.payment.findUnique({
      where: { bookingId },
      include: {
        payer:    { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Paginated list of all payments for a given user (as payer).
   */
  async findAllByPayer(payerId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [payments, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where: { payerId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          booking: {
            include: {
              ride: {
                select: {
                  id: true,
                  pickupName: true,
                  destinationName: true,
                  departureTime: true,
                },
              },
            },
          },
          receiver: { select: { id: true, name: true } },
        },
      }),
      prisma.payment.count({ where: { payerId } }),
    ]);
    return { payments, total, page, limit };
  }

  // ─── Status transitions ──────────────────────────────────────

  /**
   * Mark payment as SUCCESS and stamp paid_at timestamp.
   * Optionally attach gateway identifiers.
   */
  async markSuccess(paymentId, { gatewayOrderId, gatewayPaymentId, gatewaySignature } = {}) {
    return await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status:           'SUCCESS',
        paidAt:           new Date(),
        gatewayOrderId:   gatewayOrderId   || null,
        gatewayPaymentId: gatewayPaymentId || null,
        gatewaySignature: gatewaySignature || null,
      },
    });
  }

  /**
   * Mark payment as FAILED.
   */
  async markFailed(paymentId) {
    return await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'FAILED' },
    });
  }

  /**
   * Mark payment as REFUNDED.
   */
  async markRefunded(paymentId) {
    return await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' },
    });
  }
}

export default new PaymentRepository();
