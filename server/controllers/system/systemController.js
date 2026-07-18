import systemService from '../../services/system/systemService.js';
import systemLogger from '../../utils/systemLogger.js';
import asyncHandler from '../../middleware/asyncHandler.js';

const systemController = {
  /**
   * GET /api/health
   */
  getHealth: asyncHandler(async (req, res) => {
    const health = await systemService.getHealthStatus();
    const statusCode = health.status === 'HEALTHY' ? 200 : 503;

    res.status(statusCode).json({
      success: health.status === 'HEALTHY',
      data: health
    });
  }),

  /**
   * GET /api/status
   */
  getStatus: asyncHandler(async (req, res) => {
    const health = await systemService.getHealthStatus();
    res.status(200).json({
      success: true,
      message: 'System operational',
      data: {
        status: health.status,
        version: health.version,
        uptime: health.uptime,
        database: health.components.database,
        socket: health.components.socket
      }
    });
  }),

  /**
   * GET /api/system/info
   */
  getSystemInfo: asyncHandler(async (req, res) => {
    const info = await systemService.getSystemInfo();
    res.status(200).json({
      success: true,
      data: info
    });
  }),

  /**
   * GET /api/system/logs
   */
  getLogs: asyncHandler(async (req, res) => {
    const { page, limit, level, module, search } = req.query;

    const result = await systemService.getLogs({
      page: Number(page) || 1,
      limit: Number(limit) || 50,
      level,
      module,
      search
    });

    res.status(200).json({
      success: true,
      data: result
    });
  }),

  /**
   * GET /api/system/settings
   */
  getSettings: asyncHandler(async (req, res) => {
    const settings = await systemService.getSettings();
    res.status(200).json({
      success: true,
      data: settings
    });
  }),

  /**
   * PUT /api/system/settings
   */
  updateSettings: asyncHandler(async (req, res) => {
    const results = await systemService.updateSettings(req.body);
    await systemLogger.admin('Updated system settings', { updatedKeys: Object.keys(req.body) }, req);

    res.status(200).json({
      success: true,
      message: 'System settings updated successfully.',
      data: results
    });
  }),

  /**
   * GET /api/system/backup
   */
  getBackup: asyncHandler(async (req, res) => {
    const backup = await systemService.getBackupMetadata();
    await systemLogger.admin('Exported system backup metadata', null, req);

    res.status(200).json({
      success: true,
      message: 'Backup metadata generated successfully.',
      data: backup
    });
  }),

  /**
   * POST /api/system/restore
   */
  restoreBackup: asyncHandler(async (req, res) => {
    const result = await systemService.restoreMetadata(req.body);
    await systemLogger.admin('Restored system backup metadata', { count: result.restoredSettings }, req);

    res.status(200).json({
      success: true,
      message: 'Backup metadata restored successfully.',
      data: result
    });
  })
};

export default systemController;
