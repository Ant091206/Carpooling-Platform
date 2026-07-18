import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database initial state...');

  // 1. Seed Google Corp
  const googleOrg = await prisma.organization.upsert({
    where: { companyCode: 'GOOG123' },
    update: {
      name: 'Google Corp',
      email: 'admin@google.com',
      phone: '1-800-555-0199',
      address: '1600 Amphitheatre Pkwy, Mountain View, CA',
      status: 'ACTIVE'
    },
    create: {
      name: 'Google Corp',
      companyCode: 'GOOG123',
      email: 'admin@google.com',
      phone: '1-800-555-0199',
      address: '1600 Amphitheatre Pkwy, Mountain View, CA',
      status: 'ACTIVE'
    }
  });
  console.log('Seeded organization:', googleOrg.name, `(${googleOrg.companyCode})`);

  // 2. Seed DEMOCORP
  const demoOrg = await prisma.organization.upsert({
    where: { companyCode: 'DEMOCORP' },
    update: {
      name: 'Demo Corp',
      email: 'admin@democorp.com',
      phone: '1-800-555-0211',
      address: '100 Demo Boulevard, Austin, TX',
      status: 'ACTIVE'
    },
    create: {
      name: 'Demo Corp',
      companyCode: 'DEMOCORP',
      email: 'admin@democorp.com',
      phone: '1-800-555-0211',
      address: '100 Demo Boulevard, Austin, TX',
      status: 'ACTIVE'
    }
  });
  console.log('Seeded organization:', demoOrg.name, `(${demoOrg.companyCode})`);

  // 3. Seed TECHINC
  const techOrg = await prisma.organization.upsert({
    where: { companyCode: 'TECHINC' },
    update: {
      name: 'Tech Inc',
      email: 'admin@techinc.com',
      phone: '1-800-555-0322',
      address: '500 Tech Avenue, San Francisco, CA',
      status: 'ACTIVE'
    },
    create: {
      name: 'Tech Inc',
      companyCode: 'TECHINC',
      email: 'admin@techinc.com',
      phone: '1-800-555-0322',
      address: '500 Tech Avenue, San Francisco, CA',
      status: 'ACTIVE'
    }
  });
  console.log('Seeded organization:', techOrg.name, `(${techOrg.companyCode})`);

  // 4. Seed Admin account for DEMOCORP
  const adminPasswordHash = await bcrypt.hash('Password123!', 10);
  const demoAdmin = await prisma.user.upsert({
    where: { email: 'admin@democorp.com' },
    update: {
      firstName: 'Demo',
      lastName: 'Admin',
      name: 'Demo Admin',
      passwordHash: adminPasswordHash,
      status: 'ACTIVE',
      role: 'ADMIN'
    },
    create: {
      firstName: 'Demo',
      lastName: 'Admin',
      name: 'Demo Admin',
      employeeId: 'ADMIN-001',
      email: 'admin@democorp.com',
      passwordHash: adminPasswordHash,
      phone: '555-0211',
      organization: 'Demo Corp',
      organizationId: demoOrg.id,
      role: 'ADMIN',
      status: 'ACTIVE',
      isVerified: true
    }
  });
  console.log('Seeded admin account:', demoAdmin.email);

  // 5. Seed Admin account for TECHINC
  const techAdmin = await prisma.user.upsert({
    where: { email: 'admin@techinc.com' },
    update: {
      firstName: 'Tech',
      lastName: 'Admin',
      name: 'Tech Admin',
      passwordHash: adminPasswordHash,
      status: 'ACTIVE',
      role: 'ADMIN'
    },
    create: {
      firstName: 'Tech',
      lastName: 'Admin',
      name: 'Tech Admin',
      employeeId: 'ADMIN-001',
      email: 'admin@techinc.com',
      passwordHash: adminPasswordHash,
      phone: '555-0322',
      organization: 'Tech Inc',
      organizationId: techOrg.id,
      role: 'ADMIN',
      status: 'ACTIVE',
      isVerified: true
    }
  });
  console.log('Seeded admin account:', techAdmin.email);
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
