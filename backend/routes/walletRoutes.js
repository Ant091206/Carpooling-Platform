import express from 'express';
import { body, query } from 'express-validator';
import walletController from '../controllers/walletController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

// All wallet routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: User wallet management — balance, recharge, transactions
 */

/**
 * @swagger
 * /api/wallet:
 *   get:
 *     summary: Get authenticated user's wallet (auto-creates if missing)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:        { type: integer }
 *                     userId:    { type: integer }
 *                     balance:   { type: number }
 *                     status:    { type: string, enum: [ACTIVE, SUSPENDED, CLOSED] }
 *                     createdAt: { type: string }
 *       401:
 *         description: Unauthorized
 */
router.get('/', walletController.getWallet);

/**
 * @swagger
 * /api/wallet/create:
 *   post:
 *     summary: Explicitly create a wallet for the authenticated user
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Wallet created successfully
 *       409:
 *         description: Wallet already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/create', walletController.createWallet);

/**
 * @swagger
 * /api/wallet/recharge:
 *   post:
 *     summary: Recharge wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 10
 *                 maximum: 50000
 *                 example: 500
 *               description:
 *                 type: string
 *                 example: "Monthly wallet top-up"
 *     responses:
 *       200:
 *         description: Wallet recharged successfully
 *       400:
 *         description: Validation error / amount out of range
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wallet not found
 */
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

/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     summary: Get paginated wallet transaction history
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wallet not found
 */
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
