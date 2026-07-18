import analyticsService from '../../services/analytics/analyticsService.js';
import { successResponse } from '../../utils/responseHelper.js';
import ApiError from '../../utils/ApiError.js';

class AnalyticsController {
  async getDashboardSummary(req, res, next) {
    try {
      const data = await analyticsService.getDashboardSummary();
      const advanced = await analyticsService.getAdvancedMetrics();
      return successResponse(res, { ...data, ...advanced }, 'Dashboard analytics summary retrieved.');
    } catch (e) {
      next(e);
    }
  }

  async getRevenueStats(req, res, next) {
    try {
      const { period = 'daily' } = req.query;
      const data = await analyticsService.getRevenueStats(period);
      return successResponse(res, data, `Revenue stats retrieved for period: ${period}`);
    } catch (e) {
      next(e);
    }
  }

  async getRidesStats(req, res, next) {
    try {
      const { period = 'daily' } = req.query;
      const data = await analyticsService.getRidesStats(period);
      return successResponse(res, data, `Rides stats retrieved for period: ${period}`);
    } catch (e) {
      next(e);
    }
  }

  async getUsersStats(req, res, next) {
    try {
      const { period = 'daily' } = req.query;
      const data = await analyticsService.getUsersStats(period);
      return successResponse(res, data, `Users growth stats retrieved for period: ${period}`);
    } catch (e) {
      next(e);
    }
  }

  async getPaymentsStats(req, res, next) {
    try {
      const data = await analyticsService.getPaymentsStats();
      return successResponse(res, data, 'Payments stats retrieved.');
    } catch (e) {
      next(e);
    }
  }

  async getRatingsStats(req, res, next) {
    try {
      const data = await analyticsService.getRatingsStats();
      return successResponse(res, data, 'Ratings stats retrieved.');
    } catch (e) {
      next(e);
    }
  }
}

export default new AnalyticsController();
