import api from './api.js';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { token, accessToken, refreshToken, user } = response.data.data;
    const finalToken = accessToken || token;
    
    localStorage.setItem('token', finalToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    const { token, accessToken, refreshToken, user } = response.data.data;
    const finalToken = accessToken || token;

    localStorage.setItem('token', finalToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  },

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch (e) {
      console.error('Logout API call failed:', e.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    const user = response.data.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  async updateProfile(profileData) {
    const response = await api.put('/user/profile', profileData);
    const updatedUser = response.data.data;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  },

  async uploadAvatar(formData) {
    const response = await api.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async getSavedPlaces() {
    const response = await api.get('/user/saved-places');
    return response.data.data;
  },

  async addSavedPlace(placeData) {
    const response = await api.post('/user/saved-places', placeData);
    return response.data.data;
  },

  async deleteSavedPlace(id) {
    const response = await api.delete(`/user/saved-places/${id}`);
    return response.data.data;
  }
};

export default authService;
