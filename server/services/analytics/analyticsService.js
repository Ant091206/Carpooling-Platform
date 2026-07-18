import prisma from '../../config/db.js';

class AnalyticsService {
  /**
   * Helper to parse date filters.
   */
  getDateRange(period) {
    const end = new Date();
    let start = new Date();
    
    switch (period) {
      case 'weekly':
        start.setDate(end.getDate() - 12 * 7); // Last 12 weeks
        break;
      case 'monthly':
        start.setMonth(end.getMonth() - 12); // Last 12 months
        break;
      case 'yearly':
        start.setFullYear(end.getFullYear() - 5); // Last 5 years
        break;
      case 'daily':
      default:
        start.setDate(end.getDate() - 30); // Last 30 days
        break;
    }
    return { start, end };
  }

  /**
   * Main dashboard KPIs.
   */
  async getDashboardSummary() {
    const totalUsers = await prisma.user.count();
    
    // Drivers are users who own at least one vehicle or have created at least one ride
    const totalDrivers = await prisma.user.count({
      where: {
        OR: [
          { vehicles: { some: {} } },
          { rides: { some: {} } }
        ]
      }
    });

    const totalPassengers = await prisma.user.count({
      where: {
        passengerBookings: { some: {} }
      }
    });

    const totalRides = await prisma.ride.count();
    const completedRides = await prisma.ride.count({ where: { rideStatus: 'Completed' } });
    const cancelledRides = await prisma.ride.count({ where: { rideStatus: 'Cancelled' } });
    const pendingRides = await prisma.ride.count({ where: { rideStatus: 'Scheduled' } });

    // Revenue sum from successful payments
    const paymentsSum = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS' }
    });
    const totalRevenue = parseFloat(paymentsSum._sum.amount || 0);

    // Ride distances and durations
    const ridesStats = await prisma.ride.aggregate({
      _avg: { distanceKm: true, estimatedDuration: true }
    });
    const averageRideDistance = parseFloat(ridesStats._avg.distanceKm || 0);
    const averageRideDuration = parseFloat(ridesStats._avg.estimatedDuration || 0);

    // Average rating
    const ratingStats = await prisma.rideReview.aggregate({
      _avg: { rating: true }
    });
    const averageRating = parseFloat(ratingStats._avg.rating || 0);

    // Calculate cancel rate
    const cancellationRate = totalRides > 0 ? (cancelledRides / totalRides) * 100 : 0;

    return {
      totalUsers,
      totalDrivers,
      totalPassengers,
      totalRides,
      completedRides,
      cancelledRides,
      pendingRides,
      totalRevenue,
      averageRideDistance,
      averageRideDuration,
      averageRating,
      cancellationRate
    };
  }

  /**
   * Revenue trends grouped by date/period.
   */
  async getRevenueStats(period = 'daily') {
    const { start, end } = this.getDateRange(period);

    const payments = await prisma.payment.findMany({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: start, lte: end }
      },
      select: { amount: true, createdAt: true }
    });

    // Grouping by day, week or month
    const groups = {};
    payments.forEach(p => {
      let key = p.createdAt.toISOString().split('T')[0]; // default daily
      if (period === 'weekly') {
        // Week number or start of week date
        const d = new Date(p.createdAt);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const startOfWeek = new Date(d.setDate(diff));
        key = startOfWeek.toISOString().split('T')[0];
      } else if (period === 'monthly') {
        key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'yearly') {
        key = `${p.createdAt.getFullYear()}`;
      }

      groups[key] = (groups[key] || 0) + parseFloat(p.amount);
    });

    return Object.entries(groups).map(([date, revenue]) => ({ date, revenue }));
  }

  /**
   * Ride statistics: Completed vs Cancelled over time.
   */
  async getRidesStats(period = 'daily') {
    const { start, end } = this.getDateRange(period);

    const rides = await prisma.ride.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { rideStatus: true, createdAt: true }
    });

    const groups = {};
    rides.forEach(r => {
      let key = r.createdAt.toISOString().split('T')[0];
      if (period === 'weekly') {
        const d = new Date(r.createdAt);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(d.setDate(diff));
        key = startOfWeek.toISOString().split('T')[0];
      } else if (period === 'monthly') {
        key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groups[key]) {
        groups[key] = { completed: 0, cancelled: 0, total: 0 };
      }
      groups[key].total += 1;
      if (r.rideStatus === 'Completed') groups[key].completed += 1;
      if (r.rideStatus === 'Cancelled') groups[key].cancelled += 1;
    });

    return Object.entries(groups).map(([date, data]) => ({ date, ...data }));
  }

  /**
   * User Growth over time.
   */
  async getUsersStats(period = 'daily') {
    const { start, end } = this.getDateRange(period);

    const users = await prisma.user.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true }
    });

    const groups = {};
    users.forEach(u => {
      let key = u.createdAt.toISOString().split('T')[0];
      if (period === 'weekly') {
        const d = new Date(u.createdAt);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(d.setDate(diff));
        key = startOfWeek.toISOString().split('T')[0];
      } else if (period === 'monthly') {
        key = `${u.createdAt.getFullYear()}-${String(u.createdAt.getMonth() + 1).padStart(2, '0')}`;
      }

      groups[key] = (groups[key] || 0) + 1;
    });

    let runningTotal = await prisma.user.count({
      where: { createdAt: { lt: start } }
    });

    return Object.entries(groups)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => {
        runningTotal += count;
        return { date, newUsers: count, totalUsers: runningTotal };
      });
  }

  /**
   * Payments: Success rate and totals.
   */
  async getPaymentsStats() {
    const totalPayments = await prisma.payment.count();
    const successPayments = await prisma.payment.count({ where: { status: 'SUCCESS' } });
    const failedPayments = await prisma.payment.count({ where: { status: 'FAILED' } });
    const refundedPayments = await prisma.payment.count({ where: { status: 'REFUNDED' } });

    const successRate = totalPayments > 0 ? (successPayments / totalPayments) * 100 : 100;

    const paymentMethods = await prisma.payment.groupBy({
      by: ['paymentMethod'],
      _count: { id: true },
      _sum: { amount: true }
    });

    return {
      totals: {
        total: totalPayments,
        success: successPayments,
        failed: failedPayments,
        refunded: refundedPayments,
        successRate
      },
      methods: paymentMethods.map(m => ({
        method: m.paymentMethod,
        count: m._count.id,
        amount: parseFloat(m._sum.amount || 0)
      }))
    };
  }

  /**
   * Ratings: Distribution & average rating.
   */
  async getRatingsStats() {
    const reviews = await prisma.rideReview.findMany({
      select: { rating: true }
    });

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    reviews.forEach(r => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating] += 1;
      }
      sum += r.rating;
    });

    const averageRating = reviews.length > 0 ? sum / reviews.length : 0;

    return {
      averageRating,
      totalReviews: reviews.length,
      distribution: Object.entries(distribution).map(([stars, count]) => ({
        stars: parseInt(stars),
        count
      }))
    };
  }

  /**
   * Advanced metrics like peak hours, top drivers, top passengers, top routes.
   */
  async getAdvancedMetrics() {
    // Peak booking hours
    const bookings = await prisma.booking.findMany({
      select: { bookingDate: true }
    });
    const hours = Array(24).fill(0);
    bookings.forEach(b => {
      const h = new Date(b.bookingDate).getHours();
      hours[h] += 1;
    });
    const peakBookingHours = hours.map((count, hour) => ({ hour, count }));

    // Top Drivers (by rides completed)
    const topDriversData = await prisma.ride.groupBy({
      by: ['driverId'],
      _count: { id: true },
      where: { rideStatus: 'Completed' },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });
    const topDrivers = await Promise.all(topDriversData.map(async (d) => {
      const user = await prisma.user.findUnique({
        where: { id: d.driverId },
        select: { name: true, email: true }
      });
      return {
        id: d.driverId,
        name: user?.name || `Driver #${d.driverId}`,
        email: user?.email || '',
        ridesCount: d._count.id
      };
    }));

    // Top Passengers (by successful bookings)
    const topPassengersData = await prisma.booking.groupBy({
      by: ['passengerId'],
      _count: { id: true },
      where: { status: 'COMPLETED' },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });
    const topPassengers = await Promise.all(topPassengersData.map(async (p) => {
      const user = await prisma.user.findUnique({
        where: { id: p.passengerId },
        select: { name: true, email: true }
      });
      return {
        id: p.passengerId,
        name: user?.name || `Passenger #${p.passengerId}`,
        email: user?.email || '',
        bookingsCount: p._count.id
      };
    }));

    // Top Routes
    const rides = await prisma.ride.findMany({
      select: { pickupName: true, destinationName: true }
    });
    const routeCounts = {};
    rides.forEach(r => {
      const key = `${r.pickupName} ➔ ${r.destinationName}`;
      routeCounts[key] = (routeCounts[key] || 0) + 1;
    });
    const topRoutes = Object.entries(routeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([route, count]) => ({ route, count }));

    return {
      peakBookingHours,
      topDrivers,
      topPassengers,
      topRoutes
    };
  }
}

export default new AnalyticsService();
