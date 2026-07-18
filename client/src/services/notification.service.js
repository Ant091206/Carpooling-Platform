import { notificationsAPI } from './api.js';

export const notificationService = {
  async getNotifications(params = {}) {
    const response = await notificationsAPI.getAll(params);
    return response.data.data;
  },

  async getUnreadCount() {
    const response = await notificationsAPI.getUnreadCount();
    // Return unified count object structure or number depending on caller
    const count = response.data.data.count ?? response.data.data;
    return { count };
  },

  async markAsRead(id) {
    const response = await notificationsAPI.markRead(id);
    return response.data.data;
  },

  async markAllRead() {
    const response = await notificationsAPI.markAllRead();
    return response.data.data;
  },

  async markAllAsRead() {
    const response = await notificationsAPI.markAllRead();
    return response.data.data;
  },

  async deleteNotification(id) {
    const response = await notificationsAPI.delete(id);
    return response.data;
  },

  async deleteAll() {
    const response = await notificationsAPI.deleteAll();
    return response.data;
  },

  async deleteAllNotifications() {
    const response = await notificationsAPI.deleteAll();
    return response.data;
  },

  async getPreferences() {
    const response = await notificationsAPI.getPreferences();
    return response.data.data;
  },

  async updatePreferences(data) {
    const response = await notificationsAPI.updatePreferences(data);
    return response.data.data;
  }
};

export default notificationService;
