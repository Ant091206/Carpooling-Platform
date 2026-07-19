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

        // 3.5 Ride departure time must be in the future
        if (new Date(ride.departureTime) <= new Date()) {
            throw new ApiError(400, 'Cannot book a ride that has already departed.');
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

        // Module 12 Notifications
        try {
            const passenger = await prisma.user.findUnique({
                where: { id: passengerId },
                select: { name: true, email: true }
            });
            const rideDetails = {
                rideId: ride.id,
                pickup: ride.pickupName,
                destination: ride.destinationName,
                date: ride.departureTime.toISOString()
            };
            const triggerService = (await import('./notification/notificationTriggerService.js')).default;
            
            // Notify passenger
            await triggerService.notifyBookingCreated({
                userId: passengerId,
                userName: passenger.name,
                userEmail: passenger.email,
                rideDetails,
                bookingId: booking.id
            });

            // Notify driver
            await triggerService.notifySystem({
                userId: ride.driverId,
                title: 'New Booking Request',
                message: `You have received a new booking request from ${passenger.name} for your ride to ${ride.destinationName}.`,
                priority: 'HIGH',
                actionUrl: '/my-rides'
            });
        } catch (err) {
            console.error('Error triggering booking created notifications:', err);
        }

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

        try {
            const passenger = await prisma.user.findUnique({
                where: { id: booking.passengerId },
                select: { name: true, email: true }
            });
            const driver = await prisma.user.findUnique({
                where: { id: booking.driverId },
                select: { name: true, email: true }
            });
            const ride = await prisma.ride.findUnique({
                where: { id: booking.rideId },
                select: { pickupName: true, destinationName: true, departureTime: true }
            });
            const rideDetails = {
                rideId: booking.rideId,
                pickup: ride.pickupName,
                destination: ride.destinationName,
                date: ride.departureTime.toISOString()
            };
            const triggerService = (await import('./notification/notificationTriggerService.js')).default;
            
            // Notify passenger
            await triggerService.notifyBookingCancelled({
                userId: booking.passengerId,
                userName: passenger.name,
                userEmail: passenger.email,
                rideDetails,
                bookingId: booking.id,
                reason: 'Cancelled by passenger'
            });

            // Notify driver
            await triggerService.notifyBookingCancelled({
                userId: booking.driverId,
                userName: driver.name,
                userEmail: driver.email,
                rideDetails,
                bookingId: booking.id,
                reason: 'Cancelled by passenger'
            });
        } catch (err) {
            console.error('Error triggering cancel notifications:', err);
        }

        return booking;
    }

    async acceptBooking(driverId, bookingId) {
        const booking = await bookingRepository.accept(bookingId, driverId);

        notifyUser(booking.passengerId, 'ride_notification', {
            type: 'BOOKING_ACCEPTED',
            message: `Your booking request has been accepted by the driver.`,
            booking
        });

        try {
            const passenger = await prisma.user.findUnique({
                where: { id: booking.passengerId },
                select: { name: true, email: true }
            });
            const ride = await prisma.ride.findUnique({
                where: { id: booking.rideId },
                select: { pickupName: true, destinationName: true, departureTime: true }
            });
            const rideDetails = {
                rideId: booking.rideId,
                pickup: ride.pickupName,
                destination: ride.destinationName,
                date: ride.departureTime.toISOString()
            };
            const triggerService = (await import('./notification/notificationTriggerService.js')).default;
            
            // Notify passenger
            await triggerService.notifyBookingAccepted({
                userId: booking.passengerId,
                userName: passenger.name,
                userEmail: passenger.email,
                rideDetails,
                bookingId: booking.id
            });

            // Notify driver
            await triggerService.notifyPassengerJoined({
                userId: booking.driverId,
                passengerName: passenger.name,
                rideDetails
            });
        } catch (err) {
            console.error('Error triggering accept booking notifications:', err);
        }

        return booking;
    }

    async rejectBooking(driverId, bookingId) {
        const booking = await bookingRepository.reject(bookingId, driverId);

        notifyUser(booking.passengerId, 'ride_notification', {
            type: 'BOOKING_REJECTED',
            message: `Your booking request has been declined by the driver.`,
            booking
        });

        try {
            const passenger = await prisma.user.findUnique({
                where: { id: booking.passengerId },
                select: { name: true, email: true }
            });
            const ride = await prisma.ride.findUnique({
                where: { id: booking.rideId },
                select: { pickupName: true, destinationName: true, departureTime: true }
            });
            const rideDetails = {
                rideId: booking.rideId,
                pickup: ride.pickupName,
                destination: ride.destinationName,
                date: ride.departureTime.toISOString()
            };
            const triggerService = (await import('./notification/notificationTriggerService.js')).default;
            
            // Notify passenger
            await triggerService.notifyBookingRejected({
                userId: booking.passengerId,
                userName: passenger.name,
                userEmail: passenger.email,
                rideDetails,
                bookingId: booking.id
            });
        } catch (err) {
            console.error('Error triggering reject booking notification:', err);
        }

        return booking;
    }
}

export default new BookingService();
