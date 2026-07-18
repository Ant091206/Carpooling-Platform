import app from './app.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server successfully started on port ${PORT} in [${process.env.NODE_ENV || 'development'}] environment.`);
});

// Graceful shutdown handling
const shutdown = (signal) => {
  logger.warn(`Received signal: ${signal}. Shutting down server gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
