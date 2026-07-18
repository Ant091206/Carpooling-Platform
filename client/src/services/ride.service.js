import api from './api.js';

export const rideService = {
  async publishRide(rideData) {
    // Expected structure: { vehicle_id, pickup_name, pickup_lng, pickup_lat, destination_name, dest_lng, dest_lat, departure_time, available_seats, fare_per_seat, notes }
    const response = await api.post('/rides', rideData);
    return response.data.data;
  },

  async getMyRides() {
    const response = await api.get('/rides/my');
    return response.data.data;
  },

  async getRideById(id) {
    const response = await api.get(`/rides/${id}`);
    return response.data.data;
  },

  async updateRide(id, data) {
    const response = await api.put(`/rides/${id}`, data);
    return response.data.data;
  },

  async deleteRide(id) {
    const response = await api.delete(`/rides/${id}`);
    return response.data.data;
  },

  async startRide(id) {
    const response = await api.patch(`/rides/${id}/start`);
    return response.data.data;
  },

  async completeRide(id) {
    const response = await api.patch(`/rides/${id}/complete`);
    return response.data.data;
  },

  async cancelRide(id) {
    const response = await api.patch(`/rides/${id}/cancel`);
    return response.data.data;
  },

  async searchRides(params) {
    // params: { pickup, destination, date }
    const response = await api.get('/rides', { params });
    return response.data.data;
  }
};

export default rideService;
