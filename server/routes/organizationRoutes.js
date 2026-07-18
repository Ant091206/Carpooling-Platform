import { Router } from 'express';
import { OrganizationController } from '../controllers/organizationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  createOrganizationValidator,
  updateOrganizationValidator,
  lookupOrganizationValidator,
  registerCompanyValidator
} from '../validators/organizationValidator.js';

const router = Router();

// ==========================================
// Public Routes
// ==========================================

router.get(
  '/lookup',
  lookupOrganizationValidator,
  validateRequest,
  asyncHandler(OrganizationController.lookup)
);

router.post(
  '/register-company',
  registerCompanyValidator,
  validateRequest,
  asyncHandler(OrganizationController.registerCompany)
);

// ==========================================
// Protected Routes
// ==========================================

// Protect all following routes with authentication middleware
router.use(authMiddleware);

// Organization API Routes
router.post(
  '/',
  roleMiddleware('ADMIN'),
  createOrganizationValidator,
  validateRequest,
  asyncHandler(OrganizationController.create)
);

router.get(
  '/',
  asyncHandler(OrganizationController.getOwnOrganization)
);

router.get(
  '/:id',
  asyncHandler(OrganizationController.get)
);

router.put(
  '/:id',
  roleMiddleware('ADMIN'),
  updateOrganizationValidator,
  validateRequest,
  asyncHandler(OrganizationController.update)
);

router.delete(
  '/:id',
  roleMiddleware('ADMIN'),
  asyncHandler(OrganizationController.delete)
);

// Employees API Routes
router.get(
  '/:id/employees',
  roleMiddleware('ADMIN'),
  asyncHandler(OrganizationController.getEmployees)
);

router.post(
  '/verify-employee',
  roleMiddleware('ADMIN'),
  asyncHandler(OrganizationController.verifyEmployee)
);

export default router;
