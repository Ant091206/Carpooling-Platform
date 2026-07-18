import tripService from '../services/tripService.js';
import { successResponse } from '../utils/responseFormat.js';

class TripController {
    async getPassengerTrips(req, res, next) {
        try {
            const passengerId = req.user.id;
            const trips = await tripService.getPassengerTrips(passengerId);
            res.status(200).json(successResponse('Passenger trips retrieved successfully.', trips));
        } catch (error) {
            next(error);
        }
    }

    async getUpcomingTrips(req, res, next) {
        try {
            const passengerId = req.user.id;
            const trips = await tripService.getUpcomingTrips(passengerId);
            res.status(200).json(successResponse('Upcoming trips retrieved successfully.', trips));
        } catch (error) {
            next(error);
        }
    }

    async getOngoingTrips(req, res, next) {
        try {
            const passengerId = req.user.id;
            const trips = await tripService.getOngoingTrips(passengerId);
            res.status(200).json(successResponse('Ongoing trips retrieved successfully.', trips));
        } catch (error) {
            next(error);
        }
    }

    async getCompletedTrips(req, res, next) {
        try {
            const passengerId = req.user.id;
            const trips = await tripService.getCompletedTrips(passengerId);
            res.status(200).json(successResponse('Completed trips retrieved successfully.', trips));
        } catch (error) {
            next(error);
        }
    }

    async getTripById(req, res, next) {
        try {
            const userId = req.user.id;
            const tripId = parseInt(req.params.id, 10);
            const trip = await tripService.getTripById(tripId, userId);
            res.status(200).json(successResponse('Trip details retrieved successfully.', trip));
        } catch (error) {
            next(error);
        }
    }

    async getDriverTrips(req, res, next) {
        try {
            const driverId = req.user.id;
            const trips = await tripService.getDriverTrips(driverId);
            res.status(200).json(successResponse('Driver trips retrieved successfully.', trips));
        } catch (error) {
            next(error);
        }
    }

    async startTrip(req, res, next) {
        try {
            const driverId = req.user.id;
            const tripId = parseInt(req.params.id, 10);
            const trip = await tripService.startTrip(tripId, driverId);
            res.status(200).json(successResponse('Trip started successfully.', trip));
        } catch (error) {
            next(error);
        }
    }

    async updateTripProgress(req, res, next) {
        try {
            const driverId = req.user.id;
            const tripId = parseInt(req.params.id, 10);
            const trip = await tripService.updateTripProgress(tripId, driverId);
            res.status(200).json(successResponse('Trip progress updated successfully.', trip));
        } catch (error) {
            next(error);
        }
    }

    async completeTrip(req, res, next) {
        try {
            const driverId = req.user.id;
            const tripId = parseInt(req.params.id, 10);
            const trip = await tripService.completeTrip(tripId, driverId);
            res.status(200).json(successResponse('Trip completed successfully.', trip));
        } catch (error) {
            next(error);
        }
    }
}

export default new TripController();
