import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import {
  calculateDistance,
  calculateMatchScore,
  calculateOptimizationMetrics,
  generateSmartSuggestions,
} from '../../utils/optimizer/routeOptimizer.js';

class MatchingService {
  /**
   * Helper: Parse point from MySQL spatial or fallback coordinates object
   */
  _extractCoordinates(locationField, fallbackLat, fallbackLng) {
    if (locationField && typeof locationField === 'object') {
      if (locationField.x !== undefined && locationField.y !== undefined) {
        return { lat: locationField.x, lng: locationField.y };
      }
      if (locationField.coordinates && Array.isArray(locationField.coordinates)) {
        return { lat: locationField.coordinates[1], lng: locationField.coordinates[0] };
      }
    }
    return {
      lat: parseFloat(fallbackLat) || 12.9716,
      lng: parseFloat(fallbackLng) || 77.5946,
    };
  }

  /**
   * POST /api/matching/find
   * Smart AI Ride Matching Engine
   */
  async findMatches(userId, queryData) {
    const {
      pickupLat,
      pickupLng,
      destinationLat,
      destinationLng,
      pickupName = 'Pickup Location',
      destinationName = 'Destination',
      departureTime,
      seatsNeeded = 1,
      rideId,
    } = queryData;

    const reqUser = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
      include: { matchPreference: true },
    });

    if (!reqUser) {
      throw new ApiError(404, 'User not found.');
    }

    const pref = reqUser.matchPreference || {
      maxDetourDistance: 10,
      maxWaitingTime: 45,
      preferredGender: 'ANY',
      allowMixedGender: true,
      preferredDepartments: null,
      preferredOrganizations: null,
      allowRecurringMatches: true,
    };

    const maxDetourKm = parseFloat(pref.maxDetourDistance) || 10;
    const maxWaitMins = parseInt(pref.maxWaitingTime, 10) || 45;
    const targetDeparture = departureTime ? new Date(departureTime) : new Date();

    const minDeparture = new Date(targetDeparture.getTime() - maxWaitMins * 60 * 1000);
    const maxDeparture = new Date(targetDeparture.getTime() + maxWaitMins * 60 * 1000);

    // Fetch candidate rides
    const candidateRides = await prisma.ride.findMany({
      where: {
        driverId: { not: parseInt(userId, 10) },
        rideStatus: 'Scheduled',
        availableSeats: { gte: parseInt(seatsNeeded, 10) },
        departureTime: { gte: minDeparture, lte: maxDeparture },
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            department: true,
            organizationId: true,
            reviewsReceived: { select: { rating: true } },
          },
        },
        vehicle: {
          select: {
            id: true,
            model: true,
            registrationNumber: true,
            color: true,
            vehicleType: true,
            seatCapacity: true,
          },
        },
      },
      take: 50,
    });

    const userLat = parseFloat(pickupLat) || 12.9716;
    const userLng = parseFloat(pickupLng) || 77.5946;
    const destLat = parseFloat(destinationLat) || 12.9352;
    const destLng = parseFloat(destinationLng) || 77.6245;

    const matches = [];

    for (const ride of candidateRides) {
      const driverPickup = this._extractCoordinates(ride.pickupLocation, userLat + 0.01, userLng + 0.01);
      const driverDest   = this._extractCoordinates(ride.destinationLocation, destLat + 0.01, destLng + 0.01);

      const pickupDistKm = calculateDistance(userLat, userLng, driverPickup.lat, driverPickup.lng);
      const destDistKm   = calculateDistance(destLat, destLng, driverDest.lat, driverDest.lng);

      const rideTimeMins = Math.round((new Date(ride.departureTime).getTime() - targetDeparture.getTime()) / 60000);

      // Driver rating average
      const ratings = ride.driver.reviewsReceived || [];
      const driverRating = ratings.length > 0
        ? parseFloat((ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1))
        : 4.8;

      const scoreResult = calculateMatchScore({
        pickupDistanceKm: pickupDistKm,
        destinationDistanceKm: destDistKm,
        timeDifferenceMinutes: rideTimeMins,
        maxDetourKm,
        maxWaitMins,
        driverRating,
        passengerRating: 4.8,
      });

      const optMetrics = calculateOptimizationMetrics(ride.distanceKm || 15, ride.farePerSeat);
      const smartSuggestions = generateSmartSuggestions(ride.pickupName, ride.destinationName, pickupDistKm, destDistKm);

      matches.push({
        rideId: ride.id,
        matchedRide: {
          id: ride.id,
          driverId: ride.driverId,
          pickupName: ride.pickupName,
          destinationName: ride.destinationName,
          departureTime: ride.departureTime,
          availableSeats: ride.availableSeats,
          farePerSeat: parseFloat(ride.farePerSeat),
          distanceKm: parseFloat(ride.distanceKm || 15),
          rideStatus: ride.rideStatus,
          driver: {
            ...ride.driver,
            averageRating: driverRating,
          },
          vehicle: ride.vehicle ? {
            id: ride.vehicle.id,
            model: ride.vehicle.model,
            plateNumber: ride.vehicle.registrationNumber,
            color: ride.vehicle.color,
            type: ride.vehicle.vehicleType,
            capacity: ride.vehicle.seatCapacity,
          } : null,
          pickupCoordinates: driverPickup,
          destinationCoordinates: driverDest,
        },
        matchScore: scoreResult.totalScore,
        scoreBreakdown: scoreResult.breakdown,
        distanceDifference: parseFloat((pickupDistKm + destDistKm).toFixed(2)),
        timeDifference: Math.abs(rideTimeMins),
        seatCompatibility: ride.availableSeats >= seatsNeeded,
        optimization: optMetrics,
        suggestions: smartSuggestions,
      });
    }

    // Sort by matchScore descending and take Top 10
    matches.sort((a, b) => b.matchScore - a.matchScore);
    const top10 = matches.slice(0, 10);

    // Save/upsert top matches into RideMatch table if rideId was passed
    if (rideId) {
      const sourceRideId = parseInt(rideId, 10);
      for (const m of top10) {
        try {
          await prisma.rideMatch.create({
            data: {
              rideId: sourceRideId,
              matchedRideId: m.matchedRide.id,
              matchScore: m.matchScore,
              distanceDifference: m.distanceDifference,
              timeDifference: m.timeDifference,
              seatCompatibility: m.seatCompatibility,
              status: 'SUGGESTED',
            },
          });
        } catch (err) {
          // Ignore duplicate constraint if any
        }
      }
    }

    return {
      totalMatches: top10.length,
      matches: top10,
      userPreferences: pref,
    };
  }

  /**
   * GET /api/matching/recommendations
   */
  async getRecommendations(userId) {
    const id = parseInt(userId, 10);
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        rides: { take: 1, orderBy: { createdAt: 'desc' } },
        passengerBookings: { take: 1, orderBy: { createdAt: 'desc' }, include: { ride: true } },
      },
    });

    const recentRide = user?.rides?.[0] || user?.passengerBookings?.[0]?.ride;

    return await this.findMatches(userId, {
      pickupName: recentRide?.pickupName || 'Electronic City',
      destinationName: recentRide?.destinationName || 'Whitefield IT Park',
      pickupLat: 12.9716,
      pickupLng: 77.5946,
      destinationLat: 12.9352,
      destinationLng: 77.6245,
    });
  }

  /**
   * GET /api/matching/history
   */
  async getMatchHistory(userId) {
    const id = parseInt(userId, 10);
    return await prisma.rideMatch.findMany({
      where: {
        ride: { driverId: id },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        matchedRide: {
          include: {
            driver: { select: { id: true, name: true, email: true, phone: true } },
            vehicle: true,
          },
        },
      },
    });
  }

  /**
   * GET /api/matching/preferences
   */
  async getPreferences(userId) {
    const id = parseInt(userId, 10);
    let pref = await prisma.matchPreference.findUnique({
      where: { userId: id },
    });

    if (!pref) {
      pref = await prisma.matchPreference.create({
        data: {
          userId: id,
          maxDetourDistance: 5.0,
          maxWaitingTime: 30,
          preferredGender: 'ANY',
          allowMixedGender: true,
          allowRecurringMatches: true,
        },
      });
    }

    return pref;
  }

  /**
   * PUT /api/matching/preferences
   */
  async updatePreferences(userId, data) {
    const id = parseInt(userId, 10);
    const {
      maxDetourDistance,
      maxWaitingTime,
      preferredGender,
      allowMixedGender,
      preferredDepartments,
      preferredOrganizations,
      allowRecurringMatches,
    } = data;

    const updated = await prisma.matchPreference.upsert({
      where: { userId: id },
      create: {
        userId: id,
        maxDetourDistance: maxDetourDistance !== undefined ? parseFloat(maxDetourDistance) : 5.0,
        maxWaitingTime: maxWaitingTime !== undefined ? parseInt(maxWaitingTime, 10) : 30,
        preferredGender: preferredGender || 'ANY',
        allowMixedGender: allowMixedGender !== undefined ? Boolean(allowMixedGender) : true,
        preferredDepartments: preferredDepartments || null,
        preferredOrganizations: preferredOrganizations || null,
        allowRecurringMatches: allowRecurringMatches !== undefined ? Boolean(allowRecurringMatches) : true,
      },
      update: {
        ...(maxDetourDistance !== undefined && { maxDetourDistance: parseFloat(maxDetourDistance) }),
        ...(maxWaitingTime !== undefined && { maxWaitingTime: parseInt(maxWaitingTime, 10) }),
        ...(preferredGender !== undefined && { preferredGender }),
        ...(allowMixedGender !== undefined && { allowMixedGender: Boolean(allowMixedGender) }),
        ...(preferredDepartments !== undefined && { preferredDepartments }),
        ...(preferredOrganizations !== undefined && { preferredOrganizations }),
        ...(allowRecurringMatches !== undefined && { allowRecurringMatches: Boolean(allowRecurringMatches) }),
      },
    });

    return updated;
  }
}

export default new MatchingService();
