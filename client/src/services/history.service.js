import api from './api.js';

export const historyService = {
  async getMyRides() {
    const response = await api.get('/history/my-rides');
    return response.data.data;
  },

  async getById(rideId) {
    const response = await api.get(`/history/${rideId}`);
    return response.data.data;
  }
};

export default historyService;
