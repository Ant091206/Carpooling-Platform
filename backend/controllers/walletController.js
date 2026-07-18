import walletService from '../services/walletService.js';
import { successResponse } from '../utils/responseFormat.js';

/**
 * WalletController
 * Thin layer — only HTTP parsing, delegation to service, and response formatting.
 * Zero business logic here per the project's architectural convention.
 */
class WalletController {
  /**
   * POST /api/wallet/create
   * Explicitly create a wallet for the authenticated user.
   */
  async createWallet(req, res, next) {
    try {
      const wallet = await walletService.createWallet(req.user.id);
      res.status(201).json(successResponse('Wallet created successfully.', wallet));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/wallet
   * Get wallet (or auto-create if user has none).
   */
  async getWallet(req, res, next) {
    try {
      const wallet = await walletService.getOrCreateWallet(req.user.id);
      res.status(200).json(successResponse('Wallet retrieved successfully.', wallet));
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/wallet/recharge
   * Recharge wallet balance. Amount validated server-side.
   */
  async rechargeWallet(req, res, next) {
    try {
      const { amount, description } = req.body;
      const result = await walletService.rechargeWallet(
        req.user.id,
        parseFloat(amount),
        description
      );
      res.status(200).json(successResponse('Wallet recharged successfully.', result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/wallet/transactions
   * Paginated transaction history for the authenticated user.
   */
  async getTransactions(req, res, next) {
    try {
      const page  = parseInt(req.query.page  || '1', 10);
      const limit = parseInt(req.query.limit || '20', 10);
      const result = await walletService.getTransactions(req.user.id, { page, limit });
      res.status(200).json(successResponse('Transactions retrieved successfully.', result));
    } catch (err) {
      next(err);
    }
  }
}

export default new WalletController();
