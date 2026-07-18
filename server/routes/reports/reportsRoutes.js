import { Router } from 'express';
import reportsController from '../../controllers/reports/reportsController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';

const router = Router();

// Require user authentication for all reports endpoints
router.use(authMiddleware);

// Admin & Employee both can see and generate reports
router.get('/', asyncHandler(reportsController.getReports));
router.get('/:id', asyncHandler(reportsController.getReportById));
router.post('/generate', asyncHandler(reportsController.createReport));
router.delete('/:id', asyncHandler(reportsController.deleteReport));
router.get('/download/:id', asyncHandler(reportsController.downloadReport));

export default router;
