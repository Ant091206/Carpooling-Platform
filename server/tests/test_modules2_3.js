import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 5000;
const baseURL = `http://localhost:${port}/api`;

const testState = {
  adminToken: null,
  orgId: null,
  adminUser: null,
  savedPlaceId: null,
  companyCode: `TST${Math.floor(1000 + Math.random() * 9000)}`,
  adminEmail: `admin_${Date.now()}@testcompany.com`,
  inviteEmail: `employee_${Date.now()}@testcompany.com`
};

async function runTests() {
  console.log('=====================================================');
  console.log('STARTING MODULE 2 & MODULE 3 ENDPOINT VERIFICATION TESTS');
  console.log('=====================================================');

  try {
    // 1. Test Company Registration (Public)
    await testStep('POST /organization/register-company', async () => {
      const res = await axios.post(`${baseURL}/organization/register-company`, {
        name: `Test Tech Corp ${testState.companyCode}`,
        company_code: testState.companyCode,
        email: 'contact@testtech.com',
        phone: '12345678',
        website: 'http://testtech.com',
        address: '123 Tech Way',
        admin_name: 'Alice Admin',
        admin_email: testState.adminEmail,
        admin_password: 'Password123!',
        admin_phone: '87654321'
      });

      assert(res.status === 201, `Expected status 201, got ${res.status}`);
      assert(res.data.success === true, 'Response success should be true');
      assert(res.data.data.organization.company_code === testState.companyCode, 'Company code mismatch');
      assert(res.data.data.admin.email === testState.adminEmail, 'Admin email mismatch');
      
      testState.orgId = res.data.data.organization.id;
      console.log(`Registered Organization ID: ${testState.orgId}`);
    });

    // 2. Test Login (Public)
    await testStep('POST /auth/login', async () => {
      const res = await axios.post(`${baseURL}/auth/login`, {
        email: testState.adminEmail,
        password: 'Password123!'
      });

      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.accessToken, 'Auth token missing');
      testState.adminToken = res.data.data.accessToken;
      testState.adminUser = res.data.data.user;
    });

    const authHeaders = () => ({
      headers: { Authorization: `Bearer ${testState.adminToken}` }
    });

    // 3. Test Get Profile (Protected)
    await testStep('GET /user/profile', async () => {
      const res = await axios.get(`${baseURL}/user/profile`, authHeaders());
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.email === testState.adminEmail, 'Email mismatch in profile');
      assert(res.data.data.passwordHash === undefined, 'Security leak: passwordHash exposed!');
      assert(res.data.data.otpCode === undefined, 'Security leak: otpCode exposed!');
    });

    // 4. Test Update Profile with Emergency Contacts (Protected)
    await testStep('PUT /user/profile', async () => {
      const res = await axios.put(`${baseURL}/user/profile`, {
        name: 'Alice Update',
        phone: '1122334455',
        department: 'Management',
        designation: 'General Manager',
        emergencyContactName: 'Emergency Bob',
        emergencyContactPhone: '9988776655'
      }, authHeaders());

      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.name === 'Alice Update', 'Name update mismatch');
      assert(res.data.data.emergency_contact_name === 'Emergency Bob', 'Emergency contact name mismatch');
      assert(res.data.data.emergency_contact_phone === '9988776655', 'Emergency contact phone mismatch');
    });

    // 5. Test Get and Put User Preferences (Protected)
    await testStep('GET & PUT /user/preferences', async () => {
      // Get initial preferences (should be empty object by default)
      const getRes = await axios.get(`${baseURL}/user/preferences`, authHeaders());
      assert(getRes.status === 200, `Expected status 200, got ${getRes.status}`);

      // Put preferences
      const putRes = await axios.put(`${baseURL}/user/preferences`, {
        theme: 'dark',
        language: 'en',
        notifications: { email: true, push: false }
      }, authHeaders());

      assert(putRes.status === 200, `Expected status 200, got ${putRes.status}`);
      assert(putRes.data.data.theme === 'dark', 'Preference theme mismatch');
      assert(putRes.data.data.notifications.push === false, 'Preference nested property mismatch');
    });

    // 6. Test Saved Places CRUD (Protected)
    await testStep('POST /user/saved-places (Create)', async () => {
      const res = await axios.post(`${baseURL}/user/saved-places`, {
        place_name: 'Home',
        address: '100 Sunset Blvd, LA',
        latitude: 34.0522,
        longitude: -118.2437,
        is_default: 1
      }, authHeaders());

      assert(res.status === 201, `Expected status 201, got ${res.status}`);
      assert(res.data.data.place_name === 'Home', 'Place name mismatch');
      assert(res.data.data.is_default === 1, 'Default flag mismatch');
      testState.savedPlaceId = res.data.data.id;
    });

    // Test Duplicate Saved Place rejection
    await testStep('POST /user/saved-places (Duplicate Rejection)', async () => {
      try {
        await axios.post(`${baseURL}/user/saved-places`, {
          place_name: 'Home',
          address: '200 Different Rd',
          latitude: 35.0,
          longitude: -119.0,
          is_default: 0
        }, authHeaders());
        throw new Error('Should have failed due to duplicate place_name');
      } catch (err) {
        assert(err.response && err.response.status === 400, 'Expected status 400 for duplicates');
      }
    });

    // Test List Saved Places
    await testStep('GET /user/saved-places (List)', async () => {
      const res = await axios.get(`${baseURL}/user/saved-places`, authHeaders());
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.length >= 1, 'Saved places list should contain at least 1 entry');
    });

    // Test Update Saved Place
    await testStep('PUT /user/saved-places/:id (Update)', async () => {
      const res = await axios.put(`${baseURL}/user/saved-places/${testState.savedPlaceId}`, {
        place_name: 'Office',
        address: '200 Headquarters Dr',
        latitude: 37.7749,
        longitude: -122.4194,
        is_default: 1
      }, authHeaders());

      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.place_name === 'Office', 'Update place name mismatch');
    });

    // Test Delete Saved Place
    await testStep('DELETE /user/saved-places/:id (Delete)', async () => {
      const res = await axios.delete(`${baseURL}/user/saved-places/${testState.savedPlaceId}`, authHeaders());
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
    });

    // 7. Test Get Own Organization (Protected)
    await testStep('GET /organization (Own Org)', async () => {
      const res = await axios.get(`${baseURL}/organization`, authHeaders());
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.company_code === testState.companyCode, 'Organization details mismatch');
    });

    // 8. Test List All Organizations (Protected)
    await testStep('GET /organization?all=true (List All)', async () => {
      const res = await axios.get(`${baseURL}/organization?all=true`, authHeaders());
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(Array.isArray(res.data.data), 'Expected array list of organizations');
    });

    // 9. Test Invite Employee (Protected - Admin Only)
    await testStep('POST /organization/invite (Admin)', async () => {
      const res = await axios.post(`${baseURL}/organization/invite`, {
        email: testState.inviteEmail
      }, authHeaders());

      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.success === true || res.data.success === true, 'Invite response should indicate success');
    });

    // 10. Test Get Departments (Protected)
    await testStep('GET /organization/departments', async () => {
      const res = await axios.get(`${baseURL}/organization/departments`, authHeaders());
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(Array.isArray(res.data.data), 'Expected array list of departments');
    });

    // 11. Test Get & Update Organization Settings (Protected)
    await testStep('GET & PUT /organization/settings', async () => {
      const getRes = await axios.get(`${baseURL}/organization/settings`, authHeaders());
      assert(getRes.status === 200, `Expected status 200, got ${getRes.status}`);

      const putRes = await axios.put(`${baseURL}/organization/settings`, {
        allowMixedGender: false,
        maxDetourDistanceKm: 10
      }, authHeaders());

      assert(putRes.status === 200, `Expected status 200, got ${putRes.status}`);
      assert(putRes.data.data.allowMixedGender === false, 'Settings update mismatch');
    });

    // 12. Test Organization Ownership Check (Security Bypass Check)
    await testStep('GET /organization/:id (Ownership Restriction)', async () => {
      try {
        // Attempt to fetch details of a foreign organization ID (e.g. orgId + 999)
        const foreignOrgId = testState.orgId + 999;
        await axios.get(`${baseURL}/organization/${foreignOrgId}`, authHeaders());
        throw new Error('Should have failed ownership checks');
      } catch (err) {
        assert(err.response && err.response.status === 403, 'Expected status 403 for unauthorized access to foreign organization');
      }
    });

    console.log('=====================================================');
    console.log('ALL TESTS PASSED SUCCESSFULLY! BOTH MODULES COMPLIANT');
    console.log('=====================================================');
    process.exit(0);
  } catch (error) {
    console.error('=====================================================');
    console.error('TESTING COMPLETED WITH FAILURES:');
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
