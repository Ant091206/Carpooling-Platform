import bookingService from '../services/bookingService.js';
import { successResponse } from '../utils/responseFormat.js';

class BookingController {
    /**
     * POST /api/bookings
     * Passenger creates a booking.
     */
    async createBooking(req, res, next) {
        try {
            const passengerId = req.user.id;
            const booking = await bookingService.createBooking(passengerId, req.body);
            res.status(201).json(successResponse('Booking created successfully.', booking));
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/bookings
     * Returns bookings for the authenticated user.
     * Passengers see their own bookings; drivers see bookings on their rides.
     */
    async listBookings(req, res, next) {
        try {
            const userId = req.user.id;
            const { role } = req.query; // optional: ?role=driver

            let bookings;
            if (role === 'driver') {
                bookings = await bookingService.getDriverBookings(userId);
            } else {
                bookings = await bookingService.getPassengerBookings(userId);
            }

            res.status(200).json(successResponse('Bookings retrieved successfully.', bookings));
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/bookings/:id
     * Get details of a single booking.
     */
    async getBooking(req, res, next) {
        try {
            const userId = req.user.id;
            const bookingId = parseInt(req.params.id, 10);
            const booking = await bookingService.getBookingById(bookingId, userId);
            res.status(200).json(successResponse('Booking retrieved successfully.', booking));
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/bookings/:id/cancel
     * Passenger cancels their booking.
     */
    async cancelBooking(req, res, next) {
        try {
            const passengerId = req.user.id;
            const bookingId = parseInt(req.params.id, 10);
            const booking = await bookingService.cancelBooking(passengerId, bookingId);
            res.status(200).json(successResponse('Booking cancelled successfully.', booking));
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/bookings/:id/accept
     * Driver accepts a pending booking.
     */
    async acceptBooking(req, res, next) {
        try {
            const driverId = req.user.id;
            const bookingId = parseInt(req.params.id, 10);
            const booking = await bookingService.acceptBooking(driverId, bookingId);
            res.status(200).json(successResponse('Booking accepted successfully.', booking));
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/bookings/:id/reject
     * Driver rejects a pending booking.
     */
    async rejectBooking(req, res, next) {
        try {
            const driverId = req.user.id;
            const bookingId = parseInt(req.params.id, 10);
            const booking = await bookingService.rejectBooking(driverId, bookingId);
            res.status(200).json(successResponse('Booking rejected successfully.', booking));
        } catch (error) {
            next(error);
        }
    }
}

export default new BookingController();
