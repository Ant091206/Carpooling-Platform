import reviewService from '../../services/review/reviewService.js';
import { successResponse } from '../../utils/responseFormat.js';

class ReviewController {
  /**
   * Submit a review for a ride participant
   * POST /api/review
   */
  async createReview(req, res, next) {
    try {
      const reviewerId = req.user.id;
      const review = await reviewService.createReview(reviewerId, req.body);
      res.status(201).json(successResponse('Review submitted successfully', review));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get ratings and review summary for a specific user
   * GET /api/review/user/:userId
   */
  async getUserReviewStats(req, res, next) {
    try {
      const { userId } = req.params;
      const stats = await reviewService.getUserReviewStats(userId);
      res.status(200).json(successResponse('User review stats retrieved successfully', stats));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all reviews submitted for a specific ride
   * GET /api/review/ride/:rideId
   */
  async getRideReviews(req, res, next) {
    try {
      const { rideId } = req.params;
      const reviews = await reviewService.getRideReviews(rideId);
      res.status(200).json(successResponse('Ride reviews retrieved successfully', reviews));
    } catch (error) {
      next(error);
    }
  }
}

export default new ReviewController();
