import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';

class HistoryService {
  /**
   * Sync bookings and rides into the RideHistory table for a user
   */
  async syncRideHistory(userId) {
    const userIdInt = parseInt(userId, 10);

    // Fetch all bookings where user is passenger or driver
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { passengerId: userIdInt },
          { driverId: userIdInt }
        ],
        status: { in: ['ACCEPTED', 'COMPLETED', 'CANCELLED'] }
      },
      include: {
        ride: true
      }
    });

    for (const booking of bookings) {
      // Determine history paymentStatus
      let paymentStatus = 'PENDING';
      if (booking.status === 'ACCEPTED' || booking.status === 'COMPLETED') {
        paymentStatus = 'PAID';
      } else if (booking.status === 'CANCELLED') {
        paymentStatus = 'CANCELLED';
      }

      // Determine history rideStatus based on booking and ride status
      let rideStatus = booking.ride.rideStatus;
      if (booking.status === 'CANCELLED') {
        rideStatus = 'Cancelled';
      }

      // Check if history record already exists
      const existingHistory = await prisma.rideHistory.findFirst({
        where: {
          rideId: booking.rideId,
          passengerId: booking.passengerId
        }
      });

      const farePaid = parseFloat(booking.ride.farePerSeat) * booking.requestedSeats;
      const distance = booking.ride.distanceKm ? parseFloat(booking.ride.distanceKm) : 0.0;
      const duration = booking.ride.estimatedDuration ? parseInt(booking.ride.estimatedDuration, 10) : 0;

      if (!existingHistory) {
        await prisma.rideHistory.create({
          data: {
            rideId: booking.rideId,
            driverId: booking.driverId,
            passengerId: booking.passengerId,
            farePaid: farePaid,
            distance: distance,
            duration: duration,
            pickup: booking.ride.pickupName,
            dropoff: booking.ride.destinationName,
            rideDate: booking.ride.departureTime,
            status: rideStatus,
            paymentStatus: paymentStatus,
            createdAt: booking.createdAt
          }
        });
      } else {
        // Update status and paymentStatus if they have changed
        if (existingHistory.status !== rideStatus || existingHistory.paymentStatus !== paymentStatus) {
          await prisma.rideHistory.update({
            where: { id: existingHistory.id },
            data: {
              status: rideStatus,
              paymentStatus: paymentStatus
            }
          });
        }
      }
    }
  }

  /**
   * Get all rides (upcoming, completed, cancelled) for the logged-in user
   */
  async getMyRides(userId) {
    const userIdInt = parseInt(userId, 10);

    // Run sync before returning records
    await this.syncRideHistory(userIdInt);

    // Fetch all history records for this user
    const histories = await prisma.rideHistory.findMany({
      where: {
        OR: [
          { passengerId: userIdInt },
          { driverId: userIdInt }
        ]
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true,
            email: true,
            department: true,
            designation: true
          }
        },
        passenger: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true,
            email: true,
            department: true,
            designation: true
          }
        },
        ride: {
          include: {
            bookings: {
              where: {
                status: { in: ['ACCEPTED', 'COMPLETED'] }
              },
              include: {
                passenger: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true
                  }
                }
              }
            },
            reviews: true
          }
        }
      },
      orderBy: { rideDate: 'desc' }
    });

    const result = {
      upcoming: [],
      completed: [],
      cancelled: []
    };

    for (const hist of histories) {
      const isDriver = hist.driverId === userIdInt;

      // Determine if already reviewed
      let ratingStatus = 'PENDING';
      const userReview = hist.ride.reviews.find(r => r.reviewerId === userIdInt && r.revieweeId === (isDriver ? hist.passengerId : hist.driverId));
      if (userReview) {
        ratingStatus = 'REVIEWED';
      }

      // Grab co-passengers list
      const passengers = hist.ride.bookings.map(b => ({
        id: b.passenger.id,
        name: b.passenger.name,
        avatar: b.passenger.avatar
      }));

      const rideCard = {
        id: hist.id,
        rideId: hist.rideId,
        driverId: hist.driverId,
        passengerId: hist.passengerId,
        pickup: hist.pickup,
        destination: hist.dropoff,
        distance: parseFloat(hist.distance),
        duration: hist.duration,
        fare: parseFloat(hist.farePaid),
        status: hist.status,
        paymentStatus: hist.paymentStatus,
        rideDate: hist.rideDate,
        ratingStatus,
        isDriver,
        driver: hist.driver,
        passenger: hist.passenger,
        passengers
      };

      if (hist.status === 'Completed') {
        result.completed.push(rideCard);
      } else if (hist.status === 'Cancelled') {
        result.cancelled.push(rideCard);
      } else {
        result.upcoming.push(rideCard);
      }
    }

    return result;
  }

  /**
   * Get complete information for a specific ride
   */
  async getRideById(rideId, userId) {
    const rideIdInt = parseInt(rideId, 10);
    const userIdInt = parseInt(userId, 10);

    const ride = await prisma.ride.findUnique({
      where: { id: rideIdInt },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true,
            email: true,
            department: true,
            designation: true
          }
        },
        bookings: {
          where: {
            status: { in: ['ACCEPTED', 'COMPLETED'] }
          },
          include: {
            passenger: {
              select: {
                id: true,
                name: true,
                avatar: true,
                phone: true,
                email: true,
                department: true,
                designation: true
              }
            }
          }
        },
        reviews: {
          include: {
            reviewer: { select: { id: true, name: true, avatar: true } },
            reviewee: { select: { id: true, name: true, avatar: true } }
          }
        }
      }
    });

    if (!ride) {
      throw new ApiError(404, 'Ride not found.');
    }

    // Verify participation
    const isDriver = ride.driverId === userIdInt;
    const isPassenger = ride.bookings.some(b => b.passengerId === userIdInt);

    if (!isDriver && !isPassenger) {
      throw new ApiError(403, 'Access denied. You did not participate in this ride.');
    }

    // Grab booking payments
    const userBooking = ride.bookings.find(b => b.passengerId === (isDriver ? ride.bookings[0]?.passengerId : userIdInt));
    const fare = userBooking ? parseFloat(ride.farePerSeat) * userBooking.requestedSeats : parseFloat(ride.farePerSeat);
    const paymentStatus = userBooking ? (userBooking.status === 'COMPLETED' || userBooking.status === 'ACCEPTED' ? 'PAID' : 'PENDING') : 'PAID';

    // Set timeline details
    const createdTime = ride.createdAt;
    const startTime = new Date(ride.departureTime.getTime() - 10 * 60 * 1000); // started 10m before departure
    const reachedPickupTime = ride.departureTime;
    const completedTime = ride.rideStatus === 'Completed' ? ride.updatedAt : null;

    const timeline = [
      { event: 'Accepted', time: createdTime, description: 'Ride published and bookings approved.' },
      { event: 'Started', time: startTime, description: 'Driver started GPS mapping.' },
      { event: 'Reached Pickup', time: reachedPickupTime, description: 'Driver arrived at pickup location.' },
      { event: 'Completed', time: completedTime, description: 'Commute ended successfully.' }
    ];

    return {
      id: ride.id,
      pickup: ride.pickupName,
      destination: ride.destinationName,
      pickupLocation: ride.pickupLocation, // GeoJSON Point
      destinationLocation: ride.destinationLocation,
      distance: ride.distanceKm ? parseFloat(ride.distanceKm) : 0,
      duration: ride.estimatedDuration || 0,
      status: ride.rideStatus,
      departureTime: ride.departureTime,
      routeGeometry: ride.routeGeometry,
      isDriver,
      driver: ride.driver,
      passengers: ride.bookings.map(b => b.passenger),
      payment: {
        fare,
        paymentStatus
      },
      reviews: ride.reviews,
      timeline,
      createdAt: ride.createdAt,
      updatedAt: ride.updatedAt
    };
  }
}

export default new HistoryService();
