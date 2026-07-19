import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import logger from './utils/logger.js';
import startReminderJob from './jobs/reminderJob.js';
import startEmailQueueJob from './jobs/emailQueueJob.js';

import { setIo, registerUserSocket, removeUserSocketBySocketId } from './utils/socketIo.js';
import prisma from './config/db.js';

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

  // Join a ride-specific chat & tracking room
  socket.on('join_ride_chat', async (rideId) => {
    if (rideId) {
      const room = `ride_chat_${rideId}`;
      socket.join(room);
      logger.info(`Socket ${socket.id} joined room ${room}`);

      try {
        const history = await prisma.chatMessage.findMany({
          where: { rideId: parseInt(rideId, 10) },
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, name: true } } },
        });
        socket.emit('chat_history', history.map(m => ({
          id: m.id,
          rideId: m.rideId,
          senderId: m.senderId,
          senderName: m.sender?.name || 'User',
          text: m.text,
          time: m.time,
          isRead: m.isRead,
          createdAt: m.createdAt,
        })));
      } catch (err) {
        logger.error(`Failed to fetch chat history for ride ${rideId}: ${err.message}`);
      }
    }
  });

  // Send message inside the ride chat room and save to DB
  socket.on('send_message', async (messageData) => {
    const { rideId, senderId, senderName, text, time } = messageData;
    if (!rideId || !senderId || !text) return;

    try {
      const savedMsg = await prisma.chatMessage.create({
        data: {
          rideId: parseInt(rideId, 10),
          senderId: parseInt(senderId, 10),
          text: text.trim(),
          time: time || new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        },
      });

      const broadcastPayload = {
        id: savedMsg.id,
        rideId: savedMsg.rideId,
        senderId: savedMsg.senderId,
        senderName: senderName || 'User',
        text: savedMsg.text,
        time: savedMsg.time,
        createdAt: savedMsg.createdAt,
      };

      io.to(`ride_chat_${rideId}`).emit('new_message', broadcastPayload);
      logger.info(`Message #${savedMsg.id} persisted & broadcast to ride_chat_${rideId}`);
    } catch (err) {
      logger.error(`Error persisting chat message: ${err.message}`);
    }
  });

  // Typing Indicators
  socket.on('typing', ({ rideId, userId, userName }) => {
    socket.to(`ride_chat_${rideId}`).emit('user_typing', { userId, userName });
  });

  socket.on('stop_typing', ({ rideId, userId }) => {
    socket.to(`ride_chat_${rideId}`).emit('user_stop_typing', { userId });
  });

  // Driver Live GPS Location Tracking Updates
  socket.on('driver_location_update', (locationData) => {
    const { rideId, lat, lng, speed, heading, eta } = locationData;
    io.to(`ride_chat_${rideId}`).emit('driver_location_update', {
      rideId,
      lat,
      lng,
      speed,
      heading,
      eta,
      timestamp: new Date().toISOString(),
    });
  });

  // Voice Call Signal Relay
  socket.on('voice_call_initiate', (callData) => {
    const { rideId, callerId, callerName } = callData;
    socket.to(`ride_chat_${rideId}`).emit('voice_call_incoming', { callerId, callerName, rideId });
  });

  socket.on('voice_call_signal', (signalData) => {
    const { rideId, signal } = signalData;
    socket.to(`ride_chat_${rideId}`).emit('voice_call_signal', { signal });
  });

  socket.on('voice_call_end', ({ rideId }) => {
    io.to(`ride_chat_${rideId}`).emit('voice_call_ended');
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
