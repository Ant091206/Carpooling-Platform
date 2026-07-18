import api from './api.js';

export const adminService = {
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard');
    return response.data.data;
  },

  async getUsers() {
    const response = await api.get('/admin/users');
    return response.data.data;
  },

  async updateUserStatus(id, status) {
    const response = await api.put(`/admin/users/${id}/status`, { status });
    return response.data.data;
  },

  async getRides() {
    const response = await api.get('/admin/rides');
    return response.data.data;
  },

  async cancelRide(id) {
    const response = await api.delete(`/admin/rides/${id}`);
    return response.data.data;
  }
};

export default adminService;
