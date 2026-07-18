import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database initial state...');

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
