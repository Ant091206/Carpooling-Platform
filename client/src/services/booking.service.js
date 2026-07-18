import api from './api.js';

export const bookingService = {
  async createBooking(rideId, requestedSeats) {
    const response = await api.post('/bookings', { rideId, requestedSeats });
    return response.data.data;
  },

  async listBookings(role) {
    // role: optional 'driver'
    const params = role ? { role } : {};
    const response = await api.get('/bookings', { params });
    return response.data.data;
  },

  async getBooking(id) {
    const response = await api.get(`/bookings/${id}`);
    return response.data.data;
  },

  async cancelBooking(id) {
    const response = await api.patch(`/bookings/${id}/cancel`);
    return response.data.data;
  },

  async acceptBooking(id) {
    const response = await api.patch(`/bookings/${id}/accept`);
    return response.data.data;
  },

  async rejectBooking(id) {
    const response = await api.patch(`/bookings/${id}/reject`);
    return response.data.data;
  }
};

export default bookingService;
