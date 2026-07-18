import prisma from '../config/db.js';
import historyService from '../services/history/historyService.js';
import reviewService from '../services/review/reviewService.js';

async function runTests() {
  console.log('=== STARTING MODULE 11 INTEGRATION TESTS ===');
  
  let testOrg, testDriver, testPassenger, testVehicle, testRide1, testRide2, testBooking1, testBooking2;

  try {
    // 1. SETUP TEST DATA
    console.log('\n[1/7] Setting up test database records...');
    
    // Create Org
    testOrg = await prisma.organization.create({
      data: {
        name: 'Test Odoo Module 11 Org',
        companyCode: `M11TEST_${Date.now()}`,
        email: 'm11org@example.com',
        status: 'ACTIVE'
      }
    });

    // Create Driver
    testDriver = await prisma.user.create({
      data: {
        organizationId: testOrg.id,
        employeeId: 'DR_M11',
        name: 'M11 Test Driver',
        email: `driver_${Date.now()}@example.com`,
        password: 'hashedpassword',
        role: 'EMPLOYEE',
        status: 'ACTIVE'
      }
    });

    // Create Passenger
    testPassenger = await prisma.user.create({
      data: {
        organizationId: testOrg.id,
        employeeId: 'PA_M11',
        name: 'M11 Test Passenger',
        email: `passenger_${Date.now()}@example.com`,
        password: 'hashedpassword',
        role: 'EMPLOYEE',
        status: 'ACTIVE'
      }
    });

    // Create Vehicle
    testVehicle = await prisma.vehicle.create({
      data: {
        userId: testDriver.id,
        model: 'Tesla Model Y',
        plateNumber: `M11_VEH_${Date.now()}`,
        color: 'Midnight Blue',
        capacity: 4
      }
    });

    // Create Completed Ride
    // Point geometries require RAW SQL since Prisma does not support point insertions out-of-the-box for mysql point types directly via create
    const departureDate = new Date(Date.now() + 24 * 3600 * 1000); // tomorrow
    const insertRideQuery = `
      INSERT INTO rides (
        driver_id, vehicle_id, pickup_name, pickup_location,
        destination_name, destination_location, departure_time,
        available_seats, fare_per_seat, distance_km, estimated_duration,
        ride_status, is_recurring, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ST_GeomFromText('POINT(72.8777 19.0760)', 4326),
        ?, ST_GeomFromText('POINT(72.9000 19.1000)', 4326), ?,
        3, 150.00, 10.5, 25, ?, 0, NOW(), NOW()
      )
    `;
    
    // We run prisma.$executeRawUnsafe to insert the point geometry properly
    await prisma.$executeRawUnsafe(
      insertRideQuery,
      testDriver.id,
      testVehicle.id,
      'Test Pickup A',
      'Test Destination B',
      departureDate,
      'Completed'
    );
    
    // Get inserted ride
    testRide1 = await prisma.ride.findFirst({
      where: { driverId: testDriver.id, pickupName: 'Test Pickup A' }
    });

    // Create Booking on completed ride
    testBooking1 = await prisma.booking.create({
      data: {
        rideId: testRide1.id,
        passengerId: testPassenger.id,
        driverId: testDriver.id,
        requestedSeats: 1,
        status: 'COMPLETED'
      }
    });

    // Create Cancelled Ride
    await prisma.$executeRawUnsafe(
      insertRideQuery,
      testDriver.id,
      testVehicle.id,
      'Test Pickup C',
      'Test Destination D',
      departureDate,
      'Scheduled'
    );
    
    testRide2 = await prisma.ride.findFirst({
      where: { driverId: testDriver.id, pickupName: 'Test Pickup C' }
    });
    
    // Update ride to Cancelled status
    await prisma.ride.update({
      where: { id: testRide2.id },
      data: { rideStatus: 'Cancelled' }
    });

    // Create Booking on Cancelled ride
    testBooking2 = await prisma.booking.create({
      data: {
        rideId: testRide2.id,
        passengerId: testPassenger.id,
        driverId: testDriver.id,
        requestedSeats: 1,
        status: 'CANCELLED'
      }
    });

    console.log('✔ Test data setup successfully completed.');

    // 2. VERIFY HISTORY SYNC
    console.log('\n[2/7] Testing Ride History Synchronization and Retrieval...');
    
    // Trigger sync and query
    const history = await historyService.getMyRides(testPassenger.id);
    
    console.log(`- Upcoming rides count: ${history.upcoming.length}`);
    console.log(`- Completed rides count: ${history.completed.length}`);
    console.log(`- Cancelled rides count: ${history.cancelled.length}`);

    if (history.completed.length === 0) {
      throw new Error('History sync failed: Completed ride not found.');
    }
    if (history.cancelled.length === 0) {
      throw new Error('History sync failed: Cancelled ride not found.');
    }

    console.log('✔ History sync and tabs categorization test passed.');

    // 3. VERIFY SINGLE RIDE HISTORY DETAILS
    console.log('\n[3/7] Testing single ride history details query...');
    const details = await historyService.getRideById(testRide1.id, testPassenger.id);
    
    console.log(`- Distance matched: ${details.distance} km`);
    console.log(`- Timeline events count: ${details.timeline.length}`);
    console.log(`- Payment status: ${details.payment.paymentStatus}`);

    if (details.distance !== 10.5 || details.payment.paymentStatus !== 'PAID') {
      throw new Error('Ride details mapping failed.');
    }

    console.log('✔ Single ride history details query passed.');

    // 4. VERIFY SELF-REVIEW PREVENTION
    console.log('\n[4/7] Testing validation: Cannot review self...');
    try {
      await reviewService.createReview(testPassenger.id, {
        rideId: testRide1.id,
        revieweeId: testPassenger.id,
        rating: 5,
        review: 'Excellent ride!'
      });
      throw new Error('Validation failed: Allowed user to review self.');
    } catch (e) {
      if (e.statusCode !== 400 || !e.message.includes('cannot review yourself')) {
        throw e;
      }
      console.log('✔ Blocked self-review successfully (API returned 400).');
    }

    // 5. VERIFY REVIEW ON CANCELLED RIDE PREVENTION
    console.log('\n[5/7] Testing validation: Cannot review cancelled ride...');
    try {
      await reviewService.createReview(testPassenger.id, {
        rideId: testRide2.id,
        revieweeId: testDriver.id,
        rating: 4,
        review: 'Cancelled, but still okay.'
      });
      throw new Error('Validation failed: Allowed review on cancelled ride.');
    } catch (e) {
      if (e.statusCode !== 400 || !e.message.includes('cancelled')) {
        throw e;
      }
      console.log('✔ Blocked review on cancelled ride successfully (API returned 400).');
    }

    // 6. VERIFY REVIEW SUBMISSION & DUPLICATE PREVENTION
    console.log('\n[6/7] Testing review submission and duplicate reviews prevention...');
    
    // Create valid review from passenger -> driver
    const reviewResult = await reviewService.createReview(testPassenger.id, {
      rideId: testRide1.id,
      revieweeId: testDriver.id,
      rating: 5,
      review: 'Driver was punctual and polite.'
    });

    console.log(`- Review created. ID: ${reviewResult.id}`);

    // Try submitting again
    try {
      await reviewService.createReview(testPassenger.id, {
        rideId: testRide1.id,
        revieweeId: testDriver.id,
        rating: 3,
        review: 'Changing my mind...'
      });
      throw new Error('Validation failed: Allowed duplicate review.');
    } catch (e) {
      if (e.statusCode !== 409) {
        throw e;
      }
      console.log('✔ Blocked duplicate review successfully (API returned 409).');
    }

    // 7. VERIFY STATS CALCULATION
    console.log('\n[7/7] Testing average rating and distribution aggregates...');
    const stats = await reviewService.getUserReviewStats(testDriver.id);
    
    console.log(`- Driver average rating: ${stats.averageRating}★`);
    console.log(`- Total reviews: ${stats.totalReviews}`);
    console.log(`- Rating distribution:`, stats.ratingDistribution);

    if (stats.averageRating !== 5.0 || stats.totalReviews !== 1 || stats.ratingDistribution[5] !== 1) {
      throw new Error('Ratings calculations or distribution breakdown failed.');
    }

    console.log('✔ Average rating and statistics distribution calculation passed.');

    console.log('\n=== ALL TESTS PASSED SUCCESSFULLY ===');

  } catch (error) {
    console.error('\n❌ TEST SUITE ENCOUNTERED ERROR:', error.message);
  } finally {
    // CLEAN UP DATABASE RECORDS IN CORRECT DEPENDENCY ORDER
    console.log('\nCleaning up test records from database...');
    try {
      // 1. Delete Reviews
      await prisma.rideReview.deleteMany({
        where: {
          rideId: { in: [testRide1?.id || 0, testRide2?.id || 0].filter(id => id > 0) }
        }
      });
      // 2. Delete Ride History
      await prisma.rideHistory.deleteMany({
        where: {
          rideId: { in: [testRide1?.id || 0, testRide2?.id || 0].filter(id => id > 0) }
        }
      });
      // 3. Delete Bookings
      if (testBooking1) await prisma.booking.delete({ where: { id: testBooking1.id } });
      if (testBooking2) await prisma.booking.delete({ where: { id: testBooking2.id } });
      // 4. Delete Rides
      if (testRide1) await prisma.ride.delete({ where: { id: testRide1.id } });
      if (testRide2) await prisma.ride.delete({ where: { id: testRide2.id } });
      // 5. Delete Vehicles
      if (testVehicle) await prisma.vehicle.delete({ where: { id: testVehicle.id } });
      // 6. Delete Users
      if (testDriver) await prisma.user.delete({ where: { id: testDriver.id } });
      if (testPassenger) await prisma.user.delete({ where: { id: testPassenger.id } });
      // 7. Delete Org
      if (testOrg) await prisma.organization.delete({ where: { id: testOrg.id } });
      console.log('✔ Cleanup complete.');
    } catch (cleanupError) {
      console.error('Failed to cleanup database:', cleanupError.message);
    }
    
    // Explicit exit
    process.exit(0);
  }
}

runTests();
