const rideRepository = require('../repositories/rideRepository');
const vehicleRepository = require('../repositories/vehicleRepository');
const mapboxService = require('./mapboxService');

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
            throw new Error('Vehicle not found or you do not have permission.');
        }

        // 2. Validate Seats
        if (available_seats > vehicle.seat_capacity) {
            throw new Error(`Available seats cannot exceed vehicle capacity (${vehicle.seat_capacity}).`);
        }

        // 3. Validate Date (must be in future)
        if (new Date(departure_time) <= new Date()) {
            throw new Error('Departure time must be in the future.');
        }

        // 4. Validate Pickup != Destination
        if (pickup_lng === dest_lng && pickup_lat === dest_lat) {
            throw new Error('Pickup location cannot be the same as destination location.');
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
            throw new Error('Ride not found or access denied.');
        }
        return ride;
    }

    async getMyRides(driver_id) {
        return await rideRepository.findAllByDriverId(driver_id);
    }

    async updateRide(id, driver_id, updateData) {
        const ride = await this.getRideById(id, driver_id);

        if (ride.ride_status !== 'Scheduled') {
            throw new Error('Can only update rides that are in Scheduled status.');
        }

        // If seats are updated, validate against vehicle again
        if (updateData.available_seats) {
            const vehicle = await vehicleRepository.findByIdAndOwner(ride.vehicle_id, driver_id);
            if (updateData.available_seats > vehicle.seat_capacity) {
                throw new Error(`Available seats cannot exceed vehicle capacity (${vehicle.seat_capacity}).`);
            }
        }

        if (updateData.departure_time && new Date(updateData.departure_time) <= new Date()) {
            throw new Error('Departure time must be in the future.');
        }

        // To keep it simple, changing locations via update is not allowed here.
        // If they want to change locations, they should cancel and publish a new ride.

        await rideRepository.update(id, driver_id, updateData);
        return this.getRideById(id, driver_id);
    }

    async deleteRide(id, driver_id) {
        const ride = await this.getRideById(id, driver_id);
        if (ride.ride_status === 'In Progress' || ride.ride_status === 'Started') {
             throw new Error('Cannot delete a ride that has already started.');
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
            throw new Error(`Invalid status transition from ${ride.ride_status} to ${status}.`);
        }

        await rideRepository.updateStatus(id, driver_id, status);
        return this.getRideById(id, driver_id);
    }
}

module.exports = new RideService();
