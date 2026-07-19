import rideRepository from '../repositories/rideRepository.js';
import vehicleRepository from '../repositories/vehicleRepository.js';
import mapboxService from './mapboxService.js';
import ApiError from '../utils/ApiError.js';
import prisma from '../config/db.js';
import { notifyUser } from '../utils/socketIo.js';

class RideService {
    async publishRide(driver_id, rideData) {
        const {
            vehicle_id, pickup_name, pickup_lng, pickup_lat,
            destination_name, dest_lng, dest_lat, departure_time,
            available_seats, fare_per_seat, is_recurring, notes
        } = rideData;

        // 1. Validate Vehicle Existence and Ownership
        const vehicle = await vehicleRepository.findByIdAndOwner(vehicle_id, driver_id);
        if (!vehicle) {
            throw new ApiError(404, 'Vehicle not found or you do not have permission.');
        }

        // 2. Validate Seats
        if (available_seats > vehicle.seat_capacity) {
            throw new ApiError(400, `Available seats cannot exceed vehicle capacity (${vehicle.seat_capacity}).`);
        }

        // 3. Validate Date (must be in future)
        if (new Date(departure_time) <= new Date()) {
            throw new ApiError(400, 'Departure time must be in the future.');
        }

        // 3.5 Validate No Duplicate Ride
        const depTime = new Date(departure_time);
        depTime.setMilliseconds(0);

        const duplicateRide = await prisma.ride.findFirst({
            where: {
                driverId: parseInt(driver_id, 10),
                departureTime: depTime,
                rideStatus: { not: 'Cancelled' }
            }
        });
        if (duplicateRide) {
            throw new ApiError(409, 'You have already published a ride at this departure time.');
        }

        // 4. Validate Pickup != Destination
        if (pickup_lng === dest_lng && pickup_lat === dest_lat) {
            throw new ApiError(400, 'Pickup location cannot be the same as destination location.');
        }

        // 5. Calculate Route Details from Mapbox
        const routeDetails = await mapboxService.getRouteDetails(
            pickup_lng, pickup_lat, dest_lng, dest_lat
        );

        // 6. Save to Database
        const fullRideData = {
            driver_id,
            vehicle_id,
            pickup_name,
            pickup_lng,
            pickup_lat,
            destination_name,
            dest_lng,
            dest_lat,
            departure_time,
            available_seats,
            fare_per_seat,
            is_recurring,
            notes,
            ...routeDetails
        };

        const rideId = await rideRepository.create(fullRideData);
        return this.getRideById(rideId, driver_id); // Return the newly created ride
    }

    async getRideById(id, driver_id) {
        const ride = await rideRepository.findById(id);
        if (!ride || (driver_id && ride.driver_id !== driver_id)) {
            throw new ApiError(404, 'Ride not found or access denied.');
        }
        return ride;
    }

    async getMyRides(driver_id) {
        return await rideRepository.findAllByDriverId(driver_id);
    }

    async updateRide(id, driver_id, updateData) {
        const ride = await this.getRideById(id, driver_id);

        if (ride.ride_status !== 'Scheduled') {
            throw new ApiError(400, 'Can only update rides that are in Scheduled status.');
        }

        // If seats are updated, validate against vehicle again
        if (updateData.available_seats) {
            const vehicle = await vehicleRepository.findByIdAndOwner(ride.vehicle_id, driver_id);
            if (updateData.available_seats > vehicle.seat_capacity) {
                throw new ApiError(400, `Available seats cannot exceed vehicle capacity (${vehicle.seat_capacity}).`);
            }
        }

        if (updateData.departure_time && new Date(updateData.departure_time) <= new Date()) {
            throw new ApiError(400, 'Departure time must be in the future.');
        }

        await rideRepository.update(id, driver_id, updateData);
        return this.getRideById(id, driver_id);
    }

    async deleteRide(id, driver_id) {
        const ride = await this.getRideById(id, driver_id);
        if (ride.ride_status === 'In Progress' || ride.ride_status === 'Started') {
             throw new ApiError(400, 'Cannot delete a ride that has already started.');
        }

        // Fetch passengers to notify before deleting
        try {
            const bookings = await prisma.booking.findMany({
                where: { rideId: parseInt(id, 10), status: { in: ['ACCEPTED', 'PENDING'] } },
                select: { passengerId: true }
            });

            const triggerService = (await import('./notification/notificationTriggerService.js')).default;
            const rideDetails = {
                rideId: ride.id,
                pickup: ride.pickup_name,
                destination: ride.destination_name,
                date: ride.departure_time.toISOString()
            };

            for (const booking of bookings) {
                const passenger = await prisma.user.findUnique({
                    where: { id: booking.passengerId },
                    select: { name: true, email: true }
                });
                await triggerService.notifyRideCancelled({
                    userId: booking.passengerId,
                    userName: passenger.name,
                    userEmail: passenger.email,
                    rideDetails,
                    reason: 'Ride deleted by driver'
                });
            }
        } catch (err) {
            console.error('Error triggering deleteRide notifications:', err);
        }

        await rideRepository.delete(id, driver_id);
        return true;
    }

    async updateRideStatus(id, driver_id, status) {
        // Simple state machine validation
        const ride = await this.getRideById(id, driver_id);
        
        const validTransitions = {
            'Scheduled': ['Started', 'Cancelled'],
            'Started': ['In Progress', 'Completed', 'Cancelled'],
            'In Progress': ['Completed', 'Cancelled'],
            'Completed': [],
            'Cancelled': []
        };

        if (!validTransitions[ride.ride_status].includes(status)) {
            throw new ApiError(400, `Invalid status transition from ${ride.ride_status} to ${status}.`);
        }

        await rideRepository.updateStatus(id, driver_id, status);
        const updatedRide = await this.getRideById(id, driver_id);

        // Fetch bookings for this ride that are ACCEPTED
        const bookings = await prisma.booking.findMany({
            where: { rideId: parseInt(id, 10), status: 'ACCEPTED' },
            select: { passengerId: true }
        });

        // Notify each passenger via Socket.io
        for (const booking of bookings) {
            notifyUser(booking.passengerId, 'ride_notification', {
                type: `RIDE_${status.toUpperCase()}`,
                message: `The ride from ${ride.pickupName} to ${ride.destinationName} has been ${status.toLowerCase()}!`,
                ride: updatedRide
            });
        }

        // Module 12 Notifications
        try {
            const triggerService = (await import('./notification/notificationTriggerService.js')).default;
            const rideDetails = {
                rideId: updatedRide.id,
                pickup: updatedRide.pickupName,
                destination: updatedRide.destinationName,
                date: updatedRide.departureTime.toISOString()
            };

            for (const booking of bookings) {
                const passenger = await prisma.user.findUnique({
                    where: { id: booking.passengerId },
                    select: { name: true, email: true }
                });

                if (status === 'Started') {
                    await triggerService.notifyRideStarted({
                        userId: booking.passengerId,
                        rideDetails
                    });
                } else if (status === 'Completed') {
                    await triggerService.notifyRideCompleted({
                        userId: booking.passengerId,
                        rideDetails
                    });
                } else if (status === 'Cancelled') {
                    await triggerService.notifyRideCancelled({
                        userId: booking.passengerId,
                        userName: passenger.name,
                        userEmail: passenger.email,
                        rideDetails,
                        reason: 'Cancelled by driver'
                    });
                }
            }
        } catch (err) {
            console.error('Error triggering ride status notifications:', err);
        }

        return updatedRide;
    }

    async searchRides(filters) {
        return await rideRepository.search(filters);
    }
}

export default new RideService();
