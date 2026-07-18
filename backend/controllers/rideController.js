import rideService from '../services/rideService.js';
import { successResponse } from '../utils/responseFormat.js';

class RideController {
    async publishRide(req, res, next) {
        try {
            const driver_id = req.user.id;
            const ride = await rideService.publishRide(driver_id, req.body);
            res.status(201).json(successResponse('Ride published successfully', ride));
        } catch (error) {
            next(error);
        }
    }

    async getMyRides(req, res, next) {
        try {
            const driver_id = req.user.id;
            const rides = await rideService.getMyRides(driver_id);
            res.status(200).json(successResponse('Rides retrieved successfully', rides));
        } catch (error) {
            next(error);
        }
    }

    async getRideById(req, res, next) {
        try {
            const driver_id = req.user.id;
            const { id } = req.params;
            const ride = await rideService.getRideById(id, driver_id);
            res.status(200).json(successResponse('Ride retrieved successfully', ride));
        } catch (error) {
            next(error);
        }
    }

    async updateRide(req, res, next) {
        try {
            const driver_id = req.user.id;
            const { id } = req.params;
            const ride = await rideService.updateRide(id, driver_id, req.body);
            res.status(200).json(successResponse('Ride updated successfully', ride));
        } catch (error) {
            next(error);
        }
    }

    async deleteRide(req, res, next) {
        try {
            const driver_id = req.user.id;
            const { id } = req.params;
            await rideService.deleteRide(id, driver_id);
            res.status(200).json(successResponse('Ride deleted successfully'));
        } catch (error) {
            next(error);
        }
    }

    async startRide(req, res, next) {
        try {
            const driver_id = req.user.id;
            const { id } = req.params;
            const ride = await rideService.updateRideStatus(id, driver_id, 'Started');
            res.status(200).json(successResponse('Ride started successfully', ride));
        } catch (error) {
            next(error);
        }
    }

    async completeRide(req, res, next) {
        try {
            const driver_id = req.user.id;
            const { id } = req.params;
            const ride = await rideService.updateRideStatus(id, driver_id, 'Completed');
            res.status(200).json(successResponse('Ride completed successfully', ride));
        } catch (error) {
            next(error);
        }
    }

    async cancelRide(req, res, next) {
        try {
            const driver_id = req.user.id;
            const { id } = req.params;
            const ride = await rideService.updateRideStatus(id, driver_id, 'Cancelled');
            res.status(200).json(successResponse('Ride cancelled successfully', ride));
        } catch (error) {
            next(error);
        }
    }
}

export default new RideController();
