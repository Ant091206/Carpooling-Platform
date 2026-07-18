import { Router } from 'express';
import paymentController from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

// Protect all payment routes
router.use(authMiddleware);

router.post('/order', asyncHandler(paymentController.createOrder));
router.post('/verify', asyncHandler(paymentController.verifyPayment));

export default router;
