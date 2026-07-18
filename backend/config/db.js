import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
// We assume logger is imported if available, but to prevent errors if logger doesn't exist in our branch, we'll use console.log as fallback or import it properly.
// The main branch had: import logger from '../utils/logger.js';
import logger from '../utils/logger.js';

dotenv.config();

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

// Immediately verify connection on startup
(async () => {
  try {
    await prisma.$connect();
    if (logger && logger.info) {
        logger.info('Prisma Client connected to MySQL database successfully.');
    } else {
        console.log('Prisma Client connected to MySQL database successfully.');
    }
  } catch (error) {
    if (logger && logger.error) {
        logger.error('Failed to connect to MySQL database via Prisma Client:', error);
    } else {
        console.error('Failed to connect to MySQL database via Prisma Client:', error);
    }
  }
})();

// Also expose mysql2 pool for Modules 4 & 5
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default prisma;
export { prisma, pool };
