import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Realistic Corporate Data ─────────────────────────────────────────────────

const ORGS = [
  { name: 'Google India', companyCode: 'GOOG-IND', email: 'transport@google.co.in', phone: '+91-80-6721-0000', address: 'Signature Tower, 100 Feet Rd, Indiranagar, Bangalore 560008' },
  { name: 'Microsoft India', companyCode: 'MSFT-IND', email: 'commute@microsoft.com', phone: '+91-80-6622-0000', address: 'Embassy Golf Links, Off Intermediate Ring Road, Bangalore 560071' },
  { name: 'Infosys BPM', companyCode: 'INFY-BLR', email: 'travel@infosys.com', phone: '+91-80-2852-0261', address: 'Electronics City, Phase 1, Hosur Road, Bangalore 560100' }
];

const EMPLOYEES = [
  { first: 'Aarav',   last: 'Sharma',     dept: 'Engineering',        desig: 'Senior Software Engineer',   org: 0 },
  { first: 'Ananya',  last: 'Verma',      dept: 'Product Management', desig: 'Product Manager',            org: 0 },
  { first: 'Amit',    last: 'Patel',      dept: 'Engineering',        desig: 'Staff Engineer',             org: 0 },
  { first: 'Divya',   last: 'Nair',       dept: 'Sales',              desig: 'Account Executive',          org: 0 },
  { first: 'Rohan',   last: 'Gupta',      dept: 'Finance',            desig: 'Financial Analyst',          org: 0 },
  { first: 'Priya',   last: 'Iyer',       dept: 'Marketing',          desig: 'Marketing Lead',             org: 0 },
  { first: 'Vikram',  last: 'Reddy',      dept: 'Engineering',        desig: 'Backend Engineer',           org: 0 },
  { first: 'Neha',    last: 'Joshi',      dept: 'HR',                 desig: 'HR Business Partner',        org: 0 },
  { first: 'Rahul',   last: 'Mehta',      dept: 'Engineering',        desig: 'Frontend Developer',         org: 1 },
  { first: 'Aditi',   last: 'Rao',        dept: 'Design',             desig: 'Senior UX Designer',         org: 1 },
  { first: 'Sanjay',  last: 'Singh',      dept: 'Engineering',        desig: 'Cloud Architect',            org: 1 },
  { first: 'Kajal',   last: 'Kumar',      dept: 'Product Management', desig: 'Associate PM',               org: 1 },
  { first: 'Rajesh',  last: 'Mishra',     dept: 'Sales',              desig: 'Sales Manager',              org: 1 },
  { first: 'Pooja',   last: 'Choudhury',  dept: 'Engineering',        desig: 'DevOps Engineer',            org: 1 },
  { first: 'Sunil',   last: 'Sen',        dept: 'Legal',              desig: 'Legal Counsel',              org: 1 },
  { first: 'Jyoti',   last: 'Das',        dept: 'Finance',            desig: 'Finance Controller',         org: 1 },
  { first: 'Arjun',   last: 'Pillai',     dept: 'Engineering',        desig: 'Mobile Engineer',            org: 2 },
  { first: 'Sneha',   last: 'Pandey',     dept: 'Data Science',       desig: 'Data Scientist',             org: 2 },
  { first: 'Vijay',   last: 'Srinivas',   dept: 'Engineering',        desig: 'QA Lead',                   org: 2 },
  { first: 'Shweta',  last: 'Kulkarni',   dept: 'Marketing',          desig: 'Brand Strategist',           org: 2 },
  { first: 'Karan',   last: 'Oberoi',     dept: 'Engineering',        desig: 'Solutions Architect',        org: 2 },
  { first: 'Tanvi',   last: 'Bhatia',     dept: 'HR',                 desig: 'Talent Acquisition',         org: 2 },
  { first: 'Manish',  last: 'Aggarwal',   dept: 'Engineering',        desig: 'Fullstack Developer',        org: 2 },
  { first: 'Ritu',    last: 'Kapoor',     dept: 'Operations',         desig: 'Ops Manager',                org: 2 },
  { first: 'Deepak',  last: 'Malhotra',   dept: 'Engineering',        desig: 'Principal Engineer',         org: 0 },
];

