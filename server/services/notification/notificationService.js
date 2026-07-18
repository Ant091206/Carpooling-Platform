import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';

/**
 * Core CRUD service for Notification model
 */
const notificationService = {
  /**
   * Create a new notification
   */
  async create({ userId, title, message, type = 'INFO', category = 'SYSTEM', priority = 'MEDIUM', actionUrl = null, metadata = null }) {
    return prisma.notification.create({
      data: { userId, title, message, type, category, priority, actionUrl, metadata }
    });
  },

  /**
   * Get paginated, filtered notifications for a user
   */
  async getByUser(userId, { page = 1, limit = 20, type, category, isRead } = {}) {
    const skip = (page - 1) * limit;

    const where = { userId };
    if (type) where.type = type;
    if (category) where.category = category;
    if (isRead !== undefined && isRead !== null) {
      where.isRead = isRead === 'true' || isRead === true;
    }

    const [notifications, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          category: true,
          priority: true,
          isRead: true,
          actionUrl: true,
          metadata: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      prisma.notification.count({ where })
    ]);

    return {
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    return prisma.notification.count({
      where: { userId, isRead: false }
    });
  },

  /**
   * Mark a single notification as read
   */
  async markRead(userId, notificationId) {
    const notification = await prisma.notification.findFirst({
      where: { id: Number(notificationId), userId }
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found.');
    }

    return prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true }
    });
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllRead(userId) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    return { count: result.count };
  },

  /**
   * Delete a single notification (ownership-validated)
   */
  async deleteOne(userId, notificationId) {
    const notification = await prisma.notification.findFirst({
      where: { id: Number(notificationId), userId }
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found.');
    }

    return prisma.notification.delete({ where: { id: notification.id } });
  },

  /**
   * Delete all notifications for a user
   */
  async deleteAll(userId) {
    const result = await prisma.notification.deleteMany({ where: { userId } });
    return { count: result.count };
  }
};

export default notificationService;
