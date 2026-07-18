import { User } from '../models/User.js';
import { SavedPlace } from '../models/SavedPlace.js';
import ApiError from '../utils/ApiError.js';

class UserService {
  /**
   * Fetch authenticated user's profile info
   * @param {number} userId
   */
  static async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User profile not found');
    }
    return user;
  }

  /**
   * Update profile fields (name, phone, department, designation)
   * @param {number} userId
   * @param {object} profileData
   */
  static async updateUserProfile(userId, profileData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User profile not found');
    }

    await User.updateProfile(userId, {
      name: profileData.name,
      phone: profileData.phone,
      department: profileData.department,
      designation: profileData.designation
    });

    return await User.findById(userId);
  }

  /**
   * Save profile avatar path
   * @param {number} userId
   * @param {string} avatarPath
   */
  static async updateUserAvatar(userId, avatarPath) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User profile not found');
    }

    await User.updateAvatar(userId, avatarPath);
    return avatarPath;
  }

  /**
   * Get all saved locations for a user
   * @param {number} userId
   */
  static async getSavedPlaces(userId) {
    return await SavedPlace.findAllByUserId(userId);
  }

  /**
   * Create a new saved place
   * @param {number} userId
   * @param {object} placeData
   */
  static async createSavedPlace(userId, placeData) {
    const isDefault = placeData.is_default ? 1 : 0;
    
    const placeId = await SavedPlace.create(userId, {
      ...placeData,
      is_default: isDefault
    });

    if (isDefault === 1) {
      await SavedPlace.unsetOtherDefaults(userId, placeId);
    }

    return await SavedPlace.findById(placeId);
  }

  /**
   * Edit saved place details
   * @param {number} userId Request user ID
   * @param {number} placeId Target place ID
   * @param {object} placeData Coordinates and metadata
   */
  static async updateSavedPlace(userId, placeId, placeData) {
    const place = await SavedPlace.findById(placeId);
    if (!place) {
      throw new ApiError(404, 'Saved place not found');
    }

    // Ownership assertion
    if (place.user_id !== userId) {
      throw new ApiError(403, 'Access denied. You do not have permissions to modify this saved place');
    }

    const isDefault = placeData.is_default ? 1 : 0;

    await SavedPlace.update(placeId, {
      place_name: placeData.place_name,
      address: placeData.address,
      latitude: placeData.latitude,
      longitude: placeData.longitude,
      is_default: isDefault
    });

    if (isDefault === 1) {
      await SavedPlace.unsetOtherDefaults(userId, placeId);
    }

    return await SavedPlace.findById(placeId);
  }

  /**
   * Remove saved location record
   * @param {number} userId Request user ID
   * @param {number} placeId Target place ID
   */
  static async deleteSavedPlace(userId, placeId) {
    const place = await SavedPlace.findById(placeId);
    if (!place) {
      throw new ApiError(404, 'Saved place not found');
    }

    // Ownership assertion
    if (place.user_id !== userId) {
      throw new ApiError(403, 'Access denied. You do not have permissions to delete this saved place');
    }

    await SavedPlace.delete(placeId);
    return true;
  }
}

export default UserService;
export { UserService };
