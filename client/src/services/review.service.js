import api from './api.js';

export const reviewService = {
  async createReview(reviewData) {
    // reviewData: { rideId, revieweeId, rating, review }
    const response = await api.post('/review', reviewData);
    return response.data.data;
  },

  async getUserStats(userId) {
    const response = await api.get(`/review/user/${userId}`);
    return response.data.data;
  },

  async getRideReviews(rideId) {
    const response = await api.get(`/review/ride/${rideId}`);
    return response.data.data;
  }
};

export default reviewService;
