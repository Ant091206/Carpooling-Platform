import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSocket } from './SocketContext.jsx';
import { useAuth } from './AuthContext.jsx';
import notificationService from '../services/notification.service.js';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const socket = useSocket();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
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
    if (isAuthenticated) {
      fetchUnreadCount();
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchUnreadCount, fetchNotifications]);

  // Real-time socket events
  useEffect(() => {
    if (socket && isAuthenticated) {
      const handleNewNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
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

      socket.on('notification:new', handleNewNotification);
      socket.on('notification:count', handleNotificationCount);
      socket.on('ride_notification', handleNewNotification);

      return () => {
        socket.off('notification:new', handleNewNotification);
        socket.off('notification:count', handleNotificationCount);
        socket.off('ride_notification', handleNewNotification);
      };
    }
  }, [socket, isAuthenticated]);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(item => (item.id === id ? { ...item, isRead: true } : item))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (socket) socket.emit('notification:read', { id });
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(item => item.id !== id));
      fetchUnreadCount();
      if (socket) socket.emit('notification:delete', { id });
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await notificationService.deleteAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      toast.error('Failed to delete all notifications');
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
    deleteNotification,
    deleteAllNotifications,
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
