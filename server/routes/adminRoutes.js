import { Router } from 'express';
import adminController from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

// Secure all admin endpoints with auth and admin role verification
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

router.get('/dashboard', asyncHandler(adminController.getDashboardStats));
router.get('/users', asyncHandler(adminController.getUsers));
router.put('/users/:id/status', asyncHandler(adminController.updateUserStatus));
router.get('/rides', asyncHandler(adminController.getRides));
router.delete('/rides/:id', asyncHandler(adminController.deleteRide));

export default router;
