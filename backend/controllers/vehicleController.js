import VehicleService from '../services/vehicleService.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

class VehicleController {
  /**
   * Register a new vehicle for the employee
   */
  static create = async (req, res) => {
    const vehicle = await VehicleService.addVehicle(req.user.id, req.body);
    return new ApiResponse(201, vehicle, 'Vehicle registered successfully').send(res);
  };

  /**
   * Fetch all vehicles registered to the employee
   */
  static list = async (req, res) => {
    const vehicles = await VehicleService.getEmployeeVehicles(req.user.id);
    return new ApiResponse(200, vehicles, 'Vehicles fetched successfully').send(res);
  };

  /**
   * Update vehicle parameters
   */
  static update = async (req, res) => {
    const vehicleId = parseInt(req.params.id, 10);
    if (isNaN(vehicleId)) {
      throw new ApiError(400, 'Invalid vehicle record identifier');
    }

    const updatedVehicle = await VehicleService.updateVehicle(req.user.id, vehicleId, req.body);
    return new ApiResponse(200, updatedVehicle, 'Vehicle updated successfully').send(res);
  };

  /**
   * Delete vehicle record
   */
  static delete = async (req, res) => {
    const vehicleId = parseInt(req.params.id, 10);
    if (isNaN(vehicleId)) {
      throw new ApiError(400, 'Invalid vehicle record identifier');
    }

    await VehicleService.deleteVehicle(req.user.id, vehicleId);
    return new ApiResponse(200, null, 'Vehicle deleted successfully').send(res);
  };
}

export default VehicleController;
export { VehicleController };
