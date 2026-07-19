import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper helper arrays for realistic corporate fake generation
const FIRST_NAMES = ['Aarav', 'Ananya', 'Amit', 'Divya', 'Rohan', 'Priya', 'Vikram', 'Neha', 'Rahul', 'Aditi', 'Sanjay', 'Kajal', 'Rajesh', 'Pooja', 'Sunil', 'Jyoti', 'Arjun', 'Sneha', 'Vijay', 'Shweta', 'Karan', 'Tanvi'];
const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Nair', 'Gupta', 'Iyer', 'Reddy', 'Joshi', 'Mehta', 'Rao', 'Singh', 'Kumar', 'Mishra', 'Choudhury', 'Sen', 'Das', 'Pillai', 'Pandey'];
const DEPARTMENTS = ['Engineering', 'Product Management', 'Sales', 'Finance', 'Human Resources', 'Marketing', 'Legal'];
const DESIGNATIONS = ['Software Engineer', 'Senior Product Manager', 'Account Executive', 'Financial Analyst', 'HR Specialist', 'Marketing Associate', 'Legal Counsel'];
const PHONE_PREFIXES = ['+91-98765-', '+91-87654-', '+91-76543-', '+91-91234-'];

const CAR_BRANDS = ['Toyota', 'Honda', 'Hyundai', 'Tata', 'Mahindra', 'Maruti Suzuki', 'Kia', 'MG', 'Tesla', 'Hyundai'];
const CAR_MODELS = ['Camry Hybrid', 'City i-VTEC', 'Creta SX', 'Nexon EV', 'XUV700 AX7', 'Swift ZXi', 'Seltos GTX', 'ZS EV', 'Model 3', 'Kona Electric'];
const COLORS = ['Polar White', 'Midnight Black', 'Silver Frost', 'Deep Blue', 'Graphite Grey', 'Sunset Red'];
const REG_LOCATIONS = ['KA-01-MJ', 'KA-03-AB', 'KA-51-EQ', 'KA-04-NX', 'KA-53-PL'];

