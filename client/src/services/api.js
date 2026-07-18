import axios from 'axios';

// ─── Single Axios Instance ────────────────────────────────────────────────────
// This is the ONE AND ONLY axios instance for the entire application.
// Every service file must import from this module.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Token-refresh queue (prevents multiple simultaneous refresh calls)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ─── Request Interceptor — inject Bearer token ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — token refresh + auto-logout ──────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          { refreshToken }
        );

        const { token: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('token', newAccessToken);
        if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ─── Named API collections ────────────────────────────────────────────────────
// These are thin wrappers over the single axios instance above.
// All pages and services should import from here or from a service file that
// itself imports `api` from this module.

export const ridesAPI = {
  search:     (params) => api.get('/rides', { params }),
  getById:    (id)     => api.get(`/rides/${id}`),
  getMyRides: ()       => api.get('/rides/my'),
  offer:      (data)   => api.post('/rides', data),
  update:     (id, d)  => api.put(`/rides/${id}`, d),
  remove:     (id)     => api.delete(`/rides/${id}`),
  start:      (id)     => api.patch(`/rides/${id}/start`),
  complete:   (id)     => api.patch(`/rides/${id}/complete`),
  cancel:     (id)     => api.patch(`/rides/${id}/cancel`),
};

export const bookingsAPI = {
  book:           (data) => api.post('/bookings', data),
  getMyBookings:  ()     => api.get('/bookings'),
  getById:        (id)   => api.get(`/bookings/${id}`),
  accept:         (id)   => api.patch(`/bookings/${id}/accept`),
  reject:         (id)   => api.patch(`/bookings/${id}/reject`),
  cancel:         (id)   => api.patch(`/bookings/${id}/cancel`),
};

export const walletAPI = {
  get:                ()       => api.get('/wallet'),
  create:             ()       => api.post('/wallet/create'),
  recharge:           (data)   => api.post('/wallet/recharge', data),
  topup:              (data)   => api.post('/wallet/recharge', data),
  transactions:       (params) => api.get('/wallet/transactions', { params }),
  getTransactionById: (id)     => api.get(`/wallet/transactions/${id}`),
};

export const paymentsAPI = {
  create:         (data)      => api.post('/payments', data),
  getAll:         (params)    => api.get('/payments', { params }),
  getById:        (id)        => api.get(`/payments/${id}`),
  verifyRazorpay: (id, data)  => api.post(`/payments/${id}/verify-razorpay`, data),
  refund:         (id)        => api.post(`/payments/${id}/refund`),
};

export const adminAPI = {
  getDashboard:     ()           => api.get('/admin/dashboard'),
  getUsers:         ()           => api.get('/admin/users'),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  getRides:         ()           => api.get('/admin/rides'),
  cancelRide:       (id)         => api.delete(`/admin/rides/${id}`),
};

export const historyAPI = {
  getMyRides: ()       => api.get('/history/my-rides'),
  getById:    (rideId) => api.get(`/history/${rideId}`),
};

export const reviewsAPI = {
  create:     (data)   => api.post('/review', data),
  getByUser:  (userId) => api.get(`/review/user/${userId}`),
  getByRide:  (rideId) => api.get(`/review/ride/${rideId}`),
};

export const notificationsAPI = {
  getAll:         (params) => api.get('/notifications', { params }),
  getUnreadCount: ()       => api.get('/notifications/unread-count'),
  markRead:       (id)     => api.patch(`/notifications/${id}/read`),
  markAllRead:    ()       => api.patch('/notifications/read-all'),
  delete:         (id)     => api.delete(`/notifications/${id}`),
  deleteAll:      ()       => api.delete('/notifications'),
  getPreferences: ()       => api.get('/notifications/preferences'),
  updatePreferences: (d)   => api.put('/notifications/preferences', d),
};

export const systemAPI = {
  getHealth:      ()       => api.get('/health'),
  getStatus:      ()       => api.get('/status'),
  getInfo:        ()       => api.get('/system/info'),
  getLogs:        (params) => api.get('/system/logs', { params }),
  getSettings:    ()       => api.get('/system/settings'),
  updateSettings: (data)   => api.put('/system/settings', data),
  getBackup:      ()       => api.get('/system/backup'),
  restoreBackup:  (data)   => api.post('/system/restore', data),
};

