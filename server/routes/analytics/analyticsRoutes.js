import { Router } from 'express';
import analyticsController from '../../controllers/analytics/analyticsController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';

const router = Router();

// Protect all analytics endpoints for Admin only
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

router.get('/dashboard', asyncHandler(analyticsController.getDashboardSummary));
router.get('/revenue', asyncHandler(analyticsController.getRevenueStats));
router.get('/rides', asyncHandler(analyticsController.getRidesStats));
router.get('/users', asyncHandler(analyticsController.getUsersStats));
router.get('/payments', asyncHandler(analyticsController.getPaymentsStats));
router.get('/ratings', asyncHandler(analyticsController.getRatingsStats));

export default router;
