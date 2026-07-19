import axios from 'axios';
import dotenv from 'dotenv';
import prisma from '../config/db.js';

dotenv.config();

const port = process.env.PORT || 5000;
const baseURL = `http://localhost:${port}/api`;

const testState = {
  driverToken: null,
  driverId: null,
  driverEmail: `driver_m10_${Date.now()}@testcompany.com`,
  
  passengerToken: null,
  passengerId: null,
  passengerEmail: `passenger_m10_${Date.now()}@testcompany.com`,
  
  adminToken: null,
  adminId: null,
  adminEmail: `admin_m10_${Date.now()}@testcompany.com`,
  
  vehicleId: null,
  rideId: null,
  bookingId: null,
  tripId: null,
  paymentId: null,
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
  console.log('STARTING INTEGRATION TESTS FOR MODULES 10 THROUGH 13');
  console.log('=====================================================');

  try {
    // 1. Setup Admin, Driver, and Passenger accounts
    await testStep('POST /auth/register (Admin User)', async () => {
      const res = await axios.post(`${baseURL}/auth/register`, {
        firstName: 'System',
        lastName: 'Admin',
        employee_id: `ADM${Date.now()}`,
        email: testState.adminEmail,
        phone: '9888888881',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        organization: 'Test Company',
        department: 'Operations',
        terms: true
      });

      assert(res.status === 201, `Expected status 201, got ${res.status}`);
      testState.adminToken = res.data.data.accessToken;
      testState.adminId = res.data.data.user.id;

      // Force make this user an ADMIN in the database for admin panel testing
      await prisma.user.update({
        where: { id: testState.adminId },
        data: { role: 'ADMIN' }
      });
      console.log(`Registered Admin ID: ${testState.adminId}`);

      // Re-login to get token with ADMIN role claims
      const loginRes = await axios.post(`${baseURL}/auth/login`, {
        email: testState.adminEmail,
        password: 'Password123!'
      });
      testState.adminToken = loginRes.data.data.accessToken;
    });

    await testStep('POST /auth/register (Driver)', async () => {
      const res = await axios.post(`${baseURL}/auth/register`, {
        firstName: 'Alice',
        lastName: 'Driver',
        employee_id: `DRV${Date.now()}`,
        email: testState.driverEmail,
        phone: '9888888882',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        organization: 'Test Company',
        department: 'Logistics',
        terms: true
      });

      assert(res.status === 201, `Expected status 201, got ${res.status}`);
      testState.driverToken = res.data.data.accessToken;
      testState.driverId = res.data.data.user.id;
      console.log(`Registered Driver ID: ${testState.driverId}`);
    });

    await testStep('POST /auth/register (Passenger)', async () => {
      const res = await axios.post(`${baseURL}/auth/register`, {
        firstName: 'Bob',
        lastName: 'Passenger',
        employee_id: `PSG${Date.now()}`,
        email: testState.passengerEmail,
        phone: '9888888883',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        organization: 'Test Company',
        department: 'Engineering',
        terms: true
      });

      assert(res.status === 201, `Expected status 201, got ${res.status}`);
      testState.passengerToken = res.data.data.accessToken;
      testState.passengerId = res.data.data.user.id;
      console.log(`Registered Passenger ID: ${testState.passengerId}`);
    });

    // 2. Wallet Dashboard & Balance Operations (Module 10)
    await testStep('GET /wallet (Retrieve/Auto-create Wallet)', async () => {
      const res = await axios.get(`${baseURL}/wallet`, authHeaders(testState.passengerToken));
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(parseFloat(res.data.data.balance) === 0, 'Initial balance should be 0');
    });

    await testStep('POST /wallet/recharge (Add Balance)', async () => {
      const res = await axios.post(`${baseURL}/wallet/recharge`, {
        amount: 500,
        description: 'Monthly commute top-up'
      }, authHeaders(testState.passengerToken));

      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(parseFloat(res.data.data.wallet.balance) === 500, 'Balance should be ₹500');
    });

    await testStep('GET /wallet/transactions (List & Filter Transactions)', async () => {
      const res = await axios.get(`${baseURL}/wallet/transactions`, authHeaders(testState.passengerToken));
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.transactions.length >= 1, 'Expected at least 1 recharge transaction');
      assert(res.data.data.transactions[0].transactionType === 'RECHARGE', 'Expected RECHARGE type');
    });

    // Setup active completed ride so we can test payments, reviews, and history
    let departureTime = new Date(Date.now() + 2 * 3600 * 1000).toISOString(); // 2 hours in the future
    await testStep('Setup Ride, Booking, and Trip records', async () => {
      // 1. Register vehicle
      const vehRes = await axios.post(`${baseURL}/vehicle`, {
        brand: 'Hyundai',
        model: 'Kona EV',
        registration_brand: 'Hyundai',
        registration_number: `REG_${Math.floor(1000 + Math.random() * 9000)}`,
        color: 'Silver',
        fuel_type: 'Electric',
        seat_capacity: 4
      }, authHeaders(testState.driverToken));
      testState.vehicleId = vehRes.data.data.id;

      // 2. Set Default
      await axios.patch(`${baseURL}/vehicle/default/${testState.vehicleId}`, {}, authHeaders(testState.driverToken));

      // 3. Publish ride
      const rideRes = await axios.post(`${baseURL}/rides`, {
        vehicle_id: testState.vehicleId,
        pickup_name: 'Tech Park Block A',
        pickup_lng: 77.6412,
        pickup_lat: 12.9105,
        destination_name: 'Tech Park Block B',
        dest_lng: 77.6974,
        dest_lat: 12.9248,
        departure_time: departureTime,
        available_seats: 4,
        fare_per_seat: 150,
        is_recurring: false
      }, authHeaders(testState.driverToken));
      testState.rideId = rideRes.data.data.id;

      // 4. Booking
      const bookingRes = await axios.post(`${baseURL}/bookings`, {
        rideId: testState.rideId,
        requestedSeats: 1
      }, authHeaders(testState.passengerToken));
      testState.bookingId = bookingRes.data.data.id;

      // 5. Driver Accept (spawns Trip in database)
      const acceptRes = await axios.patch(`${baseURL}/bookings/${testState.bookingId}/accept`, {}, authHeaders(testState.driverToken));
      assert(acceptRes.status === 200, 'Accept booking failed');

      const trip = await prisma.trip.findUnique({
        where: { bookingId: testState.bookingId }
      });
      testState.tripId = trip.id;
      
      // 6. Start Ride, Start Trip, Complete Trip, and Complete Ride
      await axios.patch(`${baseURL}/rides/${testState.rideId}/start`, {}, authHeaders(testState.driverToken));
      await axios.patch(`${baseURL}/trips/${testState.tripId}/start`, {}, authHeaders(testState.driverToken));
      await axios.patch(`${baseURL}/trips/${testState.tripId}/complete`, {}, authHeaders(testState.driverToken));
      await axios.patch(`${baseURL}/rides/${testState.rideId}/complete`, {}, authHeaders(testState.driverToken));
    });

    // 3. Payment flows (Wallet/Cash/UPI/Razorpay sandbox)
    await testStep('POST /payments (Process WALLET Payment)', async () => {
      const res = await axios.post(`${baseURL}/payments`, {
        bookingId: testState.bookingId,
        paymentMethod: 'WALLET'
      }, authHeaders(testState.passengerToken));

      assert(res.status === 201, `Expected status 201, got ${res.status}`);
      testState.paymentId = res.data.data.payment.id;
      
      // Verify balance deducted (₹500 - ₹150 = ₹350)
      const walletRes = await axios.get(`${baseURL}/wallet`, authHeaders(testState.passengerToken));
      assert(parseFloat(walletRes.data.data.balance) === 350, `Expected balance ₹350, got ₹${walletRes.data.data.balance}`);
      console.log('Wallet successfully debited. Balance: ₹350');
    });

    await testStep('POST /payments (Duplicate Payment Rejection)', async () => {
      try {
        await axios.post(`${baseURL}/payments`, {
          bookingId: testState.bookingId,
          paymentMethod: 'WALLET'
        }, authHeaders(testState.passengerToken));
        throw new Error('Should have failed duplicate check');
      } catch (err) {
        assert(err.response && err.response.status === 409, `Expected 409 Conflict, got ${err.response?.status}`);
        console.log('Duplicate payment check passed.');
      }
    });

    // Check payment retry handler by forcing status to FAILED in DB and checking retry
    await testStep('POST /payments (Successful Retry Flow)', async () => {
      // Force payment status to FAILED in DB
      await prisma.payment.update({
        where: { id: testState.paymentId },
        data: { status: 'FAILED' }
      });

      // Now retry payment as passenger (via CASH method to prevent double-charging wallet)
      const res = await axios.post(`${baseURL}/payments`, {
        bookingId: testState.bookingId,
        paymentMethod: 'CASH'
      }, authHeaders(testState.passengerToken));

      assert(res.status === 201, `Expected status 201, got ${res.status}`);
      assert(res.data.data.payment.id === testState.paymentId, 'Should update same record');
      assert(res.data.data.payment.status === 'SUCCESS', 'Updated status should be SUCCESS');
      console.log('Retry flow successfully updated the existing failed payment record.');
    });

    // 4. Ride History & Reviews (Module 11)
    await testStep('GET /history/my-rides (Retrieve History Categorized Lists)', async () => {
      const res = await axios.get(`${baseURL}/history/my-rides`, authHeaders(testState.passengerToken));
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.completed.length >= 1, 'Expected at least 1 completed ride in history');
    });

    await testStep('GET /history/:rideId (Retrieve Ride Details & Timeline)', async () => {
      const res = await axios.get(`${baseURL}/history/${testState.rideId}`, authHeaders(testState.passengerToken));
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.id === testState.rideId, 'Ride ID mismatch');
      assert(res.data.data.timeline.length > 0, 'Timeline should not be empty');
    });

    await testStep('POST /review (Submit Ratings & Feedback)', async () => {
      const res = await axios.post(`${baseURL}/review`, {
        rideId: testState.rideId,
        revieweeId: testState.driverId,
        rating: 5,
        review: 'Super prompt and driving was very safe!'
      }, authHeaders(testState.passengerToken));

      assert(res.status === 200 || res.status === 201, `Expected status 200 or 201, got ${res.status}`);
      assert(res.data.data.id, 'No review ID returned');
    });

    await testStep('POST /review (Block Duplicate Review)', async () => {
      try {
        await axios.post(`${baseURL}/review`, {
          rideId: testState.rideId,
          revieweeId: testState.driverId,
          rating: 4,
          review: 'Trying to update review...'
        }, authHeaders(testState.passengerToken));
        throw new Error('Should have blocked duplicate review');
      } catch (err) {
        assert(err.response && err.response.status === 409, `Expected 409, got ${err.response?.status}`);
        console.log('Duplicate review block verified successfully.');
      }
    });

    // 5. Reports Module (Module 12)
    await testStep('POST /reports/generate (Generate custom export report)', async () => {
      const res = await axios.post(`${baseURL}/reports/generate`, {
        title: 'Q2 Commute Financial Summary',
        type: 'PAYMENT',
        fileType: 'CSV',
        filters: {}
      }, authHeaders(testState.adminToken));

      assert(res.status === 201, `Expected status 201, got ${res.status}`);
    });

    await testStep('GET /reports (Retrieve generated reports list)', async () => {
      const res = await axios.get(`${baseURL}/reports`, authHeaders(testState.adminToken));
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.length >= 1, 'Should contain generated report');
    });

    // 6. Admin Panel (Module 13)
    await testStep('GET /admin/dashboard (Admin overview statistics)', async () => {
      const res = await axios.get(`${baseURL}/admin/dashboard`, authHeaders(testState.adminToken));
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.overview.totalUsers >= 3, 'Expected registered users in stats');
    });

    await testStep('GET /admin/users (Monitor platform users list)', async () => {
      const res = await axios.get(`${baseURL}/admin/users`, authHeaders(testState.adminToken));
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.users.length >= 3, 'Should find all registered users');
    });

    await testStep('GET /admin/rides (Monitor platform rides)', async () => {
      const res = await axios.get(`${baseURL}/admin/rides`, authHeaders(testState.adminToken));
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.rides.length >= 1, 'Should find published ride');
    });

    console.log('=====================================================');
    console.log('ALL MODULES 10-13 ENDPOINT VERIFICATIONS PASSED 100%!');
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
