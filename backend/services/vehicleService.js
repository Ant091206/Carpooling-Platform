import Vehicle from '../models/Vehicle.js';
import ApiError from '../utils/ApiError.js';

class VehicleService {
  /**
   * Register a new vehicle for the authenticated employee
   * @param {number} userId Authenticated user ID
   * @param {object} vehicleData Vehicle attributes
   */
  static async addVehicle(userId, vehicleData) {
    // Check duplicate license plate number
    const existingVehicle = await Vehicle.findByPlateNumber(vehicleData.plate_number);
    if (existingVehicle) {
      throw new ApiError(400, `License plate number '${vehicleData.plate_number}' is already registered to another vehicle`);
    }

    return await Vehicle.create(userId, vehicleData);
  }

  /**
   * Retrieve all vehicles belonging to the employee
   * @param {number} userId
   */
  static async getEmployeeVehicles(userId) {
    return await Vehicle.findAllByUserId(userId);
  }

  /**
   * Update employee vehicle details
   * @param {number} userId Authenticated user ID
   * @param {number} vehicleId Target vehicle ID
   * @param {object} vehicleData Fields to update
   */
  static async updateVehicle(userId, vehicleId, vehicleData) {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle profile record not found');
    }

    // Ownership check
    if (vehicle.user_id !== userId) {
      throw new ApiError(403, 'Access denied. You do not have permissions to modify this vehicle');
    }

    // Check duplicate license plate number if changed
    const existingVehicle = await Vehicle.findByPlateNumber(vehicleData.plate_number);
    if (existingVehicle && existingVehicle.id !== vehicleId) {
      throw new ApiError(400, `License plate number '${vehicleData.plate_number}' is already registered to another vehicle`);
    }

    return await Vehicle.update(vehicleId, vehicleData);
  }

  /**
   * Remove a vehicle record from the employee profile
   * @param {number} userId Authenticated user ID
   * @param {number} vehicleId Target vehicle ID
   */
  static async deleteVehicle(userId, vehicleId) {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle profile record not found');
    }

    // Ownership check
    if (vehicle.user_id !== userId) {
      throw new ApiError(403, 'Access denied. You do not have permissions to delete this vehicle');
    }

    await Vehicle.delete(vehicleId);
    return true;
  }
}

export default VehicleService;
export { VehicleService };
