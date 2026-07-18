import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'enterprise_carpool',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Immediately verify connection on module parse
(async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('MySQL Database Connection Pool initialized successfully.');
    connection.release();
  } catch (error) {
    logger.error('Failed to establish database connection pool:', error);
  }
})();

export default pool;
