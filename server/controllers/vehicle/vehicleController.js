import vehicleService from '../../services/vehicle/vehicleService.js';
import { successResponse } from '../../utils/responseFormat.js';

class VehicleController {
  async createVehicle(req, res, next) {
    try {
      const vehicle = await vehicleService.createVehicle(req.user.id, req.body);
      res.status(201).json(successResponse('Vehicle registered successfully.', vehicle));
    } catch (err) {
      next(err);
    }
  }

  async getUserVehicles(req, res, next) {
    try {
      const vehicles = await vehicleService.getUserVehicles(req.user.id);
      res.status(200).json(successResponse('User vehicles retrieved successfully.', vehicles));
    } catch (err) {
      next(err);
    }
  }

  async getVehicleById(req, res, next) {
    try {
      const vehicle = await vehicleService.getVehicleById(req.params.id, req.user.id, req.user.role);
      res.status(200).json(successResponse('Vehicle details retrieved successfully.', vehicle));
    } catch (err) {
      next(err);
    }
  }

  async updateVehicle(req, res, next) {
    try {
      const vehicle = await vehicleService.updateVehicle(req.params.id, req.user.id, req.body);
      res.status(200).json(successResponse('Vehicle details updated successfully.', vehicle));
    } catch (err) {
      next(err);
    }
  }

  async deleteVehicle(req, res, next) {
    try {
      const result = await vehicleService.deleteVehicle(req.params.id, req.user.id, req.user.role);
      res.status(200).json(successResponse(result.message, null));
    } catch (err) {
      next(err);
    }
  }

  async uploadDocument(req, res, next) {
    try {
      const document = await vehicleService.uploadDocument(req.params.id, req.user.id, req.body);
      res.status(201).json(successResponse('Vehicle document uploaded successfully.', document));
    } catch (err) {
      next(err);
    }
  }

  async getDocuments(req, res, next) {
    try {
      const documents = await vehicleService.getDocuments(req.params.id);
      res.status(200).json(successResponse('Vehicle documents retrieved successfully.', documents));
    } catch (err) {
      next(err);
    }
  }

  async deleteDocument(req, res, next) {
    try {
      const result = await vehicleService.deleteDocument(req.params.id, req.user.id, req.user.role);
      res.status(200).json(successResponse(result.message, null));
    } catch (err) {
      next(err);
    }
  }

  async toggleAvailability(req, res, next) {
    try {
      const vehicle = await vehicleService.toggleAvailability(req.params.id, req.user.id, req.body);
      res.status(200).json(successResponse('Vehicle availability updated successfully.', vehicle));
    } catch (err) {
      next(err);
    }
  }

  async verifyVehicle(req, res, next) {
    try {
      const vehicle = await vehicleService.verifyVehicle(req.user.id, req.params.id, req.body);
      res.status(200).json(successResponse('Vehicle verification status updated successfully.', vehicle));
    } catch (err) {
      next(err);
    }
  }

  async updateVehicleStatusByAdmin(req, res, next) {
    try {
      const vehicle = await vehicleService.updateVehicleStatusByAdmin(req.user.id, req.params.id, req.body);
      res.status(200).json(successResponse('Vehicle status updated successfully by Admin.', vehicle));
    } catch (err) {
      next(err);
    }
  }

  async getAdminFleet(req, res, next) {
    try {
      const { page, limit, search, status, isVerified, fuelType, vehicleType } = req.query;
      const data = await vehicleService.getAdminFleet({ page, limit, search, status, isVerified, fuelType, vehicleType });
      res.status(200).json(successResponse('Admin fleet list retrieved successfully.', data));
    } catch (err) {
      next(err);
    }
  }

  async setDefaultVehicle(req, res, next) {
    try {
      const vehicle = await vehicleService.setDefaultVehicle(req.user.id, req.params.id);
      res.status(200).json(successResponse('Vehicle set as default successfully.', vehicle));
    } catch (err) {
      next(err);
    }
  }

  async uploadVehicleImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided.' });
      }
      const vehicleId = parseInt(req.body.id || req.body.vehicleId, 10);
      if (isNaN(vehicleId)) {
        return res.status(400).json({ success: false, message: 'Valid vehicle ID is required.' });
      }
      const vehicle = await vehicleService.uploadVehicleImage(vehicleId, req.user.id, req.file.filename);
      res.status(200).json(successResponse('Vehicle image uploaded successfully.', vehicle));
    } catch (err) {
      next(err);
    }
  }
}

export default new VehicleController();
