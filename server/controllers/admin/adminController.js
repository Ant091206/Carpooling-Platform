import adminService from '../../services/admin/adminService.js';
import { successResponse } from '../../utils/responseFormat.js';

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const data = await adminService.getDashboard();
      res.status(200).json(successResponse('Admin dashboard retrieved successfully.', data));
    } catch (err) {
      next(err);
    }
  }

  async getUsers(req, res, next) {
    try {
      const { page, limit, search, role, status, sortBy, sortOrder } = req.query;
      const data = await adminService.getUsers({ page, limit, search, role, status, sortBy, sortOrder });
      res.status(200).json(successResponse('Users retrieved successfully.', data));
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await adminService.getUserById(req.params.id);
      res.status(200).json(successResponse('User details retrieved successfully.', user));
    } catch (err) {
      next(err);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      const { status } = req.body;
      const user = await adminService.updateUserStatus(req.user.id, req.params.id, status);
      res.status(200).json(successResponse('User status updated successfully.', user));
    } catch (err) {
      next(err);
    }
  }

  async getRides(req, res, next) {
    try {
      const { page, limit, search, status, startDate, endDate } = req.query;
      const data = await adminService.getRides({ page, limit, search, status, startDate, endDate });
      res.status(200).json(successResponse('Rides retrieved successfully.', data));
    } catch (err) {
      next(err);
    }
  }

  async getRideById(req, res, next) {
    try {
      const ride = await adminService.getRideById(req.params.id);
      res.status(200).json(successResponse('Ride details retrieved successfully.', ride));
    } catch (err) {
      next(err);
    }
  }

  async getPayments(req, res, next) {
    try {
      const { page, limit, method, status } = req.query;
      const data = await adminService.getPayments({ page, limit, method, status });
      res.status(200).json(successResponse('Payments retrieved successfully.', data));
    } catch (err) {
      next(err);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const data = await adminService.getAnalytics();
      res.status(200).json(successResponse('Analytics data retrieved successfully.', data));
    } catch (err) {
      next(err);
    }
  }

  async getAnnouncements(req, res, next) {
    try {
      const announcements = await adminService.getAnnouncements();
      res.status(200).json(successResponse('Announcements retrieved successfully.', announcements));
    } catch (err) {
      next(err);
    }
  }

  async createAnnouncement(req, res, next) {
    try {
      const announcement = await adminService.createAnnouncement(req.user.id, req.body);
      res.status(201).json(successResponse('Announcement created successfully.', announcement));
    } catch (err) {
      next(err);
    }
  }

  async updateAnnouncement(req, res, next) {
    try {
      const announcement = await adminService.updateAnnouncement(req.user.id, req.params.id, req.body);
      res.status(200).json(successResponse('Announcement updated successfully.', announcement));
    } catch (err) {
      next(err);
    }
  }

  async deleteAnnouncement(req, res, next) {
    try {
      const result = await adminService.deleteAnnouncement(req.user.id, req.params.id);
      res.status(200).json(successResponse(result.message, null));
    } catch (err) {
      next(err);
    }
  }

  async getActivityLogs(req, res, next) {
    try {
      const { page, limit } = req.query;
      const data = await adminService.getActivityLogs({ page, limit });
      res.status(200).json(successResponse('Activity logs retrieved successfully.', data));
    } catch (err) {
      next(err);
    }
  }

  async getOrganizations(req, res, next) {
    try {
      const { search, status, page, limit } = req.query;
      const data = await adminService.getOrganizations({ search, status, page, limit });
      res.status(200).json(successResponse('Organizations retrieved successfully.', data));
    } catch (err) {
      next(err);
    }
  }

  async createOrganization(req, res, next) {
    try {
      const org = await adminService.createOrganization(req.user.id, req.body);
      res.status(201).json(successResponse('Organization created successfully.', org));
    } catch (err) {
      next(err);
    }
  }

  async updateOrganization(req, res, next) {
    try {
      const org = await adminService.updateOrganization(req.user.id, req.params.id, req.body);
      res.status(200).json(successResponse('Organization updated successfully.', org));
    } catch (err) {
      next(err);
    }
  }

  async getCostConfig(req, res, next) {
    try {
      const config = await adminService.getCostConfig();
      res.status(200).json(successResponse('Cost configuration retrieved successfully.', config));
    } catch (err) {
      next(err);
    }
  }

  async updateCostConfig(req, res, next) {
    try {
      const config = await adminService.updateCostConfig(req.user.id, req.body);
      res.status(200).json(successResponse('Cost configuration updated successfully.', config));
    } catch (err) {
      next(err);
    }
  }

  async verifyVehicle(req, res, next) {
    try {
      const vehicle = await adminService.verifyVehicle(req.user.id, req.params.id, req.body);
      res.status(200).json(successResponse('Vehicle verification status updated successfully.', vehicle));
    } catch (err) {
      next(err);
    }
  }

  async getParticipationMetrics(req, res, next) {
    try {
      const metrics = await adminService.getParticipationMetrics();
      res.status(200).json(successResponse('Participation metrics retrieved successfully.', metrics));
    } catch (err) {
      next(err);
    }
  }
}

export default new AdminController();
