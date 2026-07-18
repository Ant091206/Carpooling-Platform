import vehicleRepository from '../repositories/vehicleRepository.js';
import ApiError from '../utils/ApiError.js';

class VehicleService {
    async addVehicle(owner_id, data) {
        const existing = await vehicleRepository.findByRegistrationNumber(data.registration_number);
        if (existing) {
            throw new ApiError(400, 'Registration number already exists.');
        }

        if (data.is_default) {
            await vehicleRepository.resetDefaultVehicle(owner_id);
        }

        const vehicleId = await vehicleRepository.create({ ...data, owner_id });
        return this.getVehicleById(vehicleId, owner_id);
    }

    async getAllVehicles(owner_id) {
        return await vehicleRepository.findAllByOwnerId(owner_id);
    }

    async getVehicleById(id, owner_id) {
        const vehicle = await vehicleRepository.findByIdAndOwner(id, owner_id);
        if (!vehicle) {
            throw new ApiError(404, 'Vehicle not found or you do not have permission.');
        }
        return vehicle;
    }

    async updateVehicle(id, owner_id, data) {
        await this.getVehicleById(id, owner_id);

        if (data.registration_number) {
            const existing = await vehicleRepository.findByRegistrationNumber(data.registration_number, id);
            if (existing) {
                throw new ApiError(400, 'Registration number already exists.');
            }
        }

        if (data.is_default) {
            await vehicleRepository.resetDefaultVehicle(owner_id);
        }

        await vehicleRepository.update(id, data);
        return this.getVehicleById(id, owner_id);
    }

    async deleteVehicle(id, owner_id) {
        await this.getVehicleById(id, owner_id);
        await vehicleRepository.delete(id, owner_id);
        return true;
    }

    async setDefaultVehicle(id, owner_id) {
        await this.getVehicleById(id, owner_id);
        await vehicleRepository.resetDefaultVehicle(owner_id);
        await vehicleRepository.setDefaultVehicle(id, owner_id);
        return this.getVehicleById(id, owner_id);
    }

    async uploadVehicleImage(id, owner_id, filename) {
        await this.getVehicleById(id, owner_id);
        await vehicleRepository.update(id, { vehicle_image: filename });
        return this.getVehicleById(id, owner_id);
    }
}

export default new VehicleService();
