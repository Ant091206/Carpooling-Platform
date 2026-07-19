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

// ==========================================
// Static Routes (Must be before parameterized routes to avoid conflicts)
// ==========================================

// Departments API Routes
router.get(
  '/departments',
  asyncHandler(OrganizationController.getDepartments)
);

// Invitation API Route
router.post(
  '/invite',
  roleMiddleware('ADMIN'),
  asyncHandler(OrganizationController.inviteEmployee)
);

// Verification API Routes
router.post(
  '/verify-employee',
  roleMiddleware('ADMIN'),
  asyncHandler(OrganizationController.verifyEmployee)
);

router.post(
  '/verify',
  roleMiddleware('ADMIN'),
  asyncHandler(OrganizationController.verifyEmployee)
);

// Organization Settings API Routes
router.get(
  '/settings',
  asyncHandler(OrganizationController.getSettings)
);

router.put(
  '/settings',
  roleMiddleware('ADMIN'),
  asyncHandler(OrganizationController.updateSettings)
);

// Organization creation & Own org fetch
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

// ==========================================
// Parameterized Routes (Must be last)
// ==========================================

router.get(
  '/:id/departments',
  asyncHandler(OrganizationController.getDepartments)
);

router.get(
  '/:id/settings',
  asyncHandler(OrganizationController.getSettings)
);

router.put(
  '/:id/settings',
  roleMiddleware('ADMIN'),
  asyncHandler(OrganizationController.updateSettings)
);

router.get(
  '/:id/employees',
  roleMiddleware('ADMIN'),
  asyncHandler(OrganizationController.getEmployees)
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

export default router;
