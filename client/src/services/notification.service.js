<<<<<<< HEAD
import { notificationsAPI } from './api.js';

export const notificationService = {
  async getNotifications(params = {}) {
    const response = await notificationsAPI.getAll(params);
=======
import api from './api.js';

export const notificationService = {
  async getNotifications(params) {
    const response = await api.get('/notifications', { params });
>>>>>>> 7a57a61ce29369380aa6e4b39459103a5ff866b9
    return response.data.data;
  },

  async getUnreadCount() {
<<<<<<< HEAD
    const response = await notificationsAPI.getUnreadCount();
    return response.data.data.count;
  },

  async markAsRead(id) {
    const response = await notificationsAPI.markRead(id);
    return response.data.data;
  },

  async markAllRead() {
    const response = await notificationsAPI.markAllRead();
=======
    const response = await api.get('/notifications/unread-count');
    return response.data.data;
  },

  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
>>>>>>> 7a57a61ce29369380aa6e4b39459103a5ff866b9
    return response.data.data;
  },

  async deleteNotification(id) {
<<<<<<< HEAD
    const response = await notificationsAPI.delete(id);
    return response.data;
  },

  async deleteAll() {
    const response = await notificationsAPI.deleteAll();
    return response.data;
  },

  async getPreferences() {
    const response = await notificationsAPI.getPreferences();
=======
    const response = await api.delete(`/notifications/${id}`);
    return response.data.data;
  },

  async deleteAllNotifications() {
    const response = await api.delete('/notifications');
    return response.data.data;
  },

  async getPreferences() {
    const response = await api.get('/notification-preferences');
>>>>>>> 7a57a61ce29369380aa6e4b39459103a5ff866b9
    return response.data.data;
  },

  async updatePreferences(data) {
<<<<<<< HEAD
    const response = await notificationsAPI.updatePreferences(data);
=======
    const response = await api.put('/notification-preferences', data);
>>>>>>> 7a57a61ce29369380aa6e4b39459103a5ff866b9
    return response.data.data;
  }
};

export default notificationService;
