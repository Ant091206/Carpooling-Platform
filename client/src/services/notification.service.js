import api from './api.js';

export const notificationService = {
  async getNotifications(params) {
    const response = await api.get('/notifications', { params });
    return response.data.data;
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data.data;
  },

  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data.data;
  },

  async deleteNotification(id) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data.data;
  },

  async deleteAllNotifications() {
    const response = await api.delete('/notifications');
    return response.data.data;
  },

  async getPreferences() {
    const response = await api.get('/notification-preferences');
    return response.data.data;
  },

  async updatePreferences(data) {
    const response = await api.put('/notification-preferences', data);
    return response.data.data;
  }
};

export default notificationService;
