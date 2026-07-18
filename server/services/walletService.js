import walletRepository from '../repositories/walletRepository.js';
import ApiError from '../utils/ApiError.js';

/**
 * WalletService
 * All business logic for the Wallet module.
 * Depends only on Authentication, User IDs, and Booking IDs.
 */
class WalletService {
  // ─── Wallet Lifecycle ────────────────────────────────────────

  /**
   * Create a wallet for a user.
   * Enforces the rule: every user has exactly ONE wallet.
   */
  async createWallet(userId) {
    const existing = await walletRepository.findByUserId(userId);
    if (existing) {
      throw new ApiError(409, 'Wallet already exists for this user.');
    }
    return await walletRepository.create(userId);
  }

  /**
   * Get wallet for the authenticated user.
   * Auto-creates if not present.
   */
  async getOrCreateWallet(userId) {
    const wallet = await walletRepository.findByUserId(userId);
    if (wallet) return wallet;
    return await walletRepository.create(userId);
  }

  /**
   * Get wallet by userId — throws 404 if missing.
   */
  async getWallet(userId) {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new ApiError(
        404,
        'Wallet not found. Please create a wallet first via POST /api/wallet/create.'
      );
    }
    return wallet;
  }

  // ─── Recharge ────────────────────────────────────────────────

  /**
   * Recharge user's wallet. Amount validated server-side.
   */
  async rechargeWallet(userId, amount, description) {
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new ApiError(400, 'Recharge amount must be a positive number.');
    }
    if (amount < 10) {
      throw new ApiError(400, 'Minimum recharge amount is ₹10.');
    }
    if (amount > 50000) {
      throw new ApiError(400, 'Maximum single recharge is ₹50,000.');
    }

    await this.getWallet(userId);

    return await walletRepository.recharge(userId, parseFloat(amount.toFixed(2)), description);
  }

  // ─── Transactions ────────────────────────────────────────────

  /**
   * Get paginated wallet transaction history for a user.
   */
  async getTransactions(userId, pagination) {
    await this.getWallet(userId);
    return await walletRepository.findTransactionsByUserId(userId, pagination);
  }

  // ─── Internal debit/refund ───────────────────────────────────

  async debit({ userId, amount, bookingId, paymentId, description }) {
    return await walletRepository.debit({ userId, amount, bookingId, paymentId, description });
  }

  async refund({ userId, amount, bookingId, paymentId, description }) {
    return await walletRepository.refund({ userId, amount, bookingId, paymentId, description });
  }
}

export default new WalletService();
