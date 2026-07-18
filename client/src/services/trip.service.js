import api from './api.js';

export const tripService = {
  async getPassengerTrips() {
    const response = await api.get('/trips');
    return response.data.data;
  },

  async getUpcomingTrips() {
    const response = await api.get('/trips/upcoming');
    return response.data.data;
  },

  async getOngoingTrips() {
    const response = await api.get('/trips/ongoing');
    return response.data.data;
  },

  async getCompletedTrips() {
    const response = await api.get('/trips/completed');
    return response.data.data;
  },

  async getTrip(id) {
    const response = await api.get(`/trips/${id}`);
    return response.data.data;
  },

  async getDriverTrips() {
    const response = await api.get('/driver/trips');
    return response.data.data;
  },

  async startTrip(id) {
    const response = await api.patch(`/trips/${id}/start`);
    return response.data.data;
  },

  async updateTripProgress(id) {
    const response = await api.patch(`/trips/${id}/progress`);
    return response.data.data;
  },

  async completeTrip(id) {
    const response = await api.patch(`/trips/${id}/complete`);
    return response.data.data;
  }
};

export default tripService;
