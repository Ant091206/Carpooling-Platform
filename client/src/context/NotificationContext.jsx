import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSocket } from './SocketContext.jsx';
import { useAuth } from './AuthContext.jsx';
import notificationService from '../services/notification.service.js';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const socket = useSocket();
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async (params = {}, append = false) => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(params);
      if (append) {
        setNotifications(prev => [...prev, ...data.notifications]);
      } else {
        setNotifications(data.notifications);
      }
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUnreadCount();
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user, fetchUnreadCount, fetchNotifications]);

  // Real-time socket events
  useEffect(() => {
    if (socket && isAuthenticated && user) {
      const handleNewNotification = (notification) => {
        setNotifications(prev => {
          if (prev.some(n => n.id === notification.id)) return prev;
          return [notification, ...prev].slice(0, 50);
        });
        setUnreadCount(prev => prev + 1);

        const categoryIcons = {
          BOOKING: '🚗',
          PAYMENT: '💰',
          RIDE: '🚘',
          REMINDER: '⏰',
          SYSTEM: '🔔',
          PROFILE: '👤',
        };

        toast.success(notification.message, {
          icon: categoryIcons[notification.category] || '🔔',
          duration: 6000,
          style: {
            borderLeft: '4px solid #059669',
            borderRadius: '16px',
            padding: '12px 20px',
          }
        });
      };

      const handleNotificationCount = (data) => {
        if (data && typeof data.count === 'number') {
          setUnreadCount(data.count);
        }
      };

      const handleReadNotification = (data) => {
        setNotifications((prev) =>
          prev.map((item) => (item.id === data.id ? { ...item, isRead: true } : item))
        );
      };

      const handleDeleteNotification = (data) => {
        setNotifications((prev) => prev.filter((item) => item.id !== data.id));
      };

      socket.on('notification:new', handleNewNotification);
      socket.on('notification:count', handleNotificationCount);
      socket.on('notification:read', handleReadNotification);
      socket.on('notification:delete', handleDeleteNotification);
      socket.on('ride_notification', handleNewNotification);

      return () => {
        socket.off('notification:new', handleNewNotification);
        socket.off('notification:count', handleNotificationCount);
        socket.off('notification:read', handleReadNotification);
        socket.off('notification:delete', handleDeleteNotification);
        socket.off('ride_notification', handleNewNotification);
      };
    }
  }, [socket, isAuthenticated, user]);

  const markAsRead = async (id) => {
    try {
      setNotifications(prev =>
        prev.map(item => (item.id === id ? { ...item, isRead: true } : item))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      await notificationService.markAsRead(id);
      if (socket) socket.emit('notification:read', { id });
    } catch (error) {
      console.error('Failed to mark read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
      setUnreadCount(0);
      await notificationService.markAllRead();
    } catch (error) {
      console.error('Failed to mark all read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const target = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(item => item.id !== id));
      if (target && !target.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      await notificationService.deleteNotification(id);
      if (socket) socket.emit('notification:delete', { id });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      setNotifications([]);
      setUnreadCount(0);
      await notificationService.deleteAll();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    pagination,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllRead,
    markAllAsRead: markAllRead,
    deleteNotification,
    deleteAllNotifications,
    clearAll: deleteAllNotifications
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
    throw new Error('useNotifications must be used inside a NotificationProvider');
  }
  return context;
};
