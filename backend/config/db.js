import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

// Immediately verify connection on startup
(async () => {
  try {
    await prisma.$connect();
    logger.info('Prisma Client connected to MySQL database successfully.');
  } catch (error) {
    logger.error('Failed to connect to MySQL database via Prisma Client:', error);
  }
})();

export default prisma;
export { prisma };
