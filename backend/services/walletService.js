import walletRepository from '../repositories/walletRepository.js';
import ApiError from '../utils/ApiError.js';

/**
 * WalletService
 * All business logic for the Wallet module.
 * Depends only on Authentication, User IDs, and Booking IDs.
 * Completely independent of Module 9 (Maps & Live Tracking).
 */
class WalletService {
  // ─── Wallet Lifecycle ────────────────────────────────────────

  /**
   * Create a wallet for a user.
   * Enforces the rule: every user has exactly ONE wallet.
   */
  async createWallet(userId) {
    // Check if wallet already exists
    const existing = await walletRepository.findByUserId(userId);
    if (existing) {
      throw new ApiError(409, 'Wallet already exists for this user.');
    }
    return await walletRepository.create(userId);
  }

  /**
   * Get wallet for the authenticated user.
   * Auto-creates if not present (convenience for new users).
   */
  async getOrCreateWallet(userId) {
    const wallet = await walletRepository.findByUserId(userId);
    if (wallet) return wallet;
    // Auto-create on first access
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
   * Recharge user's wallet.
   * Validates amount on the backend — client-provided amounts are never trusted.
   */
  async rechargeWallet(userId, amount, description) {
    // Amount validation
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new ApiError(400, 'Recharge amount must be a positive number.');
    }
    if (amount < 10) {
      throw new ApiError(400, 'Minimum recharge amount is ₹10.');
    }
    if (amount > 50000) {
      throw new ApiError(400, 'Maximum single recharge is ₹50,000.');
    }

    // Ensure wallet exists
    await this.getWallet(userId);

    return await walletRepository.recharge(userId, parseFloat(amount.toFixed(2)), description);
  }

  // ─── Transactions ────────────────────────────────────────────

  /**
   * Get paginated wallet transaction history for a user.
   */
  async getTransactions(userId, pagination) {
    // Ensure wallet exists first
    await this.getWallet(userId);
    return await walletRepository.findTransactionsByUserId(userId, pagination);
  }

  // ─── Internal debit (called from PaymentService) ─────────────

  /**
   * Debit wallet for a ride payment.
   * Not directly exposed as an API endpoint — only called from PaymentService.
   */
  async debit({ userId, amount, bookingId, paymentId, description }) {
    return await walletRepository.debit({ userId, amount, bookingId, paymentId, description });
  }

  /**
   * Refund to wallet.
   * Called from PaymentService when a refund is issued.
   */
  async refund({ userId, amount, bookingId, paymentId, description }) {
    return await walletRepository.refund({ userId, amount, bookingId, paymentId, description });
  }
}

export default new WalletService();
