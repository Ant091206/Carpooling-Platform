import express from 'express';
import { body, query } from 'express-validator';
import walletController from '../controllers/walletController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', walletController.getWallet);
router.post('/create', walletController.createWallet);

router.post(
  '/recharge',
  [
    body('amount')
      .isFloat({ min: 10, max: 50000 })
      .withMessage('Amount must be between ₹10 and ₹50,000.'),
    body('description')
      .optional()
      .isString()
      .isLength({ max: 200 })
      .withMessage('Description must be a string under 200 characters.'),
  ],
  validateRequest,
  walletController.rechargeWallet
);

router.get(
  '/transactions',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100.'),
  ],
  validateRequest,
  walletController.getTransactions
);

export default router;
