import UserService from '../services/userService.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

class UserController {
  /**
   * View current employee user profile
   */
  static getProfile = async (req, res) => {
    const user = await UserService.getUserProfile(req.user.id);
    return new ApiResponse(200, user, 'Profile fetched successfully').send(res);
  };

  /**
   * Update user profile parameter attributes
   */
  static updateProfile = async (req, res) => {
    const updatedUser = await UserService.updateUserProfile(req.user.id, req.body);
    return new ApiResponse(200, updatedUser, 'Profile updated successfully').send(res);
  };

  /**
   * Upload user profile avatar image
   */
  static uploadAvatar = async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, 'Please upload a valid profile avatar image file');
    }

    // Standardize file path formatting
    const avatarPath = `uploads/profile/${req.file.filename}`;
    await UserService.updateUserAvatar(req.user.id, avatarPath);

    return new ApiResponse(200, { avatar: avatarPath }, 'Avatar uploaded successfully').send(res);
  };

  /**
   * Fetch all saved transit places for a user
   */
  static getSavedPlaces = async (req, res) => {
    const places = await UserService.getSavedPlaces(req.user.id);
    return new ApiResponse(200, places, 'Saved places fetched successfully').send(res);
  };

  /**
   * Create a new saved place location
   */
  static createSavedPlace = async (req, res) => {
    const place = await UserService.createSavedPlace(req.user.id, req.body);
    return new ApiResponse(201, place, 'Saved place created successfully').send(res);
  };

  /**
   * Update saved place parameters
   */
  static updateSavedPlace = async (req, res) => {
    const placeId = parseInt(req.params.id, 10);
    if (isNaN(placeId)) {
      throw new ApiError(400, 'Invalid saved place record identifier');
    }

    const updatedPlace = await UserService.updateSavedPlace(req.user.id, placeId, req.body);
    return new ApiResponse(200, updatedPlace, 'Saved place updated successfully').send(res);
  };

  /**
   * Remove a saved place location
   */
  static deleteSavedPlace = async (req, res) => {
    const placeId = parseInt(req.params.id, 10);
    if (isNaN(placeId)) {
      throw new ApiError(400, 'Invalid saved place record identifier');
    }

    await UserService.deleteSavedPlace(req.user.id, placeId);
    return new ApiResponse(200, null, 'Saved place deleted successfully').send(res);
  };

  /**
   * Fetch current user preferences
   */
  static getPreferences = async (req, res) => {
    const preferences = await UserService.getUserPreferences(req.user.id);
    return new ApiResponse(200, preferences, 'User preferences retrieved successfully').send(res);
  };

  /**
   * Update current user preferences
   */
  static updatePreferences = async (req, res) => {
    const updated = await UserService.updateUserPreferences(req.user.id, req.body);
    return new ApiResponse(200, updated, 'User preferences updated successfully').send(res);
  };
}

export default UserController;
export { UserController };
