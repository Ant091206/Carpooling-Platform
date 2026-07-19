import express from 'express';
import { body, param, query } from 'express-validator';
import vehicleController from '../../controllers/vehicle/vehicleController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';

import upload from '../../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

/**
 * USER VEHICLE ENDPOINTS
 */
router.post(
  '/upload',
  upload.single('vehicle_image'),
  vehicleController.uploadVehicleImage
);

router.patch(
  '/default/:id',
  [param('id').isInt({ min: 1 }).withMessage('Valid vehicle ID is required.')],
  validateRequest,
  vehicleController.setDefaultVehicle
);
router.post(
  '/',
  [
    body('model').isString().notEmpty().withMessage('Vehicle model is required.'),
    body('color').isString().notEmpty().withMessage('Vehicle color is required.'),
  ],
  validateRequest,
  vehicleController.createVehicle
);

router.get('/', vehicleController.getUserVehicles);

router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Valid vehicle ID is required.')],
  validateRequest,
  vehicleController.getVehicleById
);

router.put(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Valid vehicle ID is required.')],
  validateRequest,
  vehicleController.updateVehicle
);

router.delete(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Valid vehicle ID is required.')],
  validateRequest,
  vehicleController.deleteVehicle
);

/**
 * VEHICLE DOCUMENTS ENDPOINTS
 */
router.post(
  '/:id/documents',
  [
    param('id').isInt({ min: 1 }).withMessage('Valid vehicle ID is required.'),
    body('documentType').isString().notEmpty().withMessage('Document type is required.'),
    body('documentUrl').isString().notEmpty().withMessage('Document URL is required.'),
  ],
  validateRequest,
  vehicleController.uploadDocument
);

router.get(
  '/:id/documents',
  [param('id').isInt({ min: 1 }).withMessage('Valid vehicle ID is required.')],
  validateRequest,
  vehicleController.getDocuments
);

router.delete(
  '/documents/:id',
  [param('id').isInt({ min: 1 }).withMessage('Valid document ID is required.')],
  validateRequest,
  vehicleController.deleteDocument
);

/**
 * VEHICLE AVAILABILITY TOGGLE
 */
router.patch(
  '/:id/availability',
  [
    param('id').isInt({ min: 1 }).withMessage('Valid vehicle ID is required.'),
    body('status').isIn(['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE']).withMessage('Valid status is required.'),
  ],
  validateRequest,
  vehicleController.toggleAvailability
);

export default router;

/**
 * ADMIN FLEET ENDPOINTS
 */
export const adminVehicleRouter = express.Router();

adminVehicleRouter.use(authMiddleware);
adminVehicleRouter.use(roleMiddleware('ADMIN'));

adminVehicleRouter.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'BLOCKED']),
    query('fuelType').optional().isIn(['PETROL', 'DIESEL', 'CNG', 'EV', 'HYBRID']),
    query('vehicleType').optional().isIn(['CAR', 'SUV', 'VAN', 'BIKE']),
  ],
  validateRequest,
  vehicleController.getAdminFleet
);

adminVehicleRouter.patch(
  '/:id/verify',
  [
    param('id').isInt({ min: 1 }).withMessage('Valid vehicle ID is required.'),
    body('isVerified').isBoolean().withMessage('isVerified must be a boolean.'),
  ],
  validateRequest,
  vehicleController.verifyVehicle
);

adminVehicleRouter.patch(
  '/:id/status',
  [
    param('id').isInt({ min: 1 }).withMessage('Valid vehicle ID is required.'),
    body('status').isIn(['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'BLOCKED']).withMessage('Valid status is required.'),
  ],
  validateRequest,
  vehicleController.updateVehicleStatusByAdmin
);
