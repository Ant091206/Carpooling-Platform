import { Router } from 'express';
import { VehicleController } from '../controllers/vehicleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { vehicleValidator } from '../validators/vehicleValidator.js';

const router = Router();

// Protect all routes within this module using the authentication middleware
router.use(authMiddleware);

router.post('/', vehicleValidator, validateRequest, asyncHandler(VehicleController.create));
router.get('/', asyncHandler(VehicleController.list));
router.put('/:id', vehicleValidator, validateRequest, asyncHandler(VehicleController.update));
router.delete('/:id', asyncHandler(VehicleController.delete));

export default router;
