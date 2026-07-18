import prisma from '../config/db.js';

class BookingRepository {
    /**
     * Create a new booking + decrement ride seats atomically.
     */
    async createWithSeatDecrement(data) {
        const { rideId, passengerId, driverId, requestedSeats } = data;

        return await prisma.$transaction(async (tx) => {
            // Lock the ride row and check seat availability
            const ride = await tx.ride.findUnique({ where: { id: rideId } });

            if (!ride) {
                const err = new Error('Ride not found.');
                err.statusCode = 404;
                throw err;
            }

            if (ride.availableSeats < requestedSeats) {
                const err = new Error(
                    `Only ${ride.availableSeats} seat(s) available.`
                );
                err.statusCode = 400;
                throw err;
            }

            // Create booking
            const booking = await tx.booking.create({
                data: {
                    rideId,
                    passengerId,
                    driverId,
                    requestedSeats,
                    status: 'PENDING',
                },
                include: {
                    ride: {
                        select: {
                            id: true,
                            pickupName: true,
                            destinationName: true,
                            departureTime: true,
                            farePerSeat: true,
                            rideStatus: true,
                        },
                    },
                    passenger: { select: { id: true, name: true, email: true } },
                    driver: { select: { id: true, name: true, email: true } },
                },
            });

            // Decrement seats
            await tx.ride.update({
                where: { id: rideId },
                data: { availableSeats: { decrement: requestedSeats } },
            });

            return booking;
        });
    }

    /**
     * Cancel booking + restore ride seats atomically.
     */
    async cancelWithSeatRestore(bookingId, passengerId) {
        return await prisma.$transaction(async (tx) => {
            const booking = await tx.booking.findUnique({
                where: { id: bookingId },
            });

            if (!booking) {
                const err = new Error('Booking not found.');
                err.statusCode = 404;
                throw err;
            }

            if (booking.passengerId !== passengerId) {
                const err = new Error('Forbidden: Not your booking.');
                err.statusCode = 403;
                throw err;
            }

            if (booking.status !== 'PENDING' && booking.status !== 'ACCEPTED') {
                const err = new Error(
                    `Cannot cancel a booking with status ${booking.status}.`
                );
                err.statusCode = 400;
                throw err;
            }

            const updated = await tx.booking.update({
                where: { id: bookingId },
                data: { status: 'CANCELLED' },
                include: {
                    ride: {
                        select: {
                            id: true,
                            pickupName: true,
                            destinationName: true,
                            departureTime: true,
                        },
                    },
                },
            });

            // Restore seats
            await tx.ride.update({
                where: { id: booking.rideId },
                data: { availableSeats: { increment: booking.requestedSeats } },
            });

            return updated;
        });
    }

    /**
     * Driver accepts booking.
     */
    async accept(bookingId, driverId) {
        return await prisma.$transaction(async (tx) => {
            const booking = await tx.booking.findUnique({
                where: { id: bookingId },
                include: { ride: true },
            });

            if (!booking) {
                const err = new Error('Booking not found.');
                err.statusCode = 404;
                throw err;
            }

            if (booking.ride.driverId !== driverId) {
                const err = new Error('Forbidden: You do not own this ride.');
                err.statusCode = 403;
                throw err;
            }

            if (booking.status !== 'PENDING') {
                const err = new Error(
                    `Cannot accept a booking with status ${booking.status}.`
                );
                err.statusCode = 400;
                throw err;
            }

            return await tx.booking.update({
                where: { id: bookingId },
                data: { status: 'ACCEPTED' },
                include: {
                    ride: {
                        select: {
                            id: true,
                            pickupName: true,
                            destinationName: true,
                            departureTime: true,
                        },
                    },
                    passenger: { select: { id: true, name: true, email: true } },
                },
            });
        });
    }

    /**
     * Driver rejects booking + restore seats.
     */
    async reject(bookingId, driverId) {
        return await prisma.$transaction(async (tx) => {
            const booking = await tx.booking.findUnique({
                where: { id: bookingId },
                include: { ride: true },
            });

            if (!booking) {
                const err = new Error('Booking not found.');
                err.statusCode = 404;
                throw err;
            }

            if (booking.ride.driverId !== driverId) {
                const err = new Error('Forbidden: You do not own this ride.');
                err.statusCode = 403;
                throw err;
            }

            if (booking.status !== 'PENDING') {
                const err = new Error(
                    `Cannot reject a booking with status ${booking.status}.`
                );
                err.statusCode = 400;
                throw err;
            }

            const updated = await tx.booking.update({
                where: { id: bookingId },
                data: { status: 'REJECTED' },
                include: {
                    ride: {
                        select: {
                            id: true,
                            pickupName: true,
                            destinationName: true,
                            departureTime: true,
                        },
                    },
                    passenger: { select: { id: true, name: true, email: true } },
                },
            });

            // Restore seats on rejection
            await tx.ride.update({
                where: { id: booking.rideId },
                data: { availableSeats: { increment: booking.requestedSeats } },
            });

            return updated;
        });
    }

    async findById(id) {
        return await prisma.booking.findUnique({
            where: { id },
            include: {
                ride: {
                    select: {
                        id: true,
                        pickupName: true,
                        destinationName: true,
                        departureTime: true,
                        farePerSeat: true,
                        rideStatus: true,
                        availableSeats: true,
                    },
                },
                passenger: { select: { id: true, name: true, email: true, phone: true } },
                driver: { select: { id: true, name: true, email: true, phone: true } },
            },
        });
    }

    async findAllByPassenger(passengerId) {
        return await prisma.booking.findMany({
            where: { passengerId },
            orderBy: { createdAt: 'desc' },
            include: {
                ride: {
                    select: {
                        id: true,
                        pickupName: true,
                        destinationName: true,
                        departureTime: true,
                        farePerSeat: true,
                        rideStatus: true,
                    },
                },
                driver: { select: { id: true, name: true, phone: true } },
            },
        });
    }

    async findAllByDriver(driverId) {
        return await prisma.booking.findMany({
            where: { driverId },
            orderBy: { createdAt: 'desc' },
            include: {
                ride: {
                    select: {
                        id: true,
                        pickupName: true,
                        destinationName: true,
                        departureTime: true,
                        rideStatus: true,
                    },
                },
                passenger: { select: { id: true, name: true, email: true, phone: true } },
            },
        });
    }

    async findDuplicateBooking(passengerId, rideId) {
        return await prisma.booking.findFirst({
            where: {
                passengerId,
                rideId,
                status: { in: ['PENDING', 'ACCEPTED'] },
            },
        });
    }
}

export default new BookingRepository();
