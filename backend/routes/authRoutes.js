import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidator.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

// Public Routes
router.post(
  '/register',
  registerValidator,
  validateRequest,
  asyncHandler(AuthController.register)
);

router.post(
  '/login',
  loginValidator,
  validateRequest,
  asyncHandler(AuthController.login)
);

router.post(
  '/logout',
  asyncHandler(AuthController.logout)
);

router.post(
  '/refresh-token',
  asyncHandler(AuthController.refreshToken)
);

// Protected Routes
router.get(
  '/me',
  authMiddleware,
  asyncHandler(AuthController.me)
);

export default router;
