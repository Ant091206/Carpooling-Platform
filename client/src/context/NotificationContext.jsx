import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSocket } from './SocketContext.jsx';
import { useAuth } from './AuthContext.jsx';
import notificationService from '../services/notification.service.js';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const socket = useSocket();
<<<<<<< HEAD
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
=======
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const fetchNotifications = useCallback(async (params = {}, append = false) => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const queryParams = { page: 1, limit: 10, ...params };
      const data = await notificationService.getNotifications(queryParams);
      
      const newList = data.list || [];
      if (append) {
        setNotifications((prev) => {
          // Prevent duplicates when appending
          const existingIds = new Set(prev.map(item => item.id));
          const uniqueNewList = newList.filter(item => !existingIds.has(item.id));
          return [...prev, ...uniqueNewList];
        });
      } else {
        setNotifications(newList);
      }

      if (data.pagination) {
        setPagination({
          page: Number(data.pagination.page),
          limit: Number(data.pagination.limit),
          total: Number(data.pagination.total),
          totalPages: Number(data.pagination.totalPages)
        });
      }
    } catch (error) {
      console.error('Failed to load notifications:', error.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user, fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    if (socket && isAuthenticated && user) {
      const handleNewNotification = (notif) => {
        setNotifications((prev) => {
          // Avoid duplicate check
          if (prev.some(item => item.id === notif.id)) return prev;
          return [notif, ...prev].slice(0, 50);
        });
        setUnreadCount((prev) => prev + 1);

        // Display beautiful notification toast
        let toastIcon = '🔔';
        if (notif.type === 'SUCCESS') toastIcon = '✅';
        if (notif.type === 'WARNING') toastIcon = '⚠️';
        if (notif.type === 'ERROR') toastIcon = '❌';

        toast(notif.message, {
          icon: toastIcon,
          duration: 6000,
          style: {
            borderLeft: '4px solid #059669',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            color: '#1f2937'
>>>>>>> 7a57a61ce29369380aa6e4b39459103a5ff866b9
          }
        });
      };

<<<<<<< HEAD
      const handleNotificationCount = (data) => {
=======
      const handleCountUpdate = (data) => {
>>>>>>> 7a57a61ce29369380aa6e4b39459103a5ff866b9
        if (data && typeof data.count === 'number') {
          setUnreadCount(data.count);
        }
      };

<<<<<<< HEAD
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
=======
      const handleReadNotification = (data) => {
        setNotifications((prev) =>
          prev.map((item) => (item.id === data.id ? { ...item, isRead: true } : item))
        );
      };

      const handleDeleteNotification = (data) => {
        setNotifications((prev) => prev.filter((item) => item.id !== data.id));
      };

      socket.on('notification:new', handleNewNotification);
      socket.on('notification:count', handleCountUpdate);
      socket.on('notification:read', handleReadNotification);
      socket.on('notification:delete', handleDeleteNotification);

      // Support old module 4/5 trigger events if triggered by teammates
      const handleLegacyNotification = (data) => {
        toast.info(data.message || 'Notification received');
        fetchNotifications();
        fetchUnreadCount();
      };
      socket.on('ride_notification', handleLegacyNotification);

      return () => {
        socket.off('notification:new', handleNewNotification);
        socket.off('notification:count', handleCountUpdate);
        socket.off('notification:read', handleReadNotification);
        socket.off('notification:delete', handleDeleteNotification);
        socket.off('ride_notification', handleLegacyNotification);
      };
    }
  }, [socket, isAuthenticated, user, fetchNotifications, fetchUnreadCount]);

  const markAsRead = async (id) => {
    try {
      // Optimistic updates
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await notificationService.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark read:', error.message);
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);

      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all read:', error.message);
      fetchNotifications();
      fetchUnreadCount();
>>>>>>> 7a57a61ce29369380aa6e4b39459103a5ff866b9
    }
  };

  const deleteNotification = async (id) => {
    try {
<<<<<<< HEAD
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
=======
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      await notificationService.deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error.message);
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const clearAll = async () => {
    try {
      setNotifications([]);
      setUnreadCount(0);

      await notificationService.deleteAllNotifications();
    } catch (error) {
      console.error('Failed to clear notifications:', error.message);
      fetchNotifications();
      fetchUnreadCount();
>>>>>>> 7a57a61ce29369380aa6e4b39459103a5ff866b9
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
<<<<<<< HEAD
    markAllRead,
    deleteNotification,
    deleteAllNotifications,
=======
    markAllRead: markAllAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications: clearAll,
    clearAll
>>>>>>> 7a57a61ce29369380aa6e4b39459103a5ff866b9
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
