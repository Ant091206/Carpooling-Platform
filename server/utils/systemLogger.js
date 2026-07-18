import fs from 'fs';
import path from 'path';
import prisma from '../config/db.js';
import logger from './logger.js';

const logDir = path.resolve('logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = path.join(logDir, 'system.log');

/**
 * Append log entry to local file
 */
const writeToFile = (level, moduleName, message, details = null) => {
  const timestamp = new Date().toISOString();
  const detailStr = details ? ` | Details: ${JSON.stringify(details)}` : '';
  const logLine = `[${timestamp}] [${level.toUpperCase()}] [${moduleName}] ${message}${detailStr}\n`;

  fs.appendFile(logFilePath, logLine, (err) => {
    if (err) {
      console.error('Failed to write to system log file:', err);
    }
  });
};

/**
 * System Logger — persists to both file and MySQL database
 */
export const systemLogger = {
  async log({ level = 'INFO', module: moduleName = 'SYSTEM', message, details = null, userId = null, req = null }) {
    // 1. Output to file and winston logger
    writeToFile(level, moduleName, message, details);
    if (logger && logger.info) {
      logger.info(`[${moduleName}] ${message}`);
    }

    // 2. Extract request metadata if req provided
    let ip = null;
    let userAgent = null;
    if (req) {
      ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip;
      userAgent = req.headers['user-agent']?.substring(0, 255);
      if (!userId && req.user?.id) {
        userId = req.user.id;
      }
    }

    // 3. Persist to DB asynchronously
    try {
      await prisma.systemLog.create({
        data: {
          level,
          module: moduleName,
          message: String(message),
          details: details ? JSON.parse(JSON.stringify(details)) : null,
          userId: userId ? Number(userId) : null,
          ip: ip ? String(ip) : null,
          userAgent: userAgent ? String(userAgent) : null
        }
      });
    } catch (dbError) {
      console.error('SystemLogger DB write error:', dbError.message);
    }
  },

  info(moduleName, message, details = null, req = null) {
    return this.log({ level: 'INFO', module: moduleName, message, details, req });
  },

  warn(moduleName, message, details = null, req = null) {
    return this.log({ level: 'WARN', module: moduleName, message, details, req });
  },

  error(moduleName, message, details = null, req = null) {
    return this.log({ level: 'ERROR', module: moduleName, message, details, req });
  },

  auth(message, details = null, req = null) {
    return this.info('AUTH', message, details, req);
  },

  payment(message, details = null, req = null) {
    return this.info('PAYMENT', message, details, req);
  },

  ride(message, details = null, req = null) {
    return this.info('RIDE', message, details, req);
  },

  booking(message, details = null, req = null) {
    return this.info('BOOKING', message, details, req);
  },

  notification(message, details = null, req = null) {
    return this.info('NOTIFICATION', message, details, req);
  },

  admin(message, details = null, req = null) {
    return this.info('ADMIN', message, details, req);
  }
};

export default systemLogger;
