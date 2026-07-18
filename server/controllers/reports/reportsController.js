import prisma from '../../config/db.js';
import reportsService from '../../services/reports/reportsService.js';
import { successResponse } from '../../utils/responseHelper.js';
import ApiError from '../../utils/ApiError.js';
import fs from 'fs';
import path from 'path';

class ReportsController {
  /**
   * GET /api/reports
   */
  async getReports(req, res, next) {
    try {
      // Admins can see all, standard users see their own
      const where = req.user.role === 'ADMIN' ? {} : { generatedBy: req.user.id };
      
      const reports = await prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      });

      return successResponse(res, reports, 'Reports log retrieved successfully.');
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/reports/:id
   */
  async getReportById(req, res, next) {
    try {
      const { id } = req.params;
      const report = await prisma.report.findUnique({
        where: { id: parseInt(id) }
      });

      if (!report) {
        throw new ApiError(404, 'Report not found.');
      }

      // Check ownership
      if (req.user.role !== 'ADMIN' && report.generatedBy !== req.user.id) {
        throw new ApiError(403, 'Access denied. You do not own this report.');
      }

      return successResponse(res, report, 'Report detail retrieved.');
    } catch (e) {
      next(e);
    }
  }

  /**
   * POST /api/reports/generate
   */
  async createReport(req, res, next) {
    try {
      const { title, type, fileType, filters } = req.body;

      if (!title || !type || !fileType) {
        throw new ApiError(422, 'Title, type, and fileType are required.');
      }

      const allowedTypes = ['RIDE', 'PAYMENT', 'USER', 'DRIVER', 'PASSENGER', 'REVENUE', 'BOOKING', 'RATING'];
      const allowedFormats = ['CSV', 'XLSX', 'PDF'];

      if (!allowedTypes.includes(type.toUpperCase())) {
        throw new ApiError(422, `Invalid report type. Allowed: ${allowedTypes.join(', ')}`);
      }

      if (!allowedFormats.includes(fileType.toUpperCase())) {
        throw new ApiError(422, `Invalid export format. Allowed: ${allowedFormats.join(', ')}`);
      }

      // 1. Create Report in PENDING state
      const report = await prisma.report.create({
        data: {
          title,
          type: type.toUpperCase(),
          fileType: fileType.toUpperCase(),
          generatedBy: req.user.id,
          status: 'PENDING',
          filters: filters ? JSON.stringify(filters) : '{}'
        }
      });

      // 2. Trigger asynchronous generation (Worker Pattern)
      // Do not use await here so the API responds instantly
      reportsService.generateReport(report.id);

      return successResponse(res, report, 'Report generation job created. Status: PENDING.', 201);
    } catch (e) {
      next(e);
    }
  }

  /**
   * DELETE /api/reports/:id
   */
  async deleteReport(req, res, next) {
    try {
      const { id } = req.params;
      const report = await prisma.report.findUnique({
        where: { id: parseInt(id) }
      });

      if (!report) {
        throw new ApiError(404, 'Report not found.');
      }

      // Check ownership
      if (req.user.role !== 'ADMIN' && report.generatedBy !== req.user.id) {
        throw new ApiError(403, 'Access denied. You do not own this report.');
      }

      // Delete file from disk
      if (report.fileUrl) {
        const filePath = path.join(process.cwd(), report.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await prisma.report.delete({ where: { id: parseInt(id) } });

      return successResponse(res, null, 'Report deleted successfully.');
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/reports/download/:id
   */
  async downloadReport(req, res, next) {
    try {
      const { id } = req.params;
      const report = await prisma.report.findUnique({
        where: { id: parseInt(id) }
      });

      if (!report) {
        throw new ApiError(404, 'Report not found.');
      }

      // Check ownership
      if (req.user.role !== 'ADMIN' && report.generatedBy !== req.user.id) {
        throw new ApiError(403, 'Access denied. You do not own this report.');
      }

      if (report.status !== 'COMPLETED' || !report.fileUrl) {
        throw new ApiError(400, 'Report is not ready for download.');
      }

      const filePath = path.join(process.cwd(), report.fileUrl);
      if (!fs.existsSync(filePath)) {
        throw new ApiError(404, 'Report file was not found on server.');
      }

      res.download(filePath, `${report.title.replace(/\s+/g, '_')}.${report.fileType.toLowerCase()}`);
    } catch (e) {
      next(e);
    }
  }
}

export default new ReportsController();