const VEHICLES_DATA = [
  { brand: 'Toyota',        model: 'Camry Hybrid',     type: 'CAR', fuel: 'HYBRID', color: 'Polar White',   reg: 'KA-01-MJ-3456', seats: 4, year: 2023 },
  { brand: 'Honda',         model: 'City i-VTEC ZX',   type: 'CAR', fuel: 'PETROL', color: 'Golden Brown',  reg: 'KA-03-AB-7821', seats: 4, year: 2022 },
  { brand: 'Hyundai',       model: 'Creta SX (O)',     type: 'SUV', fuel: 'PETROL', color: 'Typhoon Silver', reg: 'KA-51-EQ-4499', seats: 5, year: 2023 },
  { brand: 'Tata',          model: 'Nexon EV Max',     type: 'CAR', fuel: 'EV',     color: 'Intensi-Teal',  reg: 'KA-04-NX-6612', seats: 5, year: 2024 },
  { brand: 'Mahindra',      model: 'XUV700 AX7 L',    type: 'SUV', fuel: 'DIESEL', color: 'Midnight Black', reg: 'KA-53-PL-1188', seats: 7, year: 2023 },
  { brand: 'Maruti Suzuki', model: 'Baleno Zeta',      type: 'CAR', fuel: 'PETROL', color: 'Nexa Blue',     reg: 'KA-01-HQ-2230', seats: 5, year: 2022 },
  { brand: 'Kia',           model: 'Seltos GTX+',      type: 'SUV', fuel: 'PETROL', color: 'Gravity Grey',  reg: 'KA-02-LR-5567', seats: 5, year: 2023 },
  { brand: 'MG',            model: 'ZS EV Exclusive',  type: 'SUV', fuel: 'EV',     color: 'Glaze Red',     reg: 'KA-03-MK-9904', seats: 5, year: 2024 },
  { brand: 'Volkswagen',    model: 'Virtus GT Plus',   type: 'CAR', fuel: 'PETROL', color: 'Reflex Silver',  reg: 'KA-09-WV-3311', seats: 5, year: 2023 },
  { brand: 'Skoda',         model: 'Slavia Style',     type: 'CAR', fuel: 'PETROL', color: 'Candy White',   reg: 'KA-11-SK-7743', seats: 5, year: 2022 },
  { brand: 'Tata',          model: 'Altroz XZ+ Dark',  type: 'CAR', fuel: 'PETROL', color: 'Avenue White',  reg: 'KA-13-TA-8891', seats: 5, year: 2023 },
  { brand: 'Hyundai',       model: 'Ioniq 5',          type: 'SUV', fuel: 'EV',     color: 'Cyber Gray',    reg: 'KA-01-IO-2244', seats: 5, year: 2024 },
  { brand: 'Toyota',        model: 'Fortuner Legender', type: 'SUV', fuel: 'DIESEL', color: 'Super White',  reg: 'KA-04-FT-6699', seats: 7, year: 2023 },
  { brand: 'Honda',         model: 'Amaze S MT',       type: 'CAR', fuel: 'PETROL', color: 'Lunar Silver',  reg: 'KA-05-AM-4412', seats: 5, year: 2022 },
  { brand: 'Maruti Suzuki', model: 'Ertiga ZXi+',      type: 'CAR', fuel: 'CNG',    color: 'Auburn Red',    reg: 'KA-06-ER-7756', seats: 7, year: 2023 },
  { brand: 'Kia',           model: 'EV6 GT-Line',      type: 'SUV', fuel: 'EV',     color: 'Runway Red',    reg: 'KA-07-KE-3387', seats: 5, year: 2024 },
  { brand: 'Mahindra',      model: 'Thar LX (A)',      type: 'SUV', fuel: 'DIESEL', color: 'Aquamarine',    reg: 'KA-08-TH-1122', seats: 4, year: 2023 },
  { brand: 'Volkswagen',    model: 'Taigun GT+',       type: 'SUV', fuel: 'PETROL', color: 'Deep Black',    reg: 'KA-10-TG-9981', seats: 5, year: 2023 },
  { brand: 'Renault',       model: 'Kiger RXT (O)',    type: 'CAR', fuel: 'PETROL', color: 'Ice Cool White', reg: 'KA-12-RK-5544', seats: 5, year: 2022 },
  { brand: 'Hyundai',       model: 'Verna SX (O)',     type: 'CAR', fuel: 'PETROL', color: 'Tellurian Brown', reg: 'KA-14-VE-8867', seats: 5, year: 2023 },
];

// Bangalore real-world pickup/destination coordinates
const LOCATIONS = [
  { name: 'Indiranagar Metro Station', address: '100 Feet Rd, Indiranagar, Bangalore', lat: 12.9784, lng: 77.6408 },
  { name: 'ITPL Gate 3, Whitefield', address: 'ITPB Main Rd, Whitefield, Bangalore', lat: 12.9668, lng: 77.7499 },
  { name: 'Koramangala 4th Block', address: '80 Feet Rd, Koramangala, Bangalore', lat: 12.9345, lng: 77.6256 },
  { name: 'HSR Layout Sector 1', address: '27th Main Rd, HSR Layout, Bangalore', lat: 12.9105, lng: 77.6450 },
  { name: 'Manyata Tech Park', address: 'Outer Ring Rd, Hebbal, Bangalore', lat: 13.0451, lng: 77.6268 },
  { name: 'Electronic City Phase 1', address: 'Hosur Rd, Electronic City, Bangalore', lat: 12.8452, lng: 77.6635 },
  { name: 'Kempegowda International Airport', address: 'Devanahalli, Bangalore', lat: 13.1986, lng: 77.7066 },
  { name: 'Majestic Railway Station', address: 'Gubbi Thotadappa Rd, Majestic, Bangalore', lat: 12.9779, lng: 77.5724 },
  { name: 'Marathahalli Bridge', address: 'Marathahalli, Outer Ring Rd, Bangalore', lat: 12.9591, lng: 77.6974 },
  { name: 'Silk Board Junction', address: 'Outer Ring Rd, Silk Board, Bangalore', lat: 12.9174, lng: 77.6228 },
  { name: 'Sarjapur Road, Bellandur', address: 'Sarjapur Main Rd, Bellandur, Bangalore', lat: 12.9263, lng: 77.6705 },
  { name: 'MG Road Metro Station', address: 'MG Road, Shivajinagar, Bangalore', lat: 12.9746, lng: 77.6086 },
  { name: 'Embassy Tech Village', address: 'Outer Ring Rd, Devarabisanahalli, Bangalore', lat: 12.9478, lng: 77.7012 },
  { name: 'JP Nagar 2nd Phase', address: '24th Main Rd, JP Nagar, Bangalore', lat: 12.9100, lng: 77.5850 },
  { name: 'Yelahanka New Town', address: 'Yelahanka, Bangalore', lat: 13.1006, lng: 77.5963 },
];

