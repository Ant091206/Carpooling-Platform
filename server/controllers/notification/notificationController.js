import notificationService from '../../services/notification/notificationService.js';
import preferenceService from '../../services/notification/preferenceService.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';

/**
 * Notification controller — all handlers are wrapped in asyncHandler
 */
const notificationController = {
  /**
   * GET /api/notifications
   * Returns paginated, filtered notifications for the authenticated user
   */
  getNotifications: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page, limit, type, category, isRead } = req.query;

    const result = await notificationService.getByUser(userId, {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      type,
      category,
      isRead
    });

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully.',
      data: result
    });
  }),

  /**
   * GET /api/notifications/unread-count
   */
  getUnreadCount: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { count }
    });
  }),

  /**
   * PATCH /api/notifications/:id/read
   */
  markRead: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await notificationService.markRead(userId, Number(id));

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: notification
    });
  }),

  /**
   * PATCH /api/notifications/read-all
   */
  markAllRead: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await notificationService.markAllRead(userId);

    res.status(200).json({
      success: true,
      message: `${result.count} notifications marked as read.`,
      data: result
    });
  }),

  /**
   * DELETE /api/notifications/:id
   */
  deleteNotification: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    await notificationService.deleteOne(userId, Number(id));

    res.status(200).json({
      success: true,
      message: 'Notification deleted.'
    });
  }),

  /**
   * DELETE /api/notifications
   */
  deleteAllNotifications: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await notificationService.deleteAll(userId);

    res.status(200).json({
      success: true,
      message: `${result.count} notifications deleted.`,
      data: result
    });
  }),

  /**
   * GET /api/notification-preferences
   */
  getPreferences: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const prefs = await preferenceService.getByUser(userId);

    res.status(200).json({
      success: true,
      data: prefs
    });
  }),

  /**
   * PUT /api/notification-preferences
   */
  updatePreferences: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const prefs = await preferenceService.update(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated.',
      data: prefs
    });
  })
};

export default notificationController;