const BANGALORE_PLACES = [
  { name: 'Indiranagar Metro Station', address: '100 Feet Rd, Indiranagar, Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'ITPL Gate 3, Whitefield', address: 'ITPB Main Rd, Whitefield, Bangalore', lat: 12.9668, lng: 77.7499 },
  { name: 'Sony World Junction, Koramangala', address: '80 Feet Rd, Koramangala 4th Block, Bangalore', lat: 12.9345, lng: 77.6256 },
  { name: 'HSR Layout Sector 1', address: '27th Main Rd, HSR Layout, Bangalore', lat: 12.9105, lng: 77.6450 },
  { name: 'Manyata Tech Park, Hebbal', address: 'Outer Ring Rd, Hebbal, Bangalore', lat: 13.0451, lng: 77.6268 },
  { name: 'Electronic City Toll Plaza', address: 'Hosur Rd, Electronic City Phase 1, Bangalore', lat: 12.8452, lng: 77.6635 },
  { name: 'Kempegowda International Airport', address: 'Devanahalli, Bangalore', lat: 13.1986, lng: 77.7066 },
  { name: 'Majestic Railway Station', address: 'Gubbi Thotadappa Rd, Majestic, Bangalore', lat: 12.9779, lng: 77.5724 },
  { name: 'Gold\'s Gym, JP Nagar', address: '24th Main Rd, JP Nagar 2nd Phase, Bangalore', lat: 12.9100, lng: 77.5850 }
];

async function main() {
  console.log('🚀 Running database cleanup...');

  // Reset database before seeding (deletes child tables first to respect FK constraints)
  await prisma.chatMessage.deleteMany({});
  await prisma.rideReview.deleteMany({});
  await prisma.rideMatch.deleteMany({});
  await prisma.matchPreference.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.rideHistory.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.ride.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.savedPlace.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.notificationPreference.deleteMany({});
  await prisma.emailQueue.deleteMany({});
  await prisma.systemLog.deleteMany({});
  await prisma.adminActivity.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  console.log('🧹 Cleaned existing tables. Seeding realistic dataset...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed 3 Corporate Organizations
  const google = await prisma.organization.create({
    data: {
      name: 'Google India',
      companyCode: 'GOOG-IND',
      email: 'transport-desk@google.co.in',
      phone: '+91-80-6721-0000',
      address: 'Signature Tower, Swami Vivekananda Rd, Indiranagar, Bangalore, KA - 560008',
      status: 'ACTIVE',
      settings: { fuel_cost_per_liter: 102.50, travel_cost_per_km: 8.50 }
    }
  });

  const microsoft = await prisma.organization.create({
    data: {
      name: 'Microsoft India',
      companyCode: 'MSFT-IND',
      email: 'corp-travel@microsoft.com',
      phone: '+91-80-6622-0000',
      address: 'Embassy Golf Links, Off Intermediate Ring Road, Bangalore, KA - 560071',
      status: 'ACTIVE',
      settings: { fuel_cost_per_liter: 102.50, travel_cost_per_km: 8.50 }
    }
  });

  const tcs = await prisma.organization.create({
    data: {
      name: 'TCS Bangalore',
      companyCode: 'TCS-IND',
      email: 'admin.blr@tcs.com',
      phone: '+91-80-6653-0000',
      address: 'Think Campus, Electronic City Phase 1, Bangalore, KA - 560100',
      status: 'ACTIVE',
      settings: { fuel_cost_per_liter: 102.50, travel_cost_per_km: 8.50 }
    }
  });

  const orgs = [google, microsoft, tcs];

  // 2. Seed 3 Admins (one for each organization)
  const admins = [];
  for (let i = 0; i < 3; i++) {
    const org = orgs[i];
    const email = `admin@${org.name.toLowerCase().replace(' ', '')}.com`;
    const admin = await prisma.user.create({
      data: {
        firstName: 'Corporate',
        lastName: `Admin ${i+1}`,
        name: `Corporate Admin ${org.companyCode}`,
        employeeId: `ADM-BLR-${100 + i}`,
        email,
        passwordHash,
        phone: `+91-99000-${20000 + i}`,
        organization: org.name,
        organizationId: org.id,
        role: 'ADMIN',
        isVerified: true,
        status: 'ACTIVE'
      }
    });
    admins.push(admin);
  }

  // 3. Seed 20 Verified Employees across departments
  const employees = [];
  for (let i = 0; i < 20; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const org = orgs[i % orgs.length];
    const dept = DEPARTMENTS[i % DEPARTMENTS.length];
    const desig = DESIGNATIONS[i % DESIGNATIONS.length];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${org.name.toLowerCase().replace(' ', '')}.com`;
    
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        employeeId: `EMP-${org.companyCode}-${200 + i}`,
        email,
        passwordHash,
        phone: `${PHONE_PREFIXES[i % PHONE_PREFIXES.length]}${10000 + i}`,
        organization: org.name,
        organizationId: org.id,
        department: dept,
        designation: desig,
        role: 'EMPLOYEE',
        isVerified: true,
        status: 'ACTIVE'
      }
    });

    // Create Wallet pre-funded
    const balance = 1500.00 + (i * 200);
    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance,
        status: 'ACTIVE'
      }
    });

    // Create default saved places for Home, Office, Gym, Airport, Station
    await prisma.savedPlace.createMany({
      data: [
        { userId: user.id, placeName: 'Home', address: BANGALORE_PLACES[i % 4].address, latitude: BANGALORE_PLACES[i % 4].lat, longitude: BANGALORE_PLACES[i % 4].lng, isDefault: 1 },
        { userId: user.id, placeName: 'Office', address: BANGALORE_PLACES[4].address, latitude: BANGALORE_PLACES[4].lat, longitude: BANGALORE_PLACES[4].lng, isDefault: 0 },
        { userId: user.id, placeName: 'Gym', address: BANGALORE_PLACES[8].address, latitude: BANGALORE_PLACES[8].lat, longitude: BANGALORE_PLACES[8].lng, isDefault: 0 },
        { userId: user.id, placeName: 'Airport', address: BANGALORE_PLACES[6].address, latitude: BANGALORE_PLACES[6].lat, longitude: BANGALORE_PLACES[6].lng, isDefault: 0 },
        { userId: user.id, placeName: 'Station', address: BANGALORE_PLACES[7].address, latitude: BANGALORE_PLACES[7].lat, longitude: BANGALORE_PLACES[7].lng, isDefault: 0 }
      ]
    });

    employees.push(user);
  }

  // 4. Seed 15 Commute Vehicles
  const vehicles = [];
  for (let i = 0; i < 15; i++) {
    const owner = employees[i % employees.length];
    const brand = CAR_BRANDS[i % CAR_BRANDS.length];
    const model = CAR_MODELS[i % CAR_MODELS.length];
    const regNum = `${REG_LOCATIONS[i % REG_LOCATIONS.length]}-${1000 + i}`;
    const fuelType = i % 3 === 0 ? 'EV' : i % 2 === 0 ? 'DIESEL' : 'PETROL';
    const type = i % 4 === 0 ? 'SUV' : 'CAR';

    const vehicle = await prisma.vehicle.create({
      data: {
        ownerId: owner.id,
        registrationNumber: regNum,
        manufacturer: brand,
        model,
        vehicleType: type,
        fuelType,
        color: COLORS[i % COLORS.length],
        year: 2022 + (i % 3),
        seatCapacity: 4,
        isVerified: true,
        status: 'ACTIVE',
        isDefault: true,
        vehicleImage: `/uploads/vehicles/default-${(i % 3) + 1}.jpg`
      }
    });
    vehicles.push(vehicle);
  }

  // 5. Seed 30 Rides
  const rides = [];
  const rideStatuses = ['Completed', 'Completed', 'Completed', 'Completed', 'Started', 'In Progress', 'Scheduled', 'Scheduled', 'Cancelled'];

  for (let i = 0; i < 30; i++) {
    const driver = employees[i % vehicles.length];
    const vehicle = vehicles[i % vehicles.length];
    const startLoc = BANGALORE_PLACES[i % 4];
    const endLoc = BANGALORE_PLACES[4 + (i % 4)];
    const status = rideStatuses[i % rideStatuses.length];

    const departureTime = new Date();
    departureTime.setDate(departureTime.getDate() - (i % 5) + 2); // dates in past, today, and future
    departureTime.setHours(8 + (i % 4), (i % 3) * 15, 0, 0);

    const formattedDepTime = departureTime.toISOString().slice(0, 19).replace('T', ' ');

    await prisma.$executeRawUnsafe(`
      INSERT INTO rides (driver_id, vehicle_id, pickup_name, pickup_location, destination_name, destination_location, departure_time, available_seats, fare_per_seat, distance_km, estimated_duration, ride_status, is_recurring, notes, created_at, updated_at)
      VALUES (${driver.id}, ${vehicle.id}, '${startLoc.name}', ST_GeomFromText('POINT(${startLoc.lat} ${startLoc.lng})'), '${endLoc.name}', ST_GeomFromText('POINT(${endLoc.lat} ${endLoc.lng})'), '${formattedDepTime}', 3, 150.00, 15.4, 45, '${status}', ${i % 3 === 0}, 'Regular office commute pool.', NOW(), NOW())
    `);

    const [lastRide] = await prisma.$queryRawUnsafe(`SELECT LAST_INSERT_ID() as id;`);
    const rideId = Number(lastRide.id);

    const r = await prisma.ride.findUnique({ where: { id: rideId } });
    rides.push(r);
  }

  // 6. Seed 45 Bookings
  const bookings = [];
  const bookingStatuses = ['COMPLETED', 'COMPLETED', 'ACCEPTED', 'PENDING', 'CANCELLED', 'REJECTED'];

  for (let i = 0; i < 45; i++) {
    const ride = rides[i % rides.length];
    const passenger = employees[(i + 5) % employees.length];
    const status = bookingStatuses[i % bookingStatuses.length];

    const booking = await prisma.booking.create({
      data: {
        rideId: ride.id,
        passengerId: passenger.id,
        driverId: ride.driverId,
        requestedSeats: 1,
        status
      }
    });
    bookings.push(booking);
  }

  // 7. Seed 20 Trips
  const trips = [];
  let tripCount = 0;
  for (let i = 0; i < bookings.length && tripCount < 20; i++) {
    const booking = bookings[i];
    const ride = rides.find(r => r.id === booking.rideId);
    if (!ride) continue;

    if (booking.status === 'COMPLETED' || booking.status === 'ACCEPTED') {
      const tripStatus = booking.status === 'COMPLETED' ? 'COMPLETED' : 'STARTED';
      
      const trip = await prisma.trip.create({
        data: {
          rideId: ride.id,
          bookingId: booking.id,
          driverId: ride.driverId,
          passengerId: booking.passengerId,
          status: tripStatus,
          startedAt: new Date(ride.departureTime),
          completedAt: booking.status === 'COMPLETED' ? new Date(new Date(ride.departureTime).getTime() + 45 * 60 * 1000) : null
        }
      });
      trips.push(trip);
      tripCount++;
    }
  }

  // 8. Seed Payments (40 Payments) & Wallet Transactions (60)
  let paymentCount = 0;
  let txnCount = 0;

  for (let i = 0; i < 40; i++) {
    const booking = bookings[i];
    const ride = rides.find(r => r.id === booking.rideId);
    if (!ride) continue;

    const payer = employees[i % employees.length];
    const receiver = employees[(i + 1) % employees.length];
    const status = i % 8 === 0 ? 'FAILED' : 'SUCCESS';
    const method = i % 4 === 0 ? 'UPI' : i % 3 === 0 ? 'RAZORPAY' : 'WALLET';

    const p = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        payerId: payer.id,
        receiverId: receiver.id,
        paymentMethod: method,
        amount: 150.00,
        status,
        paidAt: status === 'SUCCESS' ? new Date() : null
      }
    });
    paymentCount++;

    // Add Wallet Transaction Ledger (RECHARGE / PAYMENT / REFUND)
    const wallet = await prisma.wallet.findUnique({ where: { userId: payer.id } });
    if (wallet) {
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: payer.id,
          paymentId: p.id,
          transactionType: i % 5 === 0 ? 'RECHARGE' : 'RIDE_PAYMENT',
          amount: 150.00,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance.minus(150.00),
          referenceNo: `TXN-REF-${10000 + i}`,
          description: i % 5 === 0 ? 'In-app Razorpay Wallet Recharge' : 'Daily carpool pool share ride fare',
          status: 'SUCCESS'
        }
      });
      txnCount++;

      // Create a duplicate receive transaction for receiver
      const recWallet = await prisma.wallet.findUnique({ where: { userId: receiver.id } });
      if (recWallet) {
        await prisma.walletTransaction.create({
          data: {
            walletId: recWallet.id,
            userId: receiver.id,
            paymentId: p.id,
            transactionType: 'REWARD',
            amount: 150.00,
            balanceBefore: recWallet.balance,
            balanceAfter: recWallet.balance.plus(150.00),
            referenceNo: `TXN-REC-${20000 + i}`,
            description: 'Carpool ride credits received',
            status: 'SUCCESS'
          }
        });
        txnCount++;
      }
    }
  }

  // 9. Seed Chat History (200 Messages)
  let chatCount = 0;
  const chatScenarios = [
    { sender: 'passenger', text: 'Hi, are you on the way?' },
    { sender: 'driver', text: 'Yes, just crossed the main circle. Will arrive in 5 mins.' },
    { sender: 'passenger', text: 'Great, I am waiting outside Gate 3.' },
    { sender: 'driver', text: 'Excellent, look for the white Camry.' },
    { sender: 'passenger', text: 'Spotted. Coming inside.' }
  ];

  for (let i = 0; i < 40; i++) {
    const ride = rides[i % rides.length];
    const booking = bookings.find(b => b.rideId === ride.id);
    if (!booking) continue;

    for (let j = 0; j < 5; j++) {
      const scenario = chatScenarios[j % chatScenarios.length];
      const senderId = scenario.sender === 'driver' ? ride.driverId : booking.passengerId;

      await prisma.chatMessage.create({
        data: {
          rideId: ride.id,
          senderId,
          text: scenario.text,
          time: `09:${10 + j} AM`,
          isRead: true
        }
      });
      chatCount++;
    }
  }

  // 10. Seed Notifications (100 Notifications)
  let notificationCount = 0;
  const notifCategories = ['BOOKING', 'PAYMENT', 'RIDE', 'SYSTEM'];
  const notifTitles = [
    'Ride Request Booked',
    'Payment Transacted',
    'Carpool Pool Started',
    'Wallet Credited',
    'Route Config Modified'
  ];

  for (let i = 0; i < 100; i++) {
    const user = employees[i % employees.length];
    const category = notifCategories[i % notifCategories.length];
    const title = notifTitles[i % notifTitles.length];

    await prisma.notification.create({
      data: {
        userId: user.id,
        title,
        message: `Your commute transaction for carpooling route has been successfully processed under ${category}.`,
        category,
        type: i % 4 === 0 ? 'SUCCESS' : 'INFO',
        priority: 'MEDIUM',
        isRead: i % 2 === 0
      }
    });
    notificationCount++;
  }

  // 11. Seed Reports
  for (let i = 0; i < 5; i++) {
    const user = employees[i % employees.length];
    await prisma.report.create({
      data: {
        title: `Commute Analytics Report — Q${(i % 4) + 1} 2026`,
        type: i % 2 === 0 ? 'RIDE' : 'PAYMENT',
        generatedBy: user.id,
        fileType: i % 2 === 0 ? 'PDF' : 'CSV',
        status: 'COMPLETED',
        filters: JSON.stringify({ startDate: '2026-01-01', endDate: '2026-06-30' }),
        fileUrl: `/uploads/reports/sample_commute_${i+1}.pdf`
      }
    });
  }

  console.log('\n=============================================');
  console.log('🎉 SEEDING DEMO SUMMARY');
  console.log('=============================================');
  console.log(`Organizations Created : ${orgs.length}`);
  console.log(`Admins Created        : ${admins.length}`);
  console.log(`Employees Created     : ${employees.length}`);
  console.log(`Vehicles Created      : ${vehicles.length}`);
  console.log(`Rides Created         : ${rides.length}`);
  console.log(`Bookings Created      : ${bookings.length}`);
  console.log(`Trips Created         : ${trips.length}`);
  console.log(`Payments Created      : ${paymentCount}`);
  console.log(`Wallet Transactions   : ${txnCount}`);
  console.log(`Chat Messages         : ${chatCount}`);
  console.log(`Notifications         : ${notificationCount}`);
  console.log('Reports Generated     : Yes');
  console.log('Demo Data Ready       : Yes');
  console.log('=============================================\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
