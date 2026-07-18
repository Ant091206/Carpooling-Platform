import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';

class ReviewService {
  /**
   * Submit a review for a ride participant
   */
  async createReview(reviewerId, reviewData) {
    const { rideId, revieweeId, rating, review } = reviewData;

    const rideIdInt = parseInt(rideId, 10);
    const reviewerIdInt = parseInt(reviewerId, 10);
    const revieweeIdInt = parseInt(revieweeId, 10);
    const ratingInt = parseInt(rating, 10);

    // 1. Cannot review own account
    if (reviewerIdInt === revieweeIdInt) {
      throw new ApiError(400, 'You cannot review yourself.');
    }

    // 2. Cannot submit rating outside 1-5
    if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
      throw new ApiError(400, 'Rating must be an integer between 1 and 5.');
    }

    // 3. Cannot submit empty review
    if (!review || !review.trim()) {
      throw new ApiError(400, 'Review text cannot be empty.');
    }

    // 4. Fetch the ride to check status and participants
    const ride = await prisma.ride.findUnique({
      where: { id: rideIdInt },
      include: {
        bookings: {
          where: {
            status: { in: ['ACCEPTED', 'COMPLETED'] }
          }
        }
      }
    });

    if (!ride) {
      throw new ApiError(404, 'Ride not found.');
    }

    // 5. Cannot review cancelled ride
    if (ride.rideStatus === 'Cancelled') {
      throw new ApiError(400, 'Cannot review a cancelled ride.');
    }

    // 6. Cannot review pending/scheduled ride
    if (ride.rideStatus !== 'Completed') {
      throw new ApiError(400, 'Only completed rides can receive reviews.');
    }

    // 7. Verify reviewer and reviewee both participated in this ride
    const isReviewerDriver = ride.driverId === reviewerIdInt;
    const isReviewerPassenger = ride.bookings.some(b => b.passengerId === reviewerIdInt);
    
    const isRevieweeDriver = ride.driverId === revieweeIdInt;
    const isRevieweePassenger = ride.bookings.some(b => b.passengerId === revieweeIdInt);

    if (!(isReviewerDriver || isReviewerPassenger)) {
      throw new ApiError(403, 'Reviewer did not participate in this ride.');
    }

    if (!(isRevieweeDriver || isRevieweePassenger)) {
      throw new ApiError(400, 'Reviewee did not participate in this ride.');
    }

    // 8. Prevent duplicate reviews (Only one review per user per ride target)
    const existingReview = await prisma.rideReview.findFirst({
      where: {
        rideId: rideIdInt,
        reviewerId: reviewerIdInt,
        revieweeId: revieweeIdInt
      }
    });

    if (existingReview) {
      throw new ApiError(409, 'You have already submitted a review for this participant on this ride.');
    }

    // 9. Save review
    const newReview = await prisma.rideReview.create({
      data: {
        rideId: rideIdInt,
        reviewerId: reviewerIdInt,
        revieweeId: revieweeIdInt,
        rating: ratingInt,
        review: review.trim()
      }
    });

    return newReview;
  }

  /**
   * Get aggregates, rating distribution, and latest reviews for a user
   */
  async getUserReviewStats(userId) {
    const userIdInt = parseInt(userId, 10);

    // Get average and total count of reviews
    const aggregate = await prisma.rideReview.aggregate({
      where: { revieweeId: userIdInt },
      _avg: { rating: true },
      _count: { id: true }
    });

    const averageRating = aggregate._avg.rating ? parseFloat(aggregate._avg.rating.toFixed(1)) : 0.0;
    const totalReviews = aggregate._count.id;

    // Get latest reviews with reviewer information
    const latestReviews = await prisma.rideReview.findMany({
      where: { revieweeId: userIdInt },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            department: true,
            designation: true
          }
        }
      }
    });

    // Get rating distribution
    const distribution = await prisma.rideReview.groupBy({
      by: ['rating'],
      where: { revieweeId: userIdInt },
      _count: { id: true }
    });

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach(d => {
      if (d.rating >= 1 && d.rating <= 5) {
        ratingDistribution[d.rating] = d._count.id;
      }
    });

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userIdInt },
      select: {
        id: true,
        name: true,
        avatar: true,
        department: true,
        designation: true
      }
    });

    return {
      user,
      averageRating,
      totalReviews,
      latestReviews,
      ratingDistribution
    };
  }

  /**
   * Get all reviews for a specific ride
   */
  async getRideReviews(rideId) {
    const rideIdInt = parseInt(rideId, 10);

    return await prisma.rideReview.findMany({
      where: { rideId: rideIdInt },
      include: {
        reviewer: {
          select: { id: true, name: true, avatar: true, department: true }
        },
        reviewee: {
          select: { id: true, name: true, avatar: true, department: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default new ReviewService();
