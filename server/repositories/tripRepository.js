import prisma from '../config/db.js';

class TripRepository {
    /**
     * Create a trip (can be run inside a transaction)
     */
    async create(data, tx = prisma) {
        return await tx.trip.create({
            data,
            include: {
                ride: true,
                passenger: { select: { id: true, name: true, email: true } },
                driver: { select: { id: true, name: true, email: true } },
            }
        });
    }

    /**
     * Find all trips for a passenger
     */
    async findAllByPassengerId(passengerId) {
        return await prisma.trip.findMany({
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
                    }
                },
                driver: { select: { id: true, name: true, phone: true } },
                booking: { select: { requestedSeats: true, bookingDate: true } }
            }
        });
    }

    /**
     * Find all trips for a passenger by statuses
     */
    async findAllByPassengerIdAndStatuses(passengerId, statuses) {
        return await prisma.trip.findMany({
            where: {
                passengerId,
                status: { in: statuses }
            },
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
                    }
                },
                driver: { select: { id: true, name: true, phone: true } },
                booking: { select: { requestedSeats: true, bookingDate: true } }
            }
        });
    }

    /**
     * Find all trips for a driver
     */
    async findAllByDriverId(driverId) {
        return await prisma.trip.findMany({
            where: { driverId },
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
                    }
                },
                passenger: { select: { id: true, name: true, phone: true } },
                booking: { select: { requestedSeats: true, bookingDate: true } }
            }
        });
    }

    /**
     * Find a trip by ID
     */
    async findById(id) {
        return await prisma.trip.findUnique({
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
                        vehicleId: true,
                    }
                },
                passenger: { select: { id: true, name: true, email: true, phone: true } },
                driver: { select: { id: true, name: true, email: true, phone: true } },
                booking: { select: { id: true, status: true, requestedSeats: true, bookingDate: true } }
            }
        });
    }

    /**
     * Update trip status and other fields
     */
    async update(id, data, tx = prisma) {
        return await tx.trip.update({
            where: { id },
            data,
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
    }
}

export default new TripRepository();
