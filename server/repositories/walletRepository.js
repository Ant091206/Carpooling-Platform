import prisma from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * WalletRepository
 * All SQL / Prisma interactions for the wallets and wallet_transactions tables.
 * No business logic here — only data access.
 */
class WalletRepository {
  // ─── Wallet CRUD ────────────────────────────────────────────

  /**
   * Create a new wallet for a user (1 wallet per user enforced by DB unique key).
   */
  async create(userId) {
    return await prisma.wallet.create({
      data: { userId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  /**
   * Find a wallet by userId.
   */
  async findByUserId(userId) {
    return await prisma.wallet.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  /**
   * Find a wallet by walletId.
   */
  async findById(walletId) {
    return await prisma.wallet.findUnique({
      where: { id: walletId },
    });
  }

  // ─── Recharge (balance increment + transaction record) ──────

  /**
   * Atomically increment wallet balance and insert a RECHARGE transaction.
   * Wraps everything in a Prisma transaction so it either fully succeeds or rolls back.
   */
  async recharge(userId, amount, description = 'Wallet recharge') {
    return await prisma.$transaction(async (tx) => {
      // 1. Lock-read the wallet
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        const err = new Error('Wallet not found for this user.');
        err.statusCode = 404;
        throw err;
      }
      if (wallet.status !== 'ACTIVE') {
        const err = new Error(`Wallet is ${wallet.status}. Cannot recharge.`);
        err.statusCode = 400;
        throw err;
      }

      const balanceBefore = parseFloat(wallet.balance);
      const balanceAfter  = parseFloat((balanceBefore + amount).toFixed(2));

      // 2. Update balance
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      // 3. Record transaction
      const txn = await tx.walletTransaction.create({
        data: {
          walletId:       wallet.id,
          userId,
          transactionType: 'RECHARGE',
          amount,
          balanceBefore,
          balanceAfter,
          referenceNo:    `RECH-${uuidv4().toUpperCase().replace(/-/g, '').slice(0, 16)}`,
          description,
          status:         'SUCCESS',
        },
      });

      return { wallet: updated, transaction: txn };
    });
  }

  // ─── Debit (payment deduction + transaction record) ─────────

  /**
   * Atomically deduct balance for a ride payment.
   * bookingId and paymentId are linked for audit trail.
   */
  async debit({ userId, amount, bookingId, paymentId, description }) {
    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        const err = new Error('Wallet not found.');
        err.statusCode = 404;
        throw err;
      }
      if (wallet.status !== 'ACTIVE') {
        const err = new Error(`Wallet is ${wallet.status} and cannot be used for payment.`);
        err.statusCode = 400;
        throw err;
      }

      const balanceBefore = parseFloat(wallet.balance);
      if (balanceBefore < amount) {
        const err = new Error(
          `Insufficient wallet balance. Available: ₹${balanceBefore.toFixed(2)}, Required: ₹${amount.toFixed(2)}.`
        );
        err.statusCode = 402;
        throw err;
      }

      const balanceAfter = parseFloat((balanceBefore - amount).toFixed(2));

      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      const txn = await tx.walletTransaction.create({
        data: {
          walletId:       wallet.id,
          userId,
          bookingId:      bookingId || null,
          paymentId:      paymentId || null,
          transactionType: 'RIDE_PAYMENT',
          amount,
          balanceBefore,
          balanceAfter,
          referenceNo:    `PAY-${uuidv4().toUpperCase().replace(/-/g, '').slice(0, 16)}`,
          description:    description || `Ride payment for booking #${bookingId}`,
          status:         'SUCCESS',
        },
      });

      return { wallet: updated, transaction: txn };
    });
  }

  // ─── Refund (credit back + transaction record) ───────────────

  /**
   * Atomically credit a refund back to user wallet.
   */
  async refund({ userId, amount, bookingId, paymentId, description }) {
    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        const err = new Error('Wallet not found.');
        err.statusCode = 404;
        throw err;
      }

      const balanceBefore = parseFloat(wallet.balance);
      const balanceAfter  = parseFloat((balanceBefore + amount).toFixed(2));

      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      const txn = await tx.walletTransaction.create({
        data: {
          walletId:       wallet.id,
          userId,
          bookingId:      bookingId || null,
          paymentId:      paymentId || null,
          transactionType: 'REFUND',
          amount,
          balanceBefore,
          balanceAfter,
          referenceNo:    `REF-${uuidv4().toUpperCase().replace(/-/g, '').slice(0, 16)}`,
          description:    description || `Refund for booking #${bookingId}`,
          status:         'SUCCESS',
        },
      });

      return { wallet: updated, transaction: txn };
    });
  }

  // ─── Transactions list ───────────────────────────────────────

  /**
   * Get paginated transaction history for a user.
   */
  async findTransactionsByUserId(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await prisma.$transaction([
      prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.walletTransaction.count({ where: { userId } }),
    ]);
    return { transactions, total, page, limit };
  }
}

export default new WalletRepository();
