import matchingService from '../../services/matching/matchingService.js';
import { successResponse } from '../../utils/responseFormat.js';

class MatchingController {
  async findMatches(req, res, next) {
    try {
      const matches = await matchingService.findMatches(req.user.id, req.body);
      res.status(200).json(successResponse('Smart ride matches calculated successfully.', matches));
    } catch (err) {
      next(err);
    }
  }

  async getRecommendations(req, res, next) {
    try {
      const recommendations = await matchingService.getRecommendations(req.user.id);
      res.status(200).json(successResponse('AI ride recommendations retrieved successfully.', recommendations));
    } catch (err) {
      next(err);
    }
  }

  async getMatchHistory(req, res, next) {
    try {
      const history = await matchingService.getMatchHistory(req.user.id);
      res.status(200).json(successResponse('Match history retrieved successfully.', history));
    } catch (err) {
      next(err);
    }
  }

  async getPreferences(req, res, next) {
    try {
      const preferences = await matchingService.getPreferences(req.user.id);
      res.status(200).json(successResponse('Match preferences retrieved successfully.', preferences));
    } catch (err) {
      next(err);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const preferences = await matchingService.updatePreferences(req.user.id, req.body);
      res.status(200).json(successResponse('Match preferences updated successfully.', preferences));
    } catch (err) {
      next(err);
    }
  }
}

export default new MatchingController();
