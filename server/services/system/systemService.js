import os from 'os';
import prisma from '../../config/db.js';
import { getIo } from '../../utils/socketIo.js';

const APP_VERSION = '1.0.0';
const startTime = Date.now();

const systemService = {
  /**
   * Calculate application uptime string
   */
  getUptime() {
    const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  },

  /**
   * Health Check Metrics
   */
  async getHealthStatus() {
    let dbStatus = 'DOWN';
    let dbLatencyMs = 0;
    const startDb = Date.now();

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'UP';
      dbLatencyMs = Date.now() - startDb;
    } catch (error) {
      dbStatus = 'DOWN';
    }

    const io = getIo();
    const socketStatus = io ? 'UP' : 'DOWN';
    const connectedSockets = io?.engine?.clientsCount || 0;

    const memoryUsage = process.memoryUsage();
    const totalMemBytes = os.totalmem();
    const freeMemBytes = os.freemem();

    const isHealthy = dbStatus === 'UP';

    return {
      status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      components: {
        api: { status: 'UP' },
        database: { status: dbStatus, latencyMs: dbLatencyMs },
        socket: { status: socketStatus, connectedClients: connectedSockets },
      },
      metrics: {
        memory: {
          heapUsedMb: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
          heapTotalMb: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
          rssMb: (memoryUsage.rss / 1024 / 1024).toFixed(2),
          systemTotalMb: (totalMemBytes / 1024 / 1024).toFixed(2),
          systemFreeMb: (freeMemBytes / 1024 / 1024).toFixed(2),
        },
        cpu: {
          cores: os.cpus().length,
          loadAverage: os.loadavg(),
        }
      }
    };
  },

  /**
   * Comprehensive System Information
   */
  async getSystemInfo() {
    const health = await this.getHealthStatus();

    let dbVersion = 'MySQL 8.0';
    try {
      const result = await prisma.$queryRaw`SELECT VERSION() as version`;
      if (result && result[0]?.version) {
        dbVersion = result[0].version;
      }
    } catch (e) {
      // Fallback
    }

    return {
      application: {
        name: 'Enterprise Carpooling Platform',
        version: APP_VERSION,
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 5000,
        uptime: health.uptime,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        hostname: os.hostname(),
        cpus: os.cpus().length,
        totalMemoryMb: (os.totalmem() / 1024 / 1024).toFixed(2),
      },
      database: {
        engine: 'MySQL (Prisma ORM)',
        version: dbVersion,
        status: health.components.database.status,
        latencyMs: health.components.database.latencyMs,
      },
      socket: health.components.socket,
    };
  },

  /**
   * Query Paginated & Filtered System Logs
   */
  async getLogs({ page = 1, limit = 50, level, module: moduleName, search } = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (level) where.level = level;
    if (moduleName) where.module = moduleName;
    if (search) {
      where.OR = [
        { message: { contains: search } },
        { ip: { contains: search } }
      ];
    }

    const [logs, total] = await prisma.$transaction([
      prisma.systemLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: {
          user: { select: { id: true, name: true, email: true, role: true } }
        }
      }),
      prisma.systemLog.count({ where })
    ]);

    return {
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get System Settings
   */
  async getSettings() {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' }
    });

    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    return {
      raw: settings,
      settings: settingsMap
    };
  },

  /**
   * Update System Setting
   */
  async updateSettings(settingsObj) {
    const results = [];
    for (const [key, value] of Object.entries(settingsObj)) {
      const valStr = String(value);
      const setting = await prisma.systemSetting.upsert({
        where: { key },
        update: { value: valStr },
        create: { key, value: valStr, description: `System setting ${key}` }
      });
      results.push(setting);
    }
    return results;
  },

  /**
   * Metadata Backup Handler
   */
  async getBackupMetadata() {
    const [userCount, rideCount, bookingCount, paymentCount, notificationCount, logCount] = await prisma.$transaction([
      prisma.user.count(),
      prisma.ride.count(),
      prisma.booking.count(),
      prisma.payment.count(),
      prisma.notification.count(),
      prisma.systemLog.count(),
    ]);

    const settings = await prisma.systemSetting.findMany();

    return {
      backupDate: new Date().toISOString(),
      appVersion: APP_VERSION,
      counts: {
        users: userCount,
        rides: rideCount,
        bookings: bookingCount,
        payments: paymentCount,
        notifications: notificationCount,
        systemLogs: logCount,
      },
      settings,
    };
  },

  /**
   * Restore Metadata Handler
   */
  async restoreMetadata(backupData) {
    if (!backupData || !backupData.settings) {
      throw new Error('Invalid backup metadata structure.');
    }

    for (const setting of backupData.settings) {
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value, description: setting.description },
        create: { key: setting.key, value: setting.value, description: setting.description }
      });
    }

    return { restoredSettings: backupData.settings.length };
  }
};

export default systemService;
