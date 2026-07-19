import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { successResponse } from '../utils/responseFormat.js';

class AdminController {
  /**
   * Get Admin dashboard metrics & stats
   * GET /api/admin/dashboard
   */
  async getDashboardStats(req, res, next) {
    try {
      // Total metrics counts
      const totalUsers = await prisma.user.count();
      const totalRides = await prisma.ride.count();
      const totalBookings = await prisma.booking.count();
      const totalOrgs = await prisma.organization.count();

      // Latest completed rides
      const recentRides = await prisma.ride.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { driver: { select: { name: true, email: true } } }
      });

      // User role distribution counts
      const employeeCount = await prisma.user.count({ where: { role: 'EMPLOYEE' } });
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });

      res.status(200).json(successResponse('Admin dashboard stats fetched successfully', {
        totalUsers,
        totalRides,
        totalBookings,
        totalOrgs,
        employeeCount,
        adminCount,
        recentRides
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all users
   * GET /api/admin/users
   */
  async getUsers(req, res, next) {
    try {
      const users = await prisma.user.findMany({
        include: { organizationObj: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      });
      const mapped = users.map(u => ({
        ...u,
        organization: u.organizationObj
      }));
      res.status(200).json(successResponse('Users fetched successfully', mapped));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user status (ACTIVE, SUSPENDED, INACTIVE)
   * PUT /api/admin/users/:id/status
   */
  async updateUserStatus(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      const { status } = req.body; // e.g. ACTIVE, SUSPENDED, INACTIVE

      if (!['ACTIVE', 'INACTIVE'].includes(status)) {
        throw new ApiError(400, 'Invalid status. Allowed values: ACTIVE, INACTIVE');
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { status }
      });

      res.status(200).json(successResponse('User status updated successfully', updatedUser));
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all rides
   * GET /api/admin/rides
   */
  async getRides(req, res, next) {
    try {
      const rides = await prisma.ride.findMany({
        include: { driver: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(successResponse('Rides logs fetched successfully', rides));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin cancels/deletes a ride
   * DELETE /api/admin/rides/:id
   */
  async deleteRide(req, res, next) {
    try {
      const rideId = parseInt(req.params.id, 10);
      await prisma.ride.update({
        where: { id: rideId },
        data: { rideStatus: 'Cancelled' }
      });
      res.status(200).json(successResponse('Ride cancelled by admin successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
