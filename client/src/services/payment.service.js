import api from './api.js';

export const paymentService = {
  async createOrder(bookingId) {
    const response = await api.post('/payments/order', { bookingId });
    return response.data.data;
  },

  async verifyPayment(paymentData) {
    // paymentData: { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, isMock }
    const response = await api.post('/payments/verify', paymentData);
    return response.data.data;
  }
};

export default paymentService;
