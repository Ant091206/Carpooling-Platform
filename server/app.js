import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import compression from 'compression';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import vehicleRoutes, { adminVehicleRouter } from './routes/vehicle/vehicleRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/admin/adminRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import tripController from './controllers/tripController.js';
import authMiddleware from './middleware/authMiddleware.js';
import historyRoutes from './routes/history/historyRoutes.js';
import reviewRoutes from './routes/review/reviewRoutes.js';
import notificationRoutes from './routes/notification/notificationRoutes.js';
import systemRoutes from './routes/system/systemRoutes.js';
import reportsRoutes from './routes/reports/reportsRoutes.js';
import analyticsRoutes from './routes/analytics/analyticsRoutes.js';
import matchingRoutes from './routes/matching/matchingRoutes.js';
import { apiLimiter, authLimiter, checkMaintenanceMode, sanitizeInput } from './middleware/securityMiddleware.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import ApiError from './utils/ApiError.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

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

// Compression & Security Middlewares
app.use(compression());
app.use(sanitizeInput);
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use(checkMaintenanceMode);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads
app.use('/uploads', express.static(process.env.UPLOAD_PATH || 'uploads/'));

// Module Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/vehicle', vehicleRoutes);
app.use('/vehicle', vehicleRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/admin/vehicles', adminVehicleRouter);
app.use('/api/rides', rideRoutes);
app.use('/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trips', tripRoutes);
app.get('/api/driver/trips', authMiddleware, tripController.getDriverTrips);
app.use('/api/history', historyRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notification-preferences', notificationRoutes);
app.use('/api', systemRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/matching', matchingRoutes);

// Swagger setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Enterprise Carpooling Platform API',
            version: '1.0.0',
            description: 'API documentation for the Carpooling Platform.',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
            },
        ],
    },
    apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
