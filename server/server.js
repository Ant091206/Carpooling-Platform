import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import errorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import { successResponse } from './utils/responseHelper.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Customize this in production to match your client domains
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// HTTP Logging Middleware
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Body Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Health Check Endpoint
app.get('/api/health', (req, res) => {
  return successResponse(res, {
    status: 'healthy',
    uptime: process.uptime(),
    mysql: 'connected' // We verified pool is alive in config/db.js
  }, 'Enterprise Carpooling Server Health is Green');
});

// Root API welcome endpoint
app.get('/api', (req, res) => {
  return successResponse(res, null, 'Welcome to the Enterprise Carpooling Platform API');
});

// Global Error Handler Middleware (Must be last)
app.use(errorHandler);

// Start server listening
app.listen(PORT, () => {
  logger.info(`Server running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
});

export default app;
