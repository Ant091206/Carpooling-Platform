import { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext.jsx';
import notificationService from '../services/notification.service.js';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch persisted notifications
    setNotifications(notificationService.getNotifications());
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNotification = (data) => {
        // data: { type, message, booking }
        const newList = notificationService.saveNotification({
          type: data.type,
          message: data.message
        });
        setNotifications(newList);

        // Notify client visually
        toast.success(data.message, {
          icon: '🔔',
          duration: 6000,
          style: {
            borderLeft: '4px solid #059669'
          }
        });
      };

      socket.on('ride_notification', handleNotification);

      return () => {
        socket.off('ride_notification', handleNotification);
      };
    }
  }, [socket]);

  const markAsRead = (id) => {
    const newList = notificationService.markAsRead(id);
    setNotifications(newList);
  };

  const clearAll = () => {
    const newList = notificationService.clearAll();
    setNotifications(newList);
  };

  const value = {
    notifications,
    markAsRead,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used inside a NotificationProvider wrapper');
  }
  return context;
};
