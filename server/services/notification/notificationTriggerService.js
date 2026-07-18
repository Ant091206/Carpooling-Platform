import notificationService from './notificationService.js';
import preferenceService from './preferenceService.js';
import emailQueueService from './emailQueueService.js';
import { notifyUser } from '../../utils/socketIo.js';
import logger from '../../utils/logger.js';

/**
 * Automatic notification trigger service.
 * Call these functions from controllers/services when events happen.
 * Each checks user preferences before creating the notification.
 */
const triggerService = {
  /**
   * Internal helper — create notification + emit socket + optionally enqueue email
   */
  async _dispatch({ userId, title, message, type, category, priority, actionUrl, metadata, emailTemplate, emailData }) {
    try {
      // Check if user wants in-app notifications for this category
      const shouldNotify = await preferenceService.shouldNotify(userId, category);

      let notification = null;
      if (shouldNotify) {
        notification = await notificationService.create({
          userId, title, message, type, category, priority, actionUrl, metadata
        });

        // Emit real-time via Socket.io
        notifyUser(userId, 'notification:new', notification);

        // Emit updated unread count
        const unreadCount = await notificationService.getUnreadCount(userId);
        notifyUser(userId, 'notification:count', { count: unreadCount });
      }

      // Check if user wants email
      if (emailTemplate) {
        const shouldEmail = await preferenceService.shouldEmail(userId, category);
        if (shouldEmail && emailData?.recipient) {
          await emailQueueService.sendDirect({
            userId,
            recipient: emailData.recipient,
            template: emailTemplate,
            templateData: emailData
          });
        }
      }

      return notification;
    } catch (error) {
      logger.error(`Notification trigger error [${category}/${type}]: ${error.message}`);
      return null; // Don't crash the calling code
    }
  },

  // ─── Booking notifications ─────────────────────────────────────────

  async notifyBookingCreated({ userId, userName, userEmail, rideDetails, bookingId }) {
    return this._dispatch({
      userId,
      title: 'Booking Confirmed',
      message: `Your booking for the ride from ${rideDetails.pickup} to ${rideDetails.destination} has been confirmed.`,
      type: 'SUCCESS',
      category: 'BOOKING',
      priority: 'HIGH',
      actionUrl: `/my-rides`,
      metadata: { bookingId, rideId: rideDetails.rideId },
      emailTemplate: 'rideBooked',
      emailData: { userName, recipient: userEmail, ...rideDetails }
    });
  },

  async notifyBookingAccepted({ userId, userName, userEmail, rideDetails, bookingId }) {
    return this._dispatch({
      userId,
      title: 'Booking Accepted',
      message: `Your booking request has been accepted by the driver.`,
      type: 'SUCCESS',
      category: 'BOOKING',
      priority: 'HIGH',
      actionUrl: `/my-rides`,
      metadata: { bookingId, rideId: rideDetails.rideId }
    });
  },

  async notifyBookingRejected({ userId, userName, userEmail, rideDetails, bookingId }) {
    return this._dispatch({
      userId,
      title: 'Booking Rejected',
      message: `Your booking request has been rejected.`,
      type: 'WARNING',
      category: 'BOOKING',
      priority: 'MEDIUM',
      actionUrl: `/find-ride`,
      metadata: { bookingId, rideId: rideDetails.rideId }
    });
  },

  async notifyBookingCancelled({ userId, userName, userEmail, rideDetails, bookingId, reason }) {
    return this._dispatch({
      userId,
      title: 'Booking Cancelled',
      message: `A booking for the ride from ${rideDetails.pickup} to ${rideDetails.destination} has been cancelled.`,
      type: 'WARNING',
      category: 'BOOKING',
      priority: 'MEDIUM',
      actionUrl: `/my-rides`,
      metadata: { bookingId, rideId: rideDetails.rideId, reason },
      emailTemplate: 'rideCancelled',
      emailData: { userName, recipient: userEmail, ...rideDetails, reason }
    });
  },

  // ─── Ride notifications ───────────────────────────────────────────

  async notifyRideStarted({ userId, rideDetails }) {
    return this._dispatch({
      userId,
      title: 'Ride Started',
      message: `Your ride from ${rideDetails.pickup} has started. Have a safe journey!`,
      type: 'INFO',
      category: 'RIDE',
      priority: 'HIGH',
      actionUrl: `/my-trips`,
      metadata: { rideId: rideDetails.rideId }
    });
  },

  async notifyRideCompleted({ userId, rideDetails }) {
    return this._dispatch({
      userId,
      title: 'Ride Completed',
      message: `Your ride to ${rideDetails.destination} has been completed. Don't forget to leave a review!`,
      type: 'SUCCESS',
      category: 'RIDE',
      priority: 'MEDIUM',
      actionUrl: `/ride-history`,
      metadata: { rideId: rideDetails.rideId }
    });
  },

  async notifyRideCancelled({ userId, userName, userEmail, rideDetails, reason }) {
    return this._dispatch({
      userId,
      title: 'Ride Cancelled',
      message: `The ride from ${rideDetails.pickup} to ${rideDetails.destination} has been cancelled.`,
      type: 'ERROR',
      category: 'RIDE',
      priority: 'HIGH',
      actionUrl: `/find-ride`,
      metadata: { rideId: rideDetails.rideId, reason },
      emailTemplate: 'rideCancelled',
      emailData: { userName, recipient: userEmail, ...rideDetails, reason }
    });
  },

  async notifyPassengerJoined({ userId, passengerName, rideDetails }) {
    return this._dispatch({
      userId,
      title: 'New Passenger',
      message: `${passengerName} has joined your ride from ${rideDetails.pickup} to ${rideDetails.destination}.`,
      type: 'INFO',
      category: 'RIDE',
      priority: 'MEDIUM',
      actionUrl: `/my-rides`,
      metadata: { rideId: rideDetails.rideId }
    });
  },

  // ─── Payment notifications ────────────────────────────────────────

  async notifyPaymentSuccess({ userId, userName, userEmail, paymentDetails }) {
    return this._dispatch({
      userId,
      title: 'Payment Successful',
      message: `Your payment of ₹${paymentDetails.amount} has been processed successfully.`,
      type: 'SUCCESS',
      category: 'PAYMENT',
      priority: 'MEDIUM',
      actionUrl: `/wallet/transactions`,
      metadata: { paymentId: paymentDetails.paymentId, amount: paymentDetails.amount },
      emailTemplate: 'paymentSuccess',
      emailData: { userName, recipient: userEmail, ...paymentDetails }
    });
  },

  async notifyPaymentFailed({ userId, userName, userEmail, paymentDetails }) {
    return this._dispatch({
      userId,
      title: 'Payment Failed',
      message: `Your payment of ₹${paymentDetails.amount} has failed. Please try again.`,
      type: 'ERROR',
      category: 'PAYMENT',
      priority: 'HIGH',
      actionUrl: `/wallet`,
      metadata: { paymentId: paymentDetails.paymentId, amount: paymentDetails.amount },
      emailTemplate: 'paymentFailed',
      emailData: { userName, recipient: userEmail, ...paymentDetails }
    });
  },

  // ─── Ride reminders ───────────────────────────────────────────────

  async notifyRideReminder({ userId, userName, userEmail, rideDetails, minutesBefore }) {
    return this._dispatch({
      userId,
      title: `Ride in ${minutesBefore} minutes`,
      message: `Your ride from ${rideDetails.pickup} to ${rideDetails.destination} departs in ${minutesBefore} minutes.`,
      type: 'WARNING',
      category: 'REMINDER',
      priority: minutesBefore <= 5 ? 'URGENT' : 'HIGH',
      actionUrl: `/my-trips`,
      metadata: { rideId: rideDetails.rideId, minutesBefore },
      emailTemplate: 'rideReminder',
      emailData: { userName, recipient: userEmail, ...rideDetails, minutesBefore }
    });
  },

  // ─── Onboarding notifications ─────────────────────────────────────

  async notifyWelcome({ userId, userName, userEmail }) {
    return this._dispatch({
      userId,
      title: 'Welcome to EnterprisePool!',
      message: `Hello ${userName}, your account was created successfully. Welcome to our carpooling platform!`,
      type: 'SUCCESS',
      category: 'PROFILE',
      priority: 'MEDIUM',
      actionUrl: '/dashboard',
      emailTemplate: 'welcome',
      emailData: { userName, recipient: userEmail }
    });
  },

  // ─── Profile notifications ────────────────────────────────────────

  async notifyProfileUpdated({ userId }) {
    return this._dispatch({
      userId,
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully.',
      type: 'INFO',
      category: 'PROFILE',
      priority: 'LOW',
      actionUrl: `/profile-setup`,
      metadata: {}
    });
  },

  async notifyPasswordChanged({ userId, userName, userEmail }) {
    return this._dispatch({
      userId,
      title: 'Password Changed',
      message: 'Your password has been changed. If this wasn\'t you, contact support immediately.',
      type: 'WARNING',
      category: 'PROFILE',
      priority: 'URGENT',
      actionUrl: `/settings`,
      metadata: {},
      emailTemplate: 'passwordChanged',
      emailData: { userName, recipient: userEmail }
    });
  },

  // ─── System notifications ─────────────────────────────────────────

  async notifySystem({ userId, title, message, priority = 'MEDIUM', actionUrl = null }) {
    return this._dispatch({
      userId,
      title,
      message,
      type: 'INFO',
      category: 'SYSTEM',
      priority,
      actionUrl,
      metadata: {}
    });
  }
};

export default triggerService;
