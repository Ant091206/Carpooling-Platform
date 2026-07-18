import walletService from '../services/walletService.js';
import { successResponse } from '../utils/responseFormat.js';

class WalletController {
  async createWallet(req, res, next) {
    try {
      const wallet = await walletService.createWallet(req.user.id);
      res.status(201).json(successResponse('Wallet created successfully.', wallet));
    } catch (err) {
      next(err);
    }
  }

  async getWallet(req, res, next) {
    try {
      const wallet = await walletService.getOrCreateWallet(req.user.id);
      res.status(200).json(successResponse('Wallet retrieved successfully.', wallet));
    } catch (err) {
      next(err);
    }
  }

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
