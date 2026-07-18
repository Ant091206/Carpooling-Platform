import historyService from '../../services/history/historyService.js';
import { successResponse } from '../../utils/responseFormat.js';

class HistoryController {
  /**
   * Get all rides (upcoming, completed, cancelled) for the logged-in user
   * GET /api/history/my-rides
   */
  async getMyRides(req, res, next) {
    try {
      const userId = req.user.id;
      const rides = await historyService.getMyRides(userId);
      res.status(200).json(successResponse('Ride history retrieved successfully', rides));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get complete ride details for history item
   * GET /api/history/:rideId
   */
  async getRideDetails(req, res, next) {
    try {
      const { rideId } = req.params;
      const userId = req.user.id;
      const rideDetails = await historyService.getRideById(rideId, userId);
      res.status(200).json(successResponse('Ride history details retrieved successfully', rideDetails));
    } catch (error) {
      next(error);
    }
  }
}

export default new HistoryController();
