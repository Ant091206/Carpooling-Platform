import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import ApiError from './utils/ApiError.js';

dotenv.config();

const app = express();

// Security Configuration
app.use(helmet());
app.use(cors({
  origin: true, // Auto-reflects the request origin to allow credentials
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Cookie Parser Middleware
app.use(cookieParser());

// Morgan HTTP request logging (directed to custom logger stream)
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(process.env.UPLOAD_PATH || 'uploads/'));

// Module Routes Mount
app.use('/api/auth', authRoutes);

// Base Health Check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service health is Green',
    timestamp: new Date().toISOString()
  });
});

// Capture unmatched routes (404 Handler)
app.use((req, res, next) => {
  next(new ApiError(404, `Cannot find route: ${req.method} ${req.originalUrl}`));
});

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
export { app };
