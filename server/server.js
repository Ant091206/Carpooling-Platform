import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import logger from './utils/logger.js';
import startReminderJob from './jobs/reminderJob.js';
import startEmailQueueJob from './jobs/emailQueueJob.js';

import { setIo, registerUserSocket, removeUserSocketBySocketId } from './utils/socketIo.js';

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  }
});

// Set global socket instance
setIo(io);

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // Join a user-specific room for individual notifications
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      registerUserSocket(userId, socket.id);
      logger.info(`User ${userId} joined room user_${userId}`);
    }
  });

  // Join a ride-specific chat room
  socket.on('join_ride_chat', (rideId) => {
    if (rideId) {
      socket.join(`ride_chat_${rideId}`);
      logger.info(`Socket ${socket.id} joined chat room ride_chat_${rideId}`);
    }
  });

  // Route messages inside the room
  socket.on('send_message', (messageData) => {
    const { rideId } = messageData;
    io.to(`ride_chat_${rideId}`).emit('new_message', messageData);
    logger.info(`Message broadcast to ride_chat_${rideId}`);
  });

  // Notification-specific socket events
  socket.on('notification:read', (data) => {
    logger.info(`User marked notification ${data?.id} as read via socket`);
  });

  socket.on('notification:delete', (data) => {
    logger.info(`User deleted notification ${data?.id} via socket`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
    removeUserSocketBySocketId(socket.id);
  });
});

const server = httpServer.listen(PORT, () => {
  if (logger && logger.info) {
      logger.info(`Server successfully started on port ${PORT} in [${process.env.NODE_ENV || 'development'}] environment.`);
  } else {
      console.log(`Server successfully started on port ${PORT} in [${process.env.NODE_ENV || 'development'}] environment.`);
  }

  // Start cron jobs
  startReminderJob();
  startEmailQueueJob();
});

// Graceful shutdown handling
const shutdown = (signal) => {
  if (logger && logger.warn) {
      logger.warn(`Received signal: ${signal}. Shutting down server gracefully...`);
  } else {
      console.warn(`Received signal: ${signal}. Shutting down server gracefully...`);
  }
  server.close(() => {
    if (logger && logger.info) {
        logger.info('HTTP server closed.');
    } else {
        console.info('HTTP server closed.');
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default io;
