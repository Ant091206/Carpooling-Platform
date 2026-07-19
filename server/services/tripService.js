import tripRepository from '../repositories/tripRepository.js';
import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { notifyUser } from '../utils/socketIo.js';

class TripService {
    async getPassengerTrips(passengerId) {
        return await tripRepository.findAllByPassengerId(passengerId);
    }

    async getUpcomingTrips(passengerId) {
        return await tripRepository.findAllByPassengerIdAndStatuses(passengerId, ['BOOKED', 'ACCEPTED']);
    }

    async getOngoingTrips(passengerId) {
        return await tripRepository.findAllByPassengerIdAndStatuses(passengerId, ['STARTED', 'IN_PROGRESS']);
    }

    async getCompletedTrips(passengerId) {
        return await tripRepository.findAllByPassengerIdAndStatuses(passengerId, ['COMPLETED']);
    }

    async getDriverTrips(driverId) {
        return await tripRepository.findAllByDriverId(driverId);
    }

    async getTripById(tripId, userId) {
        const trip = await tripRepository.findById(tripId);
        if (!trip) {
            throw new ApiError(404, 'Trip not found.');
        }

        // Access control: passenger or driver only
        if (trip.passengerId !== userId && trip.driverId !== userId) {
            throw new ApiError(403, 'You do not have permission to view this trip.');
        }

        // Fetch vehicle information to return complete details
        let vehicle = null;
        if (trip.ride.vehicleId) {
            const dbVehicle = await prisma.vehicle.findUnique({
                where: { id: trip.ride.vehicleId },
                select: { id: true, model: true, registrationNumber: true, color: true }
            });
            if (dbVehicle) {
                vehicle = {
                    id: dbVehicle.id,
                    model: dbVehicle.model,
                    plateNumber: dbVehicle.registrationNumber,
                    color: dbVehicle.color
                };
            }
        }

        return {
            ...trip,
            vehicle
        };
    }

    async startTrip(tripId, driverId) {
        const trip = await tripRepository.findById(tripId);
        if (!trip) {
            throw new ApiError(404, 'Trip not found.');
        }

        if (trip.driverId !== driverId) {
            throw new ApiError(403, 'You are not authorized to start this trip.');
        }

        if (trip.status === 'COMPLETED') {
            throw new ApiError(400, 'Completed trips cannot be modified.');
        }

        if (trip.status === 'CANCELLED') {
            throw new ApiError(400, 'Cancelled trips cannot restart.');
        }

        const allowed = ['BOOKED', 'ACCEPTED'];
        if (!allowed.includes(trip.status)) {
            throw new ApiError(400, `Cannot transition trip status from ${trip.status} to STARTED.`);
        }

        const updatedTrip = await tripRepository.update(tripId, {
            status: 'STARTED',
            startedAt: new Date()
        });

        // Notify passenger
        notifyUser(trip.passengerId, 'ride_notification', {
            type: 'TRIP_STARTED',
            message: `Your trip with driver ${updatedTrip.driver.name} has started!`,
            trip: updatedTrip
        });

        return updatedTrip;
    }

    async updateTripProgress(tripId, driverId) {
        const trip = await tripRepository.findById(tripId);
        if (!trip) {
            throw new ApiError(404, 'Trip not found.');
        }

        if (trip.driverId !== driverId) {
            throw new ApiError(403, 'You are not authorized to update progress on this trip.');
        }

        if (trip.status === 'COMPLETED') {
            throw new ApiError(400, 'Completed trips cannot be modified.');
        }

        if (trip.status === 'CANCELLED') {
            throw new ApiError(400, 'Cancelled trips cannot restart.');
        }

        if (trip.status !== 'STARTED') {
            throw new ApiError(400, `Cannot transition trip status from ${trip.status} to IN_PROGRESS.`);
        }

        const updatedTrip = await tripRepository.update(tripId, {
            status: 'IN_PROGRESS'
        });

        // Notify passenger
        notifyUser(trip.passengerId, 'ride_notification', {
            type: 'TRIP_IN_PROGRESS',
            message: `Your trip with driver ${updatedTrip.driver.name} is now in progress.`,
            trip: updatedTrip
        });

        return updatedTrip;
    }

    async completeTrip(tripId, driverId) {
        const trip = await tripRepository.findById(tripId);
        if (!trip) {
            throw new ApiError(404, 'Trip not found.');
        }

        if (trip.driverId !== driverId) {
            throw new ApiError(403, 'You are not authorized to complete this trip.');
        }

        if (trip.status === 'COMPLETED') {
            throw new ApiError(400, 'Completed trips cannot be modified.');
        }

        if (trip.status === 'CANCELLED') {
            throw new ApiError(400, 'Cancelled trips cannot restart.');
        }

        const allowed = ['STARTED', 'IN_PROGRESS'];
        if (!allowed.includes(trip.status)) {
            throw new ApiError(400, `Cannot transition trip status from ${trip.status} to COMPLETED.`);
        }

        // Complete Trip and Booking atomically
        const result = await prisma.$transaction(async (tx) => {
            const updatedTrip = await tx.trip.update({
                where: { id: tripId },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date()
                },
                include: {
                    ride: {
                        select: {
                            id: true,
                            pickupName: true,
                            destinationName: true,
                            departureTime: true,
                        }
                    },
                    passenger: { select: { id: true, name: true, email: true } },
                    driver: { select: { id: true, name: true, email: true } },
                }
            });

            await tx.booking.update({
                where: { id: trip.bookingId },
                data: { status: 'COMPLETED' }
            });

            return updatedTrip;
        });

        // Notify passenger
        notifyUser(trip.passengerId, 'ride_notification', {
            type: 'TRIP_COMPLETED',
            message: `Your trip with driver ${result.driver.name} has completed! Thank you for ride sharing.`,
            trip: result
        });

        return result;
    }
}

export default new TripService();
