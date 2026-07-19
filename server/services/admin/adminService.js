import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';

class AdminService {
  /**
   * Log administrative activity automatically
   */
  async logActivity(adminId, action, module, description) {
    try {
      await prisma.adminActivity.create({
        data: {
          adminId: adminId ? parseInt(adminId, 10) : null,
          action,
          module,
          description,
        },
      });
    } catch (err) {
      console.error('Failed to record admin activity log:', err.message);
    }
  }

  /**
   * GET /api/admin/dashboard
   */
  async getDashboard() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      totalDrivers,
      totalPassengers,
      totalRides,
      completedRides,
      cancelledRides,
      activeRides,
      successfulPayments,
      monthlyPayments,
      dailyPayments,
      recentActivities,
      recentAnnouncements,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'EMPLOYEE', vehicles: { some: {} } } }),
      prisma.user.count({ where: { role: 'EMPLOYEE' } }),
      prisma.ride.count(),
      prisma.ride.count({ where: { rideStatus: 'Completed' } }),
      prisma.ride.count({ where: { rideStatus: 'Cancelled' } }),
      prisma.ride.count({ where: { rideStatus: { in: ['Scheduled', 'Started', 'InProgress'] } } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESS' },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESS', createdAt: { gte: monthStart } },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESS', createdAt: { gte: todayStart } },
      }),
      prisma.adminActivity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { id: true, name: true, email: true } } },
      }),
      prisma.announcement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalRevenue   = parseFloat(successfulPayments._sum.amount || 0);
    const monthlyRevenue = parseFloat(monthlyPayments._sum.amount || 0);
    const dailyRevenue   = parseFloat(dailyPayments._sum.amount || 0);

    return {
      overview: {
        totalUsers,
        activeUsers,
        totalDrivers,
        totalPassengers,
        totalRides,
        completedRides,
        cancelledRides,
        activeRides,
        totalRevenue,
        monthlyRevenue,
        dailyRevenue,
      },
      recentActivities,
      recentAnnouncements,
    };
  }

  /**
   * GET /api/admin/users
   */
  async getUsers({ page = 1, limit = 20, search = '', role, status, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const pageNum  = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip     = (pageNum - 1) * limitNum;

    const where = {};

    if (search) {
      where.OR = [
        { name:       { contains: search } },
        { email:      { contains: search } },
        { employeeId: { contains: search } },
        { department: { contains: search } },
      ];
    }

    if (role)   where.role   = role;
    if (status) where.status = status;

    const orderBy = { [sortBy]: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc' };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          organizationObj: { select: { id: true, name: true, companyCode: true } },
          _count: {
            select: {
              vehicles: true,
              rides: true,
              passengerBookings: true,
              driverBookings: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const mappedUsers = users.map(u => ({
      ...u,
      organization: u.organizationObj,
    }));

    return {
      users: mappedUsers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * GET /api/admin/users/:id
   */
  async getUserById(userId) {
    const id = parseInt(userId, 10);
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        organizationObj: true,
        vehicles: true,
        rides: { take: 5, orderBy: { createdAt: 'desc' } },
        passengerBookings: { take: 5, orderBy: { createdAt: 'desc' }, include: { ride: true } },
        wallet: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    user.organization = user.organizationObj;
    return user;
  }

  /**
   * PATCH /api/admin/users/:id/status
   */
  async updateUserStatus(adminId, userId, status) {
    const id = parseInt(userId, 10);
    const validStatuses = ['ACTIVE', 'INACTIVE'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Allowed: ${validStatuses.join(', ')}`);
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'User not found.');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
    });

    await this.logActivity(
      adminId,
      'USER_STATUS_CHANGE',
      'Users',
      `Updated user status for ${existing.email} (ID #${id}) from ${existing.status} to ${status}`
    );

    return updated;
  }

  /**
   * GET /api/admin/rides
   */
  async getRides({ page = 1, limit = 20, search = '', status, startDate, endDate }) {
    const pageNum  = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip     = (pageNum - 1) * limitNum;

    const where = {};

    if (search) {
      where.OR = [
        { pickupName:      { contains: search } },
        { destinationName: { contains: search } },
        { driver: { name:  { contains: search } } },
      ];
    }

    if (status) {
      where.rideStatus = status;
    }

    if (startDate || endDate) {
      where.departureTime = {};
      if (startDate) where.departureTime.gte = new Date(startDate);
      if (endDate)   where.departureTime.lte = new Date(endDate);
    }

    const [rides, total] = await Promise.all([
      prisma.ride.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          driver:  { select: { id: true, name: true, email: true, phone: true } },
          vehicle: { select: { id: true, model: true, registrationNumber: true, color: true } },
          _count:  { select: { bookings: true } },
        },
      }),
      prisma.ride.count({ where }),
    ]);

    return {
      rides: rides.map(r => ({
        ...r,
        vehicle: r.vehicle ? {
          id: r.vehicle.id,
          model: r.vehicle.model,
          plateNumber: r.vehicle.registrationNumber,
          color: r.vehicle.color
        } : null
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * GET /api/admin/rides/:id
   */
  async getRideById(rideId) {
    const id = parseInt(rideId, 10);
    const ride = await prisma.ride.findUnique({
      where: { id },
      include: {
        driver: { select: { id: true, name: true, email: true, phone: true } },
        vehicle: true,
        bookings: {
          include: { passenger: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!ride) {
      throw new ApiError(404, 'Ride not found.');
    }

    return ride;
  }

  /**
   * GET /api/admin/payments
   */
  async getPayments({ page = 1, limit = 20, method, status }) {
    const pageNum  = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip     = (pageNum - 1) * limitNum;

    const where = {};
    if (method) where.paymentMethod = method;
    if (status) where.status        = status;

    const [payments, total, totalRevenue, totalRefunded] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          payer:    { select: { id: true, name: true, email: true } },
          receiver: { select: { id: true, name: true, email: true } },
          booking:  { select: { id: true, rideId: true } },
        },
      }),
      prisma.payment.count({ where }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESS' },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'REFUNDED' },
      }),
    ]);

    return {
      payments,
      stats: {
        totalRevenue:  parseFloat(totalRevenue._sum.amount || 0),
        totalRefunded: parseFloat(totalRefunded._sum.amount || 0),
        transactionCount: total,
      },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * GET /api/admin/analytics
   */
  async getAnalytics() {
    const now = new Date();
    const last30Days = new Date();
    last30Days.setDate(now.getDate() - 30);

    const [
      ridesByStatus,
      paymentsByMethod,
      recentUsers,
      recentRides,
      recentPayments,
    ] = await Promise.all([
      prisma.ride.groupBy({
        by: ['rideStatus'],
        _count: { _all: true },
      }),
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        _sum: { amount: true },
        where: { status: 'SUCCESS' },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: last30Days } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.ride.findMany({
        where: { createdAt: { gte: last30Days } },
        select: { createdAt: true, rideStatus: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.payment.findMany({
        where: { createdAt: { gte: last30Days }, status: 'SUCCESS' },
        select: { createdAt: true, amount: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Format distributions
    const rideStatusDistribution = ridesByStatus.map((r) => ({
      status: r.rideStatus,
      count:  r._count._all,
    }));

    const revenueByMethod = paymentsByMethod.map((p) => ({
      method: p.paymentMethod,
      amount: parseFloat(p._sum.amount || 0),
    }));

    // Group daily metrics for last 30 days
    const dailyMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap[dateStr] = { date: dateStr, rides: 0, users: 0, revenue: 0 };
    }

    recentUsers.forEach((u) => {
      const dateStr = u.createdAt.toISOString().split('T')[0];
      if (dailyMap[dateStr]) dailyMap[dateStr].users += 1;
    });

    recentRides.forEach((r) => {
      const dateStr = r.createdAt.toISOString().split('T')[0];
      if (dailyMap[dateStr]) dailyMap[dateStr].rides += 1;
    });

    recentPayments.forEach((p) => {
      const dateStr = p.createdAt.toISOString().split('T')[0];
      if (dailyMap[dateStr]) dailyMap[dateStr].revenue += parseFloat(p.amount);
    });

    const timeSeries = Object.values(dailyMap);

    return {
      rideStatusDistribution,
      revenueByMethod,
      timeSeries,
    };
  }

  /**
   * Announcements CRUD
   */
  async getAnnouncements() {
    return await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAnnouncement(adminId, { title, message, isActive = true }) {
    if (!title || !message) {
      throw new ApiError(400, 'Title and message are required.');
    }

    const announcement = await prisma.announcement.create({
      data: { title, message, isActive },
    });

    await this.logActivity(
      adminId,
      'ANNOUNCEMENT_CREATE',
      'Announcements',
      `Created announcement: "${title}"`
    );

    return announcement;
  }

  async updateAnnouncement(adminId, id, data) {
    const annId = parseInt(id, 10);
    const existing = await prisma.announcement.findUnique({ where: { id: annId } });
    if (!existing) {
      throw new ApiError(404, 'Announcement not found.');
    }

    const updated = await prisma.announcement.update({
      where: { id: annId },
      data,
    });

    await this.logActivity(
      adminId,
      'ANNOUNCEMENT_UPDATE',
      'Announcements',
      `Updated announcement #${annId}: "${updated.title}"`
    );

    return updated;
  }

  async deleteAnnouncement(adminId, id) {
    const annId = parseInt(id, 10);
    const existing = await prisma.announcement.findUnique({ where: { id: annId } });
    if (!existing) {
      throw new ApiError(404, 'Announcement not found.');
    }

    await prisma.announcement.delete({ where: { id: annId } });

    await this.logActivity(
      adminId,
      'ANNOUNCEMENT_DELETE',
      'Announcements',
      `Deleted announcement #${annId}: "${existing.title}"`
    );

    return { message: 'Announcement deleted successfully.' };
  }

  /**
   * Activity logs list
   */
  async getActivityLogs({ page = 1, limit = 30 }) {
    const pageNum  = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip     = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      prisma.adminActivity.findMany({
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { id: true, name: true, email: true } } },
      }),
      prisma.adminActivity.count(),
    ]);

    return {
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Organization CRUD
   */
  async getOrganizations({ search = '', status, page = 1, limit = 20 }) {
    const pageNum  = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip     = (pageNum - 1) * limitNum;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { companyCode: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (status) where.status = status;

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { users: true } } },
      }),
      prisma.organization.count({ where }),
    ]);

    return {
      organizations,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async createOrganization(adminId, { name, companyCode, email, phone, address, website }) {
    if (!name || !companyCode || !email) {
      throw new ApiError(400, 'Name, company code, and email are required.');
    }

    const existing = await prisma.organization.findFirst({
      where: { OR: [{ companyCode }, { email }] },
    });
    if (existing) {
      throw new ApiError(400, 'Organization with this company code or email already exists.');
    }

    const org = await prisma.organization.create({
      data: { name, companyCode, email, phone, address, website, status: 'ACTIVE' },
    });

    await this.logActivity(adminId, 'ORGANIZATION_CREATE', 'Organization', `Created org ${name} (${companyCode})`);
    return org;
  }

  async updateOrganization(adminId, id, data) {
    const orgId = parseInt(id, 10);
    const existing = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!existing) throw new ApiError(404, 'Organization not found.');

    const updated = await prisma.organization.update({
      where: { id: orgId },
      data,
    });

    await this.logActivity(adminId, 'ORGANIZATION_UPDATE', 'Organization', `Updated org #${orgId} (${updated.name})`);
    return updated;
  }

  /**
   * Fuel & Travel Cost Configuration
   */
  async getCostConfig() {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: { in: ['fuel_cost_per_liter', 'fuel_efficiency_baseline', 'travel_cost_per_km', 'platform_fee_percent'] },
      },
    });

    const configMap = {};
    settings.forEach((s) => {
      configMap[s.key] = s.value;
    });

    return {
      fuelCostPerLiter: parseFloat(configMap['fuel_cost_per_liter'] || '102.50'),
      fuelEfficiencyBaseline: parseFloat(configMap['fuel_efficiency_baseline'] || '15.0'),
      travelCostPerKm: parseFloat(configMap['travel_cost_per_km'] || '8.50'),
      platformFeePercent: parseFloat(configMap['platform_fee_percent'] || '5.00'),
    };
  }

  async updateCostConfig(adminId, { fuelCostPerLiter, fuelEfficiencyBaseline, travelCostPerKm, platformFeePercent }) {
    const configs = [
      { key: 'fuel_cost_per_liter', value: String(fuelCostPerLiter || 102.5), description: 'Fuel Price per Liter in INR' },
      { key: 'fuel_efficiency_baseline', value: String(fuelEfficiencyBaseline || 15.0), description: 'Baseline Fuel Efficiency in KM/L' },
      { key: 'travel_cost_per_km', value: String(travelCostPerKm || 8.5), description: 'Base Travel Cost per KM in INR' },
      { key: 'platform_fee_percent', value: String(platformFeePercent || 5.0), description: 'Platform fee percentage' },
    ];

    for (const cfg of configs) {
      await prisma.systemSetting.upsert({
        where: { key: cfg.key },
        update: { value: cfg.value },
        create: { key: cfg.key, value: cfg.value, description: cfg.description, isPublic: true },
      });
    }

    await this.logActivity(adminId, 'COST_CONFIG_UPDATE', 'Settings', 'Updated fuel and travel cost configuration');
    return this.getCostConfig();
  }

  /**
   * Vehicle Document & Verification
   */
  async verifyVehicle(adminId, vehicleId, { isVerified, status }) {
    const id = parseInt(vehicleId, 10);
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new ApiError(404, 'Vehicle not found.');

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        isVerified: typeof isVerified === 'boolean' ? isVerified : vehicle.isVerified,
        status: status || vehicle.status,
      },
    });

    await this.logActivity(
      adminId,
      'VEHICLE_VERIFICATION',
      'Vehicles',
      `Updated vehicle ${vehicle.registrationNumber} status: verified=${updated.isVerified}, status=${updated.status}`
    );

    return updated;
  }

  /**
   * Employee Participation Dashboard
   */
  async getParticipationMetrics() {
    const [
      totalEmployees,
      totalDrivers,
      totalPassengers,
      completedTrips,
      totalRides,
      totalOrgs,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'EMPLOYEE' } }),
      prisma.user.count({ where: { role: 'EMPLOYEE', vehicles: { some: {} } } }),
      prisma.user.count({ where: { role: 'EMPLOYEE', passengerBookings: { some: {} } } }),
      prisma.ride.count({ where: { rideStatus: 'Completed' } }),
      prisma.ride.count(),
      prisma.organization.count({ where: { status: 'ACTIVE' } }),
    ]);

    const participationRate = totalEmployees > 0 ? (((totalDrivers + totalPassengers) / totalEmployees) * 100).toFixed(1) : '0';
    const completionRate = totalRides > 0 ? ((completedTrips / totalRides) * 100).toFixed(1) : '0';

    return {
      totalEmployees,
      totalDrivers,
      totalPassengers,
      participationRate: parseFloat(participationRate),
      completedTrips,
      totalRides,
      completionRate: parseFloat(completionRate),
      totalOrgs,
    };
  }
}

export default new AdminService();
