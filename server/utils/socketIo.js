let ioInstance = null;
const userSockets = new Map();

export const setIo = (io) => {
  ioInstance = io;
};

export const getIo = () => ioInstance;

export const registerUserSocket = (userId, socketId) => {
  userSockets.set(String(userId), socketId);
};

export const removeUserSocketBySocketId = (socketId) => {
  for (const [userId, sid] of userSockets.entries()) {
    if (sid === socketId) {
      userSockets.delete(userId);
      return userId;
    }
  }
  return null;
};

export const notifyUser = (userId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit(event, data);
  }
};

export const notifyRideRoom = (rideId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`ride_chat_${rideId}`).emit(event, data);
  }
};