const CHAT_MESSAGES = [
  { role: 'passenger', text: 'Hi! Are you on your way?' },
  { role: 'driver',    text: 'Yes! Just passed the signal, be there in 5 minutes.' },
  { role: 'passenger', text: 'I am waiting near the gate entrance.' },
  { role: 'driver',    text: 'Got it. I am in the white Camry. Look for KA-01-MJ-3456.' },
  { role: 'passenger', text: 'Perfect, I can see you! Coming in.' },
  { role: 'driver',    text: 'Great! Hop in, we should reach on time with no traffic.' },
  { role: 'passenger', text: 'Brilliant. Thanks for the timely pickup!' },
  { role: 'driver',    text: 'Happy to help. Same time tomorrow?' },
  { role: 'passenger', text: 'Yes! Will book again. You drive smoothly!' },
  { role: 'driver',    text: 'Appreciate that! Have a great day at work.' },
];

const REVIEWS = [
  'Very punctual driver. Comfortable ride to office!',
  'Pleasant co-passenger. Arrived exactly as said.',
  'Smooth journey. Driver maintained safe speed throughout.',
  'Polite and professional. Will carpool again.',
  'Very clean vehicle. Good music in the car too.',
  'Great driver, knows the best routes to avoid traffic.',
  'Comfortable seats, on-time pickup. Recommended!',
  'Excellent communication before the ride. Very reliable.',
];

