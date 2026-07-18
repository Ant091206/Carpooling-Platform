const express = require('express');
const { body, param } = require('express-validator');
const vehicleController = require('../controllers/vehicleController');
const mockAuth = require('../middlewares/mockAuth');
const validate = require('../middlewares/validate');
const uploadMiddleware = require('../middlewares/upload');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Vehicle management API
 */

/**
 * @swagger
 * /vehicle:
 *   post:
 *     summary: Add a new vehicle
 *     tags: [Vehicles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle_name
 *               - brand
 *               - model
 *               - registration_number
 *               - fuel_type
 *               - seat_capacity
 *             properties:
 *               vehicle_name:
 *                 type: string
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               registration_number:
 *                 type: string
 *               color:
 *                 type: string
 *               fuel_type:
 *                 type: string
 *                 enum: [Petrol, Diesel, CNG, Electric, Hybrid]
 *               seat_capacity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               is_default:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Vehicle added successfully
 */
router.post(
    '/',
    mockAuth,
    [
        body('vehicle_name').notEmpty().withMessage('Vehicle name is required'),
        body('brand').notEmpty().withMessage('Brand is required'),
        body('model').notEmpty().withMessage('Model is required'),
        body('registration_number').notEmpty().withMessage('Registration number is required'),
        body('fuel_type').isIn(['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid']).withMessage('Invalid fuel type'),
        body('seat_capacity').isInt({ min: 1, max: 10 }).withMessage('Seat capacity must be between 1 and 10'),
        body('is_default').optional().isBoolean()
    ],
    validate,
    vehicleController.addVehicle
);

/**
 * @swagger
 * /vehicle:
 *   get:
 *     summary: Get all vehicles for the authenticated user
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: Vehicles retrieved successfully
 */
router.get('/', mockAuth, vehicleController.getAllVehicles);

/**
 * @swagger
 * /vehicle/{id}:
 *   get:
 *     summary: Get a vehicle by ID
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vehicle retrieved successfully
 */
router.get(
    '/:id',
    mockAuth,
    [param('id').isInt().withMessage('Invalid vehicle ID')],
    validate,
    vehicleController.getVehicleById
);

/**
 * @swagger
 * /vehicle/{id}:
 *   put:
 *     summary: Update a vehicle by ID
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vehicle_name:
 *                 type: string
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               registration_number:
 *                 type: string
 *               color:
 *                 type: string
 *               fuel_type:
 *                 type: string
 *                 enum: [Petrol, Diesel, CNG, Electric, Hybrid]
 *               seat_capacity:
 *                 type: integer
 *               is_default:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 */
router.put(
    '/:id',
    mockAuth,
    [
        param('id').isInt().withMessage('Invalid vehicle ID'),
        body('fuel_type').optional().isIn(['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid']).withMessage('Invalid fuel type'),
        body('seat_capacity').optional().isInt({ min: 1, max: 10 }).withMessage('Seat capacity must be between 1 and 10'),
        body('is_default').optional().isBoolean()
    ],
    validate,
    vehicleController.updateVehicle
);

/**
 * @swagger
 * /vehicle/{id}:
 *   delete:
 *     summary: Delete a vehicle by ID
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 */
router.delete(
    '/:id',
    mockAuth,
    [param('id').isInt().withMessage('Invalid vehicle ID')],
    validate,
    vehicleController.deleteVehicle
);

/**
 * @swagger
 * /vehicle/default/{id}:
 *   patch:
 *     summary: Set a vehicle as default
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Default vehicle set successfully
 */
router.patch(
    '/default/:id',
    mockAuth,
    [param('id').isInt().withMessage('Invalid vehicle ID')],
    validate,
    vehicleController.setDefaultVehicle
);

/**
 * @swagger
 * /vehicle/upload:
 *   post:
 *     summary: Upload vehicle image
 *     tags: [Vehicles]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               vehicle_image:
 *                 type: string
 *                 format: binary
 *               id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Vehicle image uploaded successfully
 */
router.post(
    '/upload',
    mockAuth,
    uploadMiddleware,
    vehicleController.uploadVehicleImage
);

module.exports = router;
