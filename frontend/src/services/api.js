import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = res.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    toast.error(error.response?.data?.message || 'An unexpected error occurred');
    return Promise.reject(error);
  }
);

export const carpoolAPI = {
  // Auth
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),

  // User / Profile
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  uploadAvatar: (formData) => api.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getSavedPlaces: () => api.get('/user/saved-places'),
  createSavedPlace: (data) => api.post('/user/saved-places', data),
  updateSavedPlace: (id, data) => api.put(`/user/saved-places/${id}`, data),
  deleteSavedPlace: (id) => api.delete(`/user/saved-places/${id}`),

  // Rides (Module 6)
  findRides: (params) => api.get('/rides', { params }),
  getMyRides: () => api.get('/rides/my'),
  getRideById: (id) => api.get(`/rides/${id}`),
  offerRide: (data) => api.post('/rides', data),
  updateRide: (id, data) => api.put(`/rides/${id}`, data),
  deleteRide: (id) => api.delete(`/rides/${id}`),
  startRide: (id) => api.patch(`/rides/${id}/start`),
  completeRide: (id) => api.patch(`/rides/${id}/complete`),
  cancelRide: (id) => api.patch(`/rides/${id}/cancel`),

  // Trips (Module 7)
  getTrips: () => api.get('/trips'),
  getTripById: (id) => api.get(`/trips/${id}`),
  getMyBookings: () => api.get('/bookings/my'),
  bookRide: (data) => api.post('/bookings', data),
  cancelBooking: (id) => api.patch(`/bookings/${id}/cancel`),
  getBookingById: (id) => api.get(`/bookings/${id}`),

  // Vehicle
  getVehicles: () => api.get('/vehicle'),
  getVehicleById: (id) => api.get(`/vehicle/${id}`),
  addVehicle: (data) => api.post('/vehicle', data),
  updateVehicle: (id, data) => api.put(`/vehicle/${id}`, data),
  deleteVehicle: (id) => api.delete(`/vehicle/${id}`),
  setDefaultVehicle: (id) => api.patch(`/vehicle/default/${id}`),

  // Wallet
  getWallet: () => api.get('/wallet'),
  getTransactions: () => api.get('/wallet/transactions'),
  topUpWallet: (data) => api.post('/wallet/recharge', data),
};

export default api;
