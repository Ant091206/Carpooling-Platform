import bookingRepository from '../repositories/bookingRepository.js';
import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { notifyUser } from '../utils/socketIo.js';

class BookingService {
    async createBooking(passengerId, data) {
        const { rideId, requestedSeats } = data;

        // 1. Validate ride exists
        const ride = await prisma.ride.findUnique({
            where: { id: rideId },
            include: { driver: { select: { id: true, name: true, email: true } } },
        });

        if (!ride) {
            throw new ApiError(404, 'Ride not found.');
        }

        // 2. Passenger cannot book own ride
        if (ride.driverId === passengerId) {
            throw new ApiError(403, 'You cannot book your own ride.');
        }

        // 3. Ride must be schedulable (Scheduled only)
        if (ride.rideStatus !== 'Scheduled') {
            throw new ApiError(
                400,
                `Cannot book a ride with status "${ride.rideStatus}". Only Scheduled rides can be booked.`
            );
        }

        // 4. Sufficient seats
        if (ride.availableSeats < requestedSeats) {
            throw new ApiError(
                400,
                `Only ${ride.availableSeats} seat(s) available, but ${requestedSeats} requested.`
            );
        }

        // 5. No duplicate booking
        const duplicate = await bookingRepository.findDuplicateBooking(passengerId, rideId);
        if (duplicate) {
            throw new ApiError(409, 'You already have an active booking for this ride.');
        }

        // 6. Create booking (transaction inside repository)
        const booking = await bookingRepository.createWithSeatDecrement({
            rideId,
            passengerId,
            driverId: ride.driverId,
            requestedSeats,
        });

        // Notify driver of a new booking request
        notifyUser(booking.driverId, 'ride_notification', {
            type: 'BOOKING_REQUEST',
            message: `New booking request from a passenger for ${requestedSeats} seat(s).`,
            booking
        });

        return booking;
    }

    async getPassengerBookings(passengerId) {
        return await bookingRepository.findAllByPassenger(passengerId);
    }

    async getDriverBookings(driverId) {
        return await bookingRepository.findAllByDriver(driverId);
    }

    async getBookingById(bookingId, userId) {
        const booking = await bookingRepository.findById(bookingId);

        if (!booking) {
            throw new ApiError(404, 'Booking not found.');
        }

        // Only passenger or driver of that ride can view
        if (booking.passengerId !== userId && booking.driverId !== userId) {
            throw new ApiError(403, 'You do not have access to this booking.');
        }

        return booking;
    }

    async cancelBooking(passengerId, bookingId) {
        const booking = await bookingRepository.cancelWithSeatRestore(bookingId, passengerId);
        
        notifyUser(booking.driverId, 'ride_notification', {
            type: 'BOOKING_CANCELLED',
            message: `A booking request has been cancelled by the passenger.`,
            booking
        });

        return booking;
    }

    async acceptBooking(driverId, bookingId) {
        const booking = await bookingRepository.accept(bookingId, driverId);

        notifyUser(booking.passengerId, 'ride_notification', {
            type: 'BOOKING_ACCEPTED',
            message: `Your booking request has been accepted by the driver.`,
            booking
        });

        return booking;
    }

    async rejectBooking(driverId, bookingId) {
        const booking = await bookingRepository.reject(bookingId, driverId);

        notifyUser(booking.passengerId, 'ride_notification', {
            type: 'BOOKING_REJECTED',
            message: `Your booking request has been declined by the driver.`,
            booking
        });

        return booking;
    }
}

export default new BookingService();
