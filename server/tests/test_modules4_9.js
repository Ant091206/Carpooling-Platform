import axios from 'axios';
import dotenv from 'dotenv';
import prisma from '../config/db.js';

dotenv.config();

const port = process.env.PORT || 5000;
const baseURL = `http://localhost:${port}/api`;

const testState = {
  driverToken: null,
  driverEmail: `driver_${Date.now()}@testcompany.com`,
  passengerToken: null,
  passengerEmail: `passenger_${Date.now()}@testcompany.com`,
  vehicleId: null,
  rideId: null,
  bookingId: null,
  tripId: null,
};

function authHeaders(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
}

async function runTests() {
  console.log('=====================================================');
  console.log('STARTING INTEGRATION TESTS FOR MODULES 4 THROUGH 9');
  console.log('=====================================================');

  try {
    // 1. Register Driver User
    await testStep('POST /auth/register (Driver)', async () => {
      const res = await axios.post(`${baseURL}/auth/register`, {
        firstName: 'Dave',
        lastName: 'Driver',
        employee_id: `DRV${Date.now()}`,
        email: testState.driverEmail,
        phone: '9999999999',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        organization: 'Test Company',
        department: 'Logistics',
        terms: true
      });

      assert(res.status === 201, `Expected status 201, got ${res.status}`);
      assert(res.data.data.accessToken, 'Auth token missing for driver');
      testState.driverToken = res.data.data.accessToken;
    });

    // 2. Register Passenger User
    await testStep('POST /auth/register (Passenger)', async () => {
      const res = await axios.post(`${baseURL}/auth/register`, {
        firstName: 'Pat',
        lastName: 'Passenger',
        employee_id: `PSG${Date.now()}`,
        email: testState.passengerEmail,
        phone: '8888888888',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        organization: 'Test Company',
        department: 'Engineering',
        terms: true
      });

      assert(res.status === 201, `Expected status 201, got ${res.status}`);
      assert(res.data.data.accessToken, 'Auth token missing for passenger');
      testState.passengerToken = res.data.data.accessToken;
    });

    // 3. Register Vehicle for Driver (utilizing snake_case compatibility mapping)
    await testStep('POST /vehicle (Register Vehicle)', async () => {
      const res = await axios.post(`${baseURL}/vehicle`, {
        brand: 'Hyundai',
        model: 'Ioniq 5',
        registration_brand: 'Hyundai',
        registration_number: `REG_${Math.floor(1000 + Math.random() * 9000)}`,
        color: 'Matte Blue',
        fuel_type: 'Electric',
        seat_capacity: 4
      }, authHeaders(testState.driverToken));

      assert(res.status === 201, `Expected status 201, got ${res.status}`);
      assert(res.data.data.id, 'Vehicle registration returned no ID');
      testState.vehicleId = res.data.data.id;
      console.log(`Registered Vehicle ID: ${testState.vehicleId}`);
    });

    // 4. Set Vehicle as Primary Default
    await testStep('PATCH /vehicle/default/:id (Set Default)', async () => {
      const res = await axios.patch(`${baseURL}/vehicle/default/${testState.vehicleId}`, {}, authHeaders(testState.driverToken));
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.isDefault === true, 'Vehicle default flag not updated');
    });

    // 5. Publish a Ride
    const rideDepartureTime = new Date(Date.now() + 2 * 3600 * 1000).toISOString(); // 2 hours from now
    await testStep('POST /rides (Publish Ride)', async () => {
      const res = await axios.post(`${baseURL}/rides`, {
        vehicle_id: testState.vehicleId,
        pickup_name: 'HSR Layout Sector 1',
        pickup_lng: 77.6412,
        pickup_lat: 12.9105,
        destination_name: 'Outer Ring Road Tech Hub',
        dest_lng: 77.6974,
        dest_lat: 12.9248,
        departure_time: rideDepartureTime,
        available_seats: 3,
        fare_per_seat: 120,
        notes: 'Carpooling commute',
        is_recurring: false
      }, authHeaders(testState.driverToken));

      assert(res.status === 201, `Expected status 201, got ${res.status}`);
      assert(res.data.data.id, 'Publishing ride did not return ride ID');
      testState.rideId = res.data.data.id;
      console.log(`Published Ride ID: ${testState.rideId}`);
    });

    // 6. Verify duplicate ride publish rejection
    await testStep('POST /rides (Reject Duplicate Ride)', async () => {
      try {
        await axios.post(`${baseURL}/rides`, {
          vehicle_id: testState.vehicleId,
          pickup_name: 'HSR Layout Sector 1',
          pickup_lng: 77.6412,
          pickup_lat: 12.9105,
          destination_name: 'Outer Ring Road Tech Hub',
          dest_lng: 77.6974,
          dest_lat: 12.9248,
          departure_time: rideDepartureTime,
          available_seats: 3,
          fare_per_seat: 120,
          notes: 'Duplicate ride attempt',
          is_recurring: false
        }, authHeaders(testState.driverToken));
        throw new Error('Should have failed duplicate check');
      } catch (err) {
        assert(err.response && err.response.status === 409, `Expected duplicate rejection 409, got ${err.response?.status}`);
        console.log('Duplicate check validated successfully.');
      }
    });

    // 7. Search for Rides (Passenger)
    await testStep('GET /rides (Ride Search)', async () => {
      const res = await axios.get(`${baseURL}/rides`, {
        params: {
          pickup: 'HSR Layout',
          destination: 'Tech Hub',
          date: rideDepartureTime.split('T')[0]
        },
        ...authHeaders(testState.passengerToken)
      });

      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(Array.isArray(res.data.data), 'Expected search results array');
      assert(res.data.data.length > 0, 'Should find at least 1 matching ride');
      console.log(`Found ${res.data.data.length} matching ride(s).`);
    });

    // 8. Book a Seat on the Ride (Passenger)
    await testStep('POST /bookings (Book Ride)', async () => {
      const res = await axios.post(`${baseURL}/bookings`, {
        rideId: testState.rideId,
        requestedSeats: 1
      }, authHeaders(testState.passengerToken));

      assert(res.status === 201, `Expected status 201, got ${res.status}`);
      assert(res.data.data.id, 'Booking returned no booking ID');
      testState.bookingId = res.data.data.id;
      console.log(`Created Booking ID: ${testState.bookingId}`);
    });

    // 9. Accept booking request (Driver) — atomically spawning a Trip
    await testStep('PATCH /bookings/:id/accept (Accept Booking & Spawn Trip)', async () => {
      const res = await axios.patch(`${baseURL}/bookings/${testState.bookingId}/accept`, {}, authHeaders(testState.driverToken));
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.status === 'ACCEPTED', 'Booking status was not updated');

      // Now query database directly using Prisma to verify Trip was created
      const trip = await prisma.trip.findUnique({
        where: { bookingId: testState.bookingId }
      });
      assert(trip !== null, 'Atomically spawned Trip record should exist in DB');
      assert(trip.status === 'ACCEPTED', 'Trip status should be ACCEPTED');
      testState.tripId = trip.id;
      console.log(`Trip spawned successfully: ID ${testState.tripId}, status: ${trip.status}`);
    });

    // 10. Start the Trip (Driver)
    await testStep('PATCH /trips/:id/start (Start Trip)', async () => {
      const res = await axios.patch(`${baseURL}/trips/${testState.tripId}/start`, {}, authHeaders(testState.driverToken));
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.status === 'STARTED', 'Trip status should be STARTED');
    });

    // 11. Complete the Trip (Driver)
    await testStep('PATCH /trips/:id/complete (Complete Trip)', async () => {
      const res = await axios.patch(`${baseURL}/trips/${testState.tripId}/complete`, {}, authHeaders(testState.driverToken));
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.status === 'COMPLETED', 'Trip status should be COMPLETED');
    });

    console.log('=====================================================');
    console.log('ALL MODULES 4-9 ENDPOINT VERIFICATIONS PASSED 100%!');
    console.log('=====================================================');
    process.exit(0);
  } catch (error) {
    console.error('=====================================================');
    console.error('TEST SUITE COMPLETED WITH ERRORS:');
    console.error(error.message);
    if (error.response) {
      console.error('Response details:', error.response.status, error.response.data);
    }
    console.error('=====================================================');
    process.exit(1);
  }
}

async function testStep(name, fn) {
  console.log(`Running: ${name}...`);
  await fn();
  console.log(`[PASS] : ${name}`);
  console.log('-----------------------------------------------------');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

runTests();
