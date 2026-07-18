import prisma from '../../config/db.js';

/**
 * Notification preferences CRUD service
 */
const preferenceService = {
  /**
   * Get or create default preferences for a user
   */
  async getByUser(userId) {
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: { userId }
      });
    }

    return prefs;
  },

  /**
   * Update user preferences
   */
  async update(userId, data) {
    // Ensure preferences exist first
    await this.getByUser(userId);

    const allowedFields = [
      'emailEnabled', 'pushEnabled', 'inAppEnabled',
      'bookingNotifications', 'paymentNotifications',
      'rideReminderNotifications', 'systemNotifications',
      'marketingNotifications'
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = Boolean(data[field]);
      }
    }

    return prisma.notificationPreference.update({
      where: { userId },
      data: updateData
    });
  },

  /**
   * Check if a user wants notifications for a specific category
   */
  async shouldNotify(userId, category) {
    const prefs = await this.getByUser(userId);

    if (!prefs.inAppEnabled) return false;

    const categoryMap = {
      BOOKING: prefs.bookingNotifications,
      PAYMENT: prefs.paymentNotifications,
      RIDE: prefs.rideReminderNotifications,
      REMINDER: prefs.rideReminderNotifications,
      SYSTEM: prefs.systemNotifications,
      PROFILE: true,
    };

    return categoryMap[category] !== false;
  },

  /**
   * Check if a user wants email for a specific category
   */
  async shouldEmail(userId, category) {
    const prefs = await this.getByUser(userId);

    if (!prefs.emailEnabled) return false;

    const categoryMap = {
      BOOKING: prefs.bookingNotifications,
      PAYMENT: prefs.paymentNotifications,
      RIDE: prefs.rideReminderNotifications,
      REMINDER: prefs.rideReminderNotifications,
      SYSTEM: prefs.systemNotifications,
      PROFILE: true,
    };

    return categoryMap[category] !== false;
  }
};

export default preferenceService;
