import express from 'express';
import { body, param } from 'express-validator';
import vehicleController from '../controllers/vehicleController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Vehicle management API
 */

router.post(
    '/',
    authMiddleware,
    [
        body('vehicle_name').notEmpty().withMessage('Vehicle name is required'),
        body('brand').notEmpty().withMessage('Brand is required'),
        body('model').notEmpty().withMessage('Model is required'),
        body('registration_number').notEmpty().withMessage('Registration number is required'),
        body('fuel_type').isIn(['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid']).withMessage('Invalid fuel type'),
        body('seat_capacity').isInt({ min: 1, max: 10 }).withMessage('Seat capacity must be between 1 and 10'),
        body('is_default').optional().isBoolean()
    ],
    validateRequest,
    vehicleController.addVehicle
);

router.get('/', authMiddleware, vehicleController.getAllVehicles);

router.get(
    '/:id',
    authMiddleware,
    [param('id').isInt().withMessage('Invalid vehicle ID')],
    validateRequest,
    vehicleController.getVehicleById
);

router.put(
    '/:id',
    authMiddleware,
    [
        param('id').isInt().withMessage('Invalid vehicle ID'),
        body('fuel_type').optional().isIn(['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid']).withMessage('Invalid fuel type'),
        body('seat_capacity').optional().isInt({ min: 1, max: 10 }).withMessage('Seat capacity must be between 1 and 10'),
        body('is_default').optional().isBoolean()
    ],
    validateRequest,
    vehicleController.updateVehicle
);

router.delete(
    '/:id',
    authMiddleware,
    [param('id').isInt().withMessage('Invalid vehicle ID')],
    validateRequest,
    vehicleController.deleteVehicle
);

router.patch(
    '/default/:id',
    authMiddleware,
    [param('id').isInt().withMessage('Invalid vehicle ID')],
    validateRequest,
    vehicleController.setDefaultVehicle
);

router.post(
    '/upload',
    authMiddleware,
    upload.single('vehicle_image'),
    vehicleController.uploadVehicleImage
);

export default router;
