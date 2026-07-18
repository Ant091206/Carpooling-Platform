import prisma from '../config/db.js';

class Vehicle {
  /**
   * Insert a new vehicle record
   * @param {number} userId Associated employee user ID
   * @param {object} vehicleData Vehicle parameters
   */
  static async create(userId, { model, plate_number, color, capacity, type = null }) {
    const vehicle = await prisma.vehicle.create({
      data: {
        userId,
        model,
        plateNumber: plate_number,
        color,
        capacity: parseInt(capacity, 10),
        type
      }
    });

    return {
      ...vehicle,
      user_id: vehicle.userId,
      plate_number: vehicle.plateNumber,
      created_at: vehicle.createdAt,
      updated_at: vehicle.updatedAt
    };
  }

  /**
   * Find vehicle details by unique record ID
   * @param {number} id
   */
  static async findById(id) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    });

    if (!vehicle) return null;

    return {
      ...vehicle,
      user_id: vehicle.userId,
      plate_number: vehicle.plateNumber,
      created_at: vehicle.createdAt,
      updated_at: vehicle.updatedAt
    };
  }

  /**
   * Find all vehicles registered for a user
   * @param {number} userId
   */
  static async findAllByUserId(userId) {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return vehicles.map((vehicle) => ({
      ...vehicle,
      user_id: vehicle.userId,
      plate_number: vehicle.plateNumber,
      created_at: vehicle.createdAt,
      updated_at: vehicle.updatedAt
    }));
  }

  /**
   * Find vehicle by license plate number
   * @param {string} plateNumber
   */
  static async findByPlateNumber(plateNumber) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { plateNumber }
    });

    if (!vehicle) return null;

    return {
      ...vehicle,
      user_id: vehicle.userId,
      plate_number: vehicle.plateNumber,
      created_at: vehicle.createdAt,
      updated_at: vehicle.updatedAt
    };
  }

  /**
   * Update vehicle parameters
   * @param {number} id Vehicle ID
   * @param {object} vehicleData Parameters to update
   */
  static async update(id, { model, plate_number, color, capacity, type }) {
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        model,
        plateNumber: plate_number,
        color,
        capacity: parseInt(capacity, 10),
        type
      }
    });

    return {
      ...vehicle,
      user_id: vehicle.userId,
      plate_number: vehicle.plateNumber,
      created_at: vehicle.createdAt,
      updated_at: vehicle.updatedAt
    };
  }

  /**
   * Delete vehicle record
   * @param {number} id Vehicle ID
   */
  static async delete(id) {
    try {
      const vehicle = await prisma.vehicle.delete({
        where: { id }
      });
      return !!vehicle;
    } catch (error) {
      return false;
    }
  }
}

export default Vehicle;
export { Vehicle };