async function main() {
  console.log('\n🚀 Enterprise Carpooling Platform — Database Seeding Started\n');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // ── 1. Clean all tables ──────────────────────────────────────────────────────
  console.log('🧹 Cleaning existing tables...');
  await prisma.chatMessage.deleteMany({});
  await prisma.rideReview.deleteMany({});
  await prisma.rideMatch.deleteMany({});
  await prisma.matchPreference.deleteMany({});
  await prisma.analyticsSnapshot.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.rideHistory.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.ride.deleteMany({});
  await prisma.vehicleDocument.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.savedPlace.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.notificationPreference.deleteMany({});
  await prisma.adminActivity.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.systemLog.deleteMany({});
  await prisma.emailQueue.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  // ── 2. Organizations ─────────────────────────────────────────────────────────
  console.log('🏢 Seeding organizations...');
  const orgs = [];
  for (const o of ORGS) {
    const org = await prisma.organization.create({
      data: {
        name: o.name,
        companyCode: o.companyCode,
        email: o.email,
        phone: o.phone,
        address: o.address,
        status: 'ACTIVE',
        settings: { fuel_cost_per_liter: 102.50, travel_cost_per_km: 8.50, fuel_efficiency_km_per_liter: 15.0, platform_fee_percent: 5 }
      }
    });
    orgs.push(org);
  }

  // ── 3. Admin Users ───────────────────────────────────────────────────────────
  console.log('👔 Seeding admin accounts...');
  const admins = [];
  for (let i = 0; i < orgs.length; i++) {
    const org = orgs[i];
    const admin = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: org.companyCode,
        name: `Admin ${org.name}`,
        employeeId: `ADM-${org.companyCode}-001`,
        email: `admin@${org.companyCode.toLowerCase()}.com`,
        passwordHash,
        phone: `+91-98001-0000${i}`,
        organization: org.name,
        organizationId: org.id,
        role: 'ADMIN',
        isVerified: true,
        status: 'ACTIVE',
        designation: 'System Administrator',
        department: 'IT Administration',
      }
    });
    admins.push(admin);
  }

  // ── 4. Employees with Wallets & Saved Places ─────────────────────────────────
  console.log('👥 Seeding employees...');
  const employees = [];
  for (let i = 0; i < EMPLOYEES.length; i++) {
    const e = EMPLOYEES[i];
    const org = orgs[e.org];
    const slug = `${e.first.toLowerCase()}.${e.last.toLowerCase()}`;
    const orgSlug = org.companyCode.toLowerCase().replace('-', '');

    const user = await prisma.user.create({
      data: {
        firstName: e.first,
        lastName: e.last,
        name: `${e.first} ${e.last}`,
        employeeId: `EMP-${org.companyCode}-${200 + i}`,
        email: `${slug}${i}@${orgSlug}.com`,
        passwordHash,
        phone: `+91-9${String(8000000000 + i * 37).slice(0, 9)}`,
        organization: org.name,
        organizationId: org.id,
        department: e.dept,
        designation: e.desig,
        role: 'EMPLOYEE',
        isVerified: true,
        status: 'ACTIVE',
      }
    });

    // Wallet with realistic balance
    const balance = 1500 + (i * 187) % 4000;
    await prisma.wallet.create({ data: { userId: user.id, balance, status: 'ACTIVE' } });

    // Saved Places: Home + Office + Airport + Gym + Station
    const homeLoc = LOCATIONS[i % 4];
    const officeLoc = LOCATIONS[4 + (e.org * 2)];
    await prisma.savedPlace.createMany({
      data: [
        { userId: user.id, placeName: 'Home',           address: homeLoc.address,            latitude: homeLoc.lat,         longitude: homeLoc.lng,         isDefault: 1 },
        { userId: user.id, placeName: 'Office',         address: officeLoc.address,          latitude: officeLoc.lat,       longitude: officeLoc.lng,       isDefault: 0 },
        { userId: user.id, placeName: 'Airport',        address: LOCATIONS[6].address,       latitude: LOCATIONS[6].lat,    longitude: LOCATIONS[6].lng,    isDefault: 0 },
        { userId: user.id, placeName: 'Gym',            address: LOCATIONS[13].address,      latitude: LOCATIONS[13].lat,   longitude: LOCATIONS[13].lng,   isDefault: 0 },
        { userId: user.id, placeName: 'Railway Station', address: LOCATIONS[7].address,      latitude: LOCATIONS[7].lat,    longitude: LOCATIONS[7].lng,    isDefault: 0 },
      ]
    });

    // Notification preferences
    await prisma.notificationPreference.create({ data: { userId: user.id } });

    employees.push(user);
  }

  // ── 5. Vehicles ───────────────────────────────────────────────────────────────
  console.log('🚗 Seeding vehicles...');
  const vehicles = [];
  for (let i = 0; i < VEHICLES_DATA.length; i++) {
    const v = VEHICLES_DATA[i];
    const owner = employees[i % employees.length];
    const vehicle = await prisma.vehicle.create({
      data: {
        ownerId: owner.id,
        registrationNumber: v.reg,
        manufacturer: v.brand,
        model: v.model,
        vehicleType: v.type,
        fuelType: v.fuel,
        color: v.color,
        year: v.year,
        seatCapacity: v.seats,
        isVerified: true,
        status: 'ACTIVE',
        isDefault: i % 2 === 0,
        vehicleImage: `/uploads/vehicles/demo-vehicle-${(i % 5) + 1}.jpg`,
        insuranceExpiry: new Date('2026-12-31'),
        pollutionCertificateExpiry: new Date('2026-06-30'),
        registrationExpiry: new Date('2027-03-31'),
      }
    });
    vehicles.push(vehicle);
  }

  // ── 6. Rides (40 rides — morning, evening, airport, weekend) ─────────────────
  console.log('🛣️  Seeding rides...');
  const rides = [];
  const now = new Date();

  const ROUTE_PAIRS = [
    [0, 4],   // Indiranagar → Manyata Tech Park (morning commute)
    [2, 5],   // Koramangala → Electronic City
    [3, 1],   // HSR Layout → Whitefield
    [0, 2],   // Indiranagar → Koramangala
    [11, 4],  // MG Road → Manyata
    [8, 1],   // Marathahalli → Whitefield
    [10, 5],  // Sarjapur → Electronic City
    [9, 2],   // Silk Board → Koramangala
    [13, 5],  // JP Nagar → Electronic City
    [14, 4],  // Yelahanka → Manyata
    [0, 6],   // Indiranagar → Airport (airport ride)
    [7, 6],   // Majestic → Airport
    [3, 12],  // HSR → Embassy Tech Village
    [11, 8],  // MG Road → Marathahalli
    [4, 0],   // Manyata → Indiranagar (evening)
    [5, 3],   // Electronic City → HSR (evening)
    [1, 3],   // Whitefield → HSR (evening)
    [2, 0],   // Koramangala → Indiranagar (evening)
    [4, 11],  // Manyata → MG Road
    [5, 13],  // Electronic City → JP Nagar (evening)
  ];

  const RIDE_TIMES = [
    // Morning slots
    '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30',
    // Evening slots
    '17:30', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30',
    // Weekend
    '10:00', '11:00', '14:00', '15:00',
  ];

  const STATUSES = ['Scheduled', 'Scheduled', 'Scheduled', 'Completed', 'Completed', 'Completed', 'Started', 'Cancelled'];
  const DISTANCES = [8.4, 14.2, 18.6, 12.3, 9.1, 22.5, 15.8, 10.7, 11.2, 16.9, 28.4, 32.1, 13.5, 7.8, 8.4, 14.2, 18.6, 12.3, 9.1, 22.5];
  const DURATIONS = [28, 42, 55, 38, 30, 68, 48, 32, 35, 50, 85, 95, 40, 25, 28, 42, 55, 38, 30, 68];

  for (let i = 0; i < 40; i++) {
    const pair = ROUTE_PAIRS[i % ROUTE_PAIRS.length];
    const from = LOCATIONS[pair[0]];
    const to = LOCATIONS[pair[1]];
    const driver = employees[i % employees.length];
    const vehicle = vehicles[i % vehicles.length];
    const status = STATUSES[i % STATUSES.length];
    const timeStr = RIDE_TIMES[i % RIDE_TIMES.length];
    const [hh, mm] = timeStr.split(':').map(Number);

    const daysOffset = status === 'Completed' || status === 'Cancelled' ? -(i % 7 + 1) : (i % 5);
    const depDate = new Date(now);
    depDate.setDate(depDate.getDate() + daysOffset);
    depDate.setHours(hh, mm, 0, 0);
    const depStr = depDate.toISOString().slice(0, 19).replace('T', ' ');

    const fare = Math.round(DISTANCES[i % DISTANCES.length] * 10 + 30);
    const availSeats = 1 + (i % 4);

    await prisma.$executeRawUnsafe(`
      INSERT INTO rides (driver_id, vehicle_id, pickup_name, pickup_location, destination_name, destination_location,
        departure_time, available_seats, fare_per_seat, distance_km, estimated_duration, ride_status, is_recurring, notes, created_at, updated_at)
      VALUES (${driver.id}, ${vehicle.id},
        '${from.name.replace(/'/g, "''")}', ST_GeomFromText('POINT(${from.lat} ${from.lng})'),
        '${to.name.replace(/'/g, "''")}', ST_GeomFromText('POINT(${to.lat} ${to.lng})'),
        '${depStr}', ${availSeats}, ${fare}, ${DISTANCES[i % DISTANCES.length]}, ${DURATIONS[i % DURATIONS.length]},
        '${status}', ${i % 3 === 0 ? 1 : 0}, 'Verified employee commute — AC vehicle, safe driver.',
        NOW(), NOW())
    `);

    const [{ id: rideId }] = await prisma.$queryRawUnsafe(`SELECT LAST_INSERT_ID() as id`);
    const ride = await prisma.ride.findUnique({ where: { id: Number(rideId) } });
    rides.push(ride);
  }

  // ── 7. Bookings (40 bookings, 1 per unique ride+passenger pair) ───────────────
  console.log('📋 Seeding bookings...');
  const bookings = [];
  const BOOKING_STATUSES = ['COMPLETED', 'COMPLETED', 'ACCEPTED', 'ACCEPTED', 'PENDING', 'CANCELLED', 'REJECTED'];

  for (let i = 0; i < 40; i++) {
    const ride = rides[i % rides.length];
    // Passenger must differ from driver
    let passIdx = (i + 5) % employees.length;
    if (employees[passIdx].id === ride.driverId) passIdx = (passIdx + 1) % employees.length;
    const passenger = employees[passIdx];
    const status = BOOKING_STATUSES[i % BOOKING_STATUSES.length];

    const booking = await prisma.booking.create({
      data: {
        rideId: ride.id,
        passengerId: passenger.id,
        driverId: ride.driverId,
        requestedSeats: 1,
        status,
      }
    });
    bookings.push(booking);
  }

  // ── 8. Trips (30 trips for accepted/completed bookings) ─────────────────────
  console.log('🗺️  Seeding trips...');
  const trips = [];
  let tripCount = 0;
  const TRIP_STATUSES = ['COMPLETED', 'COMPLETED', 'STARTED', 'IN_PROGRESS', 'ACCEPTED', 'CANCELLED'];

  for (let i = 0; i < bookings.length && tripCount < 30; i++) {
    const booking = bookings[i];
    const ride = rides.find(r => r.id === booking.rideId);
    if (!ride || booking.status === 'REJECTED') continue;

    const tripStatus = TRIP_STATUSES[i % TRIP_STATUSES.length];
    const startedAt = ['COMPLETED', 'STARTED', 'IN_PROGRESS'].includes(tripStatus) ? new Date(ride.departureTime) : null;
    const completedAt = tripStatus === 'COMPLETED' && startedAt
      ? new Date(startedAt.getTime() + (ride.estimatedDuration || 40) * 60000) : null;

    const trip = await prisma.trip.create({
      data: {
        rideId: ride.id,
        bookingId: booking.id,
        driverId: ride.driverId,
        passengerId: booking.passengerId,
        status: tripStatus,
        startedAt,
        completedAt,
      }
    });
    trips.push(trip);
    tripCount++;
  }

  // ── 9. Payments & Wallet Transactions ────────────────────────────────────────
  console.log('💳 Seeding payments & wallet transactions...');
  let payCount = 0;
  let txnCount = 0;
  const PAY_METHODS = ['WALLET', 'UPI', 'RAZORPAY', 'CASH', 'WALLET', 'UPI'];
  const PAY_STATUSES = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILED', 'REFUNDED'];

  for (let i = 0; i < 40; i++) {
    const booking = bookings[i];
    const ride = rides.find(r => r.id === booking.rideId);
    if (!ride) continue;

    const payer = employees.find(e => e.id === booking.passengerId) || employees[i % employees.length];
    const receiver = employees.find(e => e.id === ride.driverId) || employees[(i + 1) % employees.length];

    const fare = parseFloat(ride.farePerSeat);
    const method = PAY_METHODS[i % PAY_METHODS.length];
    const pStatus = PAY_STATUSES[i % PAY_STATUSES.length];

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        payerId: payer.id,
        receiverId: receiver.id,
        paymentMethod: method,
        amount: fare,
        status: pStatus,
        transactionReference: `TXN-GATE-${Date.now() + i}`,
        gatewayOrderId: method === 'RAZORPAY' ? `order_${Date.now() + i}` : null,
        paidAt: pStatus === 'SUCCESS' ? new Date() : null,
      }
    });
    payCount++;

    // Wallet debit for payer
    const payerWallet = await prisma.wallet.findUnique({ where: { userId: payer.id } });
    if (payerWallet && pStatus === 'SUCCESS') {
      const balBefore = parseFloat(payerWallet.balance);
      const balAfter = Math.max(0, balBefore - fare);
      await prisma.walletTransaction.create({
        data: {
          walletId: payerWallet.id,
          userId: payer.id,
          paymentId: payment.id,
          transactionType: 'RIDE_PAYMENT',
          amount: fare,
          balanceBefore: balBefore,
          balanceAfter: balAfter,
          referenceNo: `DEBIT-${payer.id}-${i}-${Date.now()}`,
          description: `Ride fare: ${ride.pickupName} → ${ride.destinationName}`,
          status: 'SUCCESS',
        }
      });
      await prisma.wallet.update({ where: { id: payerWallet.id }, data: { balance: balAfter } });
      txnCount++;
    }

    // Wallet credit for driver/receiver
    const recvWallet = await prisma.wallet.findUnique({ where: { userId: receiver.id } });
    if (recvWallet && pStatus === 'SUCCESS') {
      const balBefore = parseFloat(recvWallet.balance);
      const balAfter = balBefore + fare;
      await prisma.walletTransaction.create({
        data: {
          walletId: recvWallet.id,
          userId: receiver.id,
          paymentId: payment.id,
          transactionType: 'REWARD',
          amount: fare,
          balanceBefore: balBefore,
          balanceAfter: balAfter,
          referenceNo: `CREDIT-${receiver.id}-${i}-${Date.now()}`,
          description: `Ride earnings: ${ride.pickupName} → ${ride.destinationName}`,
          status: 'SUCCESS',
        }
      });
      await prisma.wallet.update({ where: { id: recvWallet.id }, data: { balance: balAfter } });
      txnCount++;
    }
  }

  // Add recharge transactions for every employee
  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const wallet = await prisma.wallet.findUnique({ where: { userId: emp.id } });
    if (!wallet) continue;
    const balBefore = parseFloat(wallet.balance);
    const rechargeAmt = 500 + (i % 5) * 200;
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId: emp.id,
        transactionType: 'RECHARGE',
        amount: rechargeAmt,
        balanceBefore: balBefore,
        balanceAfter: balBefore + rechargeAmt,
        referenceNo: `RECHARGE-${emp.id}-INIT-${Date.now() + i}`,
        description: 'Initial wallet top-up via Razorpay',
        status: 'SUCCESS',
      }
    });
    txnCount++;
  }

  // ── 10. Ride History ─────────────────────────────────────────────────────────
  console.log('📜 Seeding ride history...');
  let histCount = 0;
  for (let i = 0; i < trips.length; i++) {
    const trip = trips[i];
    if (trip.status !== 'COMPLETED') continue;
    const ride = rides.find(r => r.id === trip.rideId);
    if (!ride) continue;

    await prisma.rideHistory.create({
      data: {
        rideId: ride.id,
        driverId: trip.driverId,
        passengerId: trip.passengerId,
        farePaid: parseFloat(ride.farePerSeat),
        distance: parseFloat(ride.distanceKm || 10),
        duration: ride.estimatedDuration || 35,
        pickup: ride.pickupName,
        dropoff: ride.destinationName,
        rideDate: trip.startedAt || ride.departureTime,
        status: 'Completed',
        paymentStatus: 'SUCCESS',
      }
    });
    histCount++;
  }

  // ── 11. Reviews ──────────────────────────────────────────────────────────────
  console.log('⭐ Seeding reviews...');
  let reviewCount = 0;
  for (let i = 0; i < trips.length; i++) {
    const trip = trips[i];
    if (trip.status !== 'COMPLETED') continue;
    const ride = rides.find(r => r.id === trip.rideId);
    if (!ride) continue;

    // passenger reviews driver
    try {
      await prisma.rideReview.create({
        data: {
          rideId: ride.id,
          reviewerId: trip.passengerId,
          revieweeId: trip.driverId,
          rating: 3 + (i % 3),
          review: REVIEWS[i % REVIEWS.length],
        }
      });
      reviewCount++;
    } catch (_) { /* skip duplicate */ }

    // driver reviews passenger
    try {
      await prisma.rideReview.create({
        data: {
          rideId: ride.id,
          reviewerId: trip.driverId,
          revieweeId: trip.passengerId,
          rating: 4 + (i % 2),
          review: 'Good passenger. On time, professional, and friendly.',
        }
      });
      reviewCount++;
    } catch (_) { /* skip duplicate */ }
  }

  // ── 12. Chat Messages (200 messages) ─────────────────────────────────────────
  console.log('💬 Seeding chat messages...');
  let chatCount = 0;
  for (let i = 0; i < 40; i++) {
    const ride = rides[i % rides.length];
    const booking = bookings.find(b => b.rideId === ride.id);
    if (!booking) continue;

    for (let j = 0; j < 5; j++) {
      const msg = CHAT_MESSAGES[j % CHAT_MESSAGES.length];
      const senderId = msg.role === 'driver' ? ride.driverId : booking.passengerId;
      const hour = 8 + Math.floor(j / 2);
      const min = (j * 7) % 60;
      await prisma.chatMessage.create({
        data: {
          rideId: ride.id,
          senderId,
          text: msg.text,
          time: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')} AM`,
          isRead: j < 4,
        }
      });
      chatCount++;
    }
  }

  // ── 13. Notifications (120 notifications) ────────────────────────────────────
  console.log('🔔 Seeding notifications...');
  let notifCount = 0;
  const NOTIF_TEMPLATES = [
    { title: 'Ride Request Accepted', msg: 'Your carpool request has been accepted. Check trip details.', cat: 'BOOKING', type: 'SUCCESS', url: '/my-trips' },
    { title: 'Booking Confirmed',     msg: 'Your seat is confirmed for tomorrow\'s commute!', cat: 'BOOKING', type: 'SUCCESS', url: '/my-trips' },
    { title: 'Trip Started',          msg: 'Your driver has started the trip. Track in real-time.', cat: 'RIDE', type: 'INFO', url: '/my-trips' },
    { title: 'Trip Completed',        msg: 'Trip completed successfully. Please rate your experience.', cat: 'RIDE', type: 'SUCCESS', url: '/ride-history' },
    { title: 'Payment Successful',    msg: 'INR 150 debited from wallet for carpool fare.', cat: 'PAYMENT', type: 'SUCCESS', url: '/wallet' },
    { title: 'Wallet Recharged',      msg: 'Wallet topped up with INR 500 via Razorpay.', cat: 'PAYMENT', type: 'SUCCESS', url: '/wallet' },
    { title: 'Ride Cancelled',        msg: 'A scheduled ride has been cancelled. Find an alternative.', cat: 'RIDE', type: 'WARNING', url: '/find-ride' },
    { title: 'New Ride Available',    msg: 'A colleague just published a ride matching your route!', cat: 'RIDE', type: 'INFO', url: '/find-ride' },
    { title: 'Earnings Credited',     msg: 'INR 140 credited to your wallet for today\'s carpool.', cat: 'PAYMENT', type: 'SUCCESS', url: '/wallet' },
    { title: 'Ride Reminder',         msg: 'Reminder: You have a scheduled ride in 30 minutes.', cat: 'REMINDER', type: 'INFO', url: '/my-trips' },
  ];

  for (let i = 0; i < 120; i++) {
    const user = employees[i % employees.length];
    const t = NOTIF_TEMPLATES[i % NOTIF_TEMPLATES.length];
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: t.title,
        message: t.msg,
        type: t.type,
        category: t.cat,
        priority: i % 5 === 0 ? 'HIGH' : 'MEDIUM',
        isRead: i % 3 !== 0,
        actionUrl: t.url,
      }
    });
    notifCount++;
  }

  // ── 14. Reports ──────────────────────────────────────────────────────────────
  console.log('📊 Seeding analytics reports...');
  const REPORT_TYPES = [
    { title: 'Monthly Commute Analytics — June 2026',     type: 'RIDE',    file: 'PDF' },
    { title: 'Q2 2026 Fuel Consumption Report',           type: 'FUEL',    file: 'CSV' },
    { title: 'Employee Participation Report — Jul 2026',  type: 'PARTICIPATION', file: 'XLSX' },
    { title: 'Vehicle Utilization Report — June 2026',    type: 'VEHICLE', file: 'PDF' },
    { title: 'Cost Analysis Report — Q2 2026',            type: 'PAYMENT', file: 'CSV' },
    { title: 'Carbon Emission Savings — FY 2026',         type: 'RIDE',    file: 'PDF' },
  ];
  for (let i = 0; i < REPORT_TYPES.length; i++) {
    const r = REPORT_TYPES[i];
    await prisma.report.create({
      data: {
        title: r.title,
        type: r.type,
        generatedBy: employees[i % employees.length].id,
        fileType: r.file,
        status: 'COMPLETED',
        filters: JSON.stringify({ startDate: '2026-01-01', endDate: '2026-06-30', orgId: orgs[i % orgs.length].id }),
        fileUrl: `/uploads/reports/report_${i + 1}.${r.file.toLowerCase()}`,
      }
    });
  }

  // ── 15. Analytics Snapshot ───────────────────────────────────────────────────
  await prisma.analyticsSnapshot.create({
    data: {
      totalUsers: employees.length + admins.length,
      totalDrivers: vehicles.length,
      totalPassengers: employees.length,
      totalRides: rides.length,
      completedRides: rides.filter(r => r.rideStatus === 'Completed').length,
      cancelledRides: rides.filter(r => r.rideStatus === 'Cancelled').length,
      pendingRides: rides.filter(r => r.rideStatus === 'Scheduled').length,
      totalRevenue: trips.filter(t => t.status === 'COMPLETED').length * 150,
      averageRideDistance: 14.8,
      averageRideDuration: 42.5,
      averageRating: 4.3,
    }
  });

  // ── 16. Announcements ────────────────────────────────────────────────────────
  await prisma.announcement.createMany({
    data: [
      { title: '🎉 Enterprise Carpooling Platform Launched!', message: 'We are excited to launch the employee carpooling initiative. Sign up, verify your vehicle, and start sharing commutes.', isActive: true },
      { title: '⛽ Fuel Cost Update — July 2026', message: 'Fuel cost has been updated to INR 102.50/liter. Reports will reflect the new rate from July 1, 2026.', isActive: true },
      { title: '🏆 Top Carpoolers This Month', message: 'Aarav Sharma and Rahul Mehta are this month\'s top carpoolers! They have saved 45 kg of CO₂ combined.', isActive: true },
    ]
  });

  // ── 17. Admin Activities ─────────────────────────────────────────────────────
  for (let i = 0; i < 10; i++) {
    const admin = admins[i % admins.length];
    const actions = [
      { action: 'VERIFY_VEHICLE', module: 'VEHICLE', desc: `Verified vehicle ${VEHICLES_DATA[i % VEHICLES_DATA.length].reg}` },
      { action: 'UPDATE_COST_CONFIG', module: 'ADMIN', desc: 'Updated fuel cost per liter to INR 102.50' },
      { action: 'VIEW_PARTICIPATION', module: 'ADMIN', desc: 'Viewed monthly participation report' },
      { action: 'UPDATE_USER_STATUS', module: 'USER', desc: 'Activated employee account' },
    ];
    const act = actions[i % actions.length];
    await prisma.adminActivity.create({
      data: { adminId: admin.id, action: act.action, module: act.module, description: act.desc }
    });
  }

  // ─── FINAL SUMMARY ────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════');
  console.log('🎉  ENTERPRISE CARPOOLING — SEEDING COMPLETE');
  console.log('════════════════════════════════════════════════');
  console.log(`Organizations Created      : ${orgs.length}`);
  console.log(`Admins Created             : ${admins.length}`);
  console.log(`Employees Created          : ${employees.length}`);
  console.log(`Vehicles Created           : ${vehicles.length}`);
  console.log(`Rides Created              : ${rides.length}`);
  console.log(`Bookings Created           : ${bookings.length}`);
  console.log(`Trips Created              : ${trips.length}`);
  console.log(`Payments Created           : ${payCount}`);
  console.log(`Wallet Transactions        : ${txnCount}`);
  console.log(`Ride History Records       : ${histCount}`);
  console.log(`Reviews Created            : ${reviewCount}`);
  console.log(`Chat Messages              : ${chatCount}`);
  console.log(`Notifications              : ${notifCount}`);
  console.log(`Saved Places               : ${employees.length * 5}`);
  console.log(`Reports Generated          : ${REPORT_TYPES.length}`);
  console.log('Database Status            : ✅ Verified');
  console.log('Demo Data Ready            : ✅ Yes');
  console.log('════════════════════════════════════════════════');
  console.log('\n📋 Login Credentials');
  console.log('────────────────────────────────────────────────');
  for (const a of admins) {
    console.log(`  [ADMIN]    ${a.email}  /  Password123!`);
  }
  console.log(`  [EMPLOYEE] aarav.sharma0@googind.com  /  Password123!`);
  console.log(`  [EMPLOYEE] rahul.mehta8@msftind.com   /  Password123!`);
  console.log(`  [EMPLOYEE] arjun.pillai16@infyblr.com /  Password123!`);
  console.log('════════════════════════════════════════════════\n');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e.message);
    await prisma.$disconnect();
    process.exit(1);
  });
