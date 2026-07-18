const vehicleService = require('../services/vehicleService');
const { successResponse } = require('../utils/responseFormat');

class VehicleController {
    async addVehicle(req, res, next) {
        try {
            const owner_id = req.user.id;
            const vehicle = await vehicleService.addVehicle(owner_id, req.body);
            res.status(201).json(successResponse('Vehicle added successfully', vehicle));
        } catch (error) {
            next(error);
        }
    }

    async getAllVehicles(req, res, next) {
        try {
            const owner_id = req.user.id;
            const vehicles = await vehicleService.getAllVehicles(owner_id);
            res.status(200).json(successResponse('Vehicles retrieved successfully', vehicles));
        } catch (error) {
            next(error);
        }
    }

    async getVehicleById(req, res, next) {
        try {
            const owner_id = req.user.id;
            const { id } = req.params;
            const vehicle = await vehicleService.getVehicleById(id, owner_id);
            res.status(200).json(successResponse('Vehicle retrieved successfully', vehicle));
        } catch (error) {
            next(error);
        }
    }

    async updateVehicle(req, res, next) {
        try {
            const owner_id = req.user.id;
            const { id } = req.params;
            const vehicle = await vehicleService.updateVehicle(id, owner_id, req.body);
            res.status(200).json(successResponse('Vehicle updated successfully', vehicle));
        } catch (error) {
            next(error);
        }
    }

    async deleteVehicle(req, res, next) {
        try {
            const owner_id = req.user.id;
            const { id } = req.params;
            await vehicleService.deleteVehicle(id, owner_id);
            res.status(200).json(successResponse('Vehicle deleted successfully'));
        } catch (error) {
            next(error);
        }
    }

    async setDefaultVehicle(req, res, next) {
        try {
            const owner_id = req.user.id;
            const { id } = req.params;
            const vehicle = await vehicleService.setDefaultVehicle(id, owner_id);
            res.status(200).json(successResponse('Default vehicle set successfully', vehicle));
        } catch (error) {
            next(error);
        }
    }

    async uploadVehicleImage(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No image provided.' });
            }
            
            const owner_id = req.user.id;
            const { id } = req.body;
            
            if (!id) {
                 return res.status(400).json({ success: false, message: 'Vehicle ID is required.' });
            }

            const vehicle = await vehicleService.uploadVehicleImage(id, owner_id, req.file.filename);
            res.status(200).json(successResponse('Vehicle image uploaded successfully', vehicle));
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new VehicleController();
