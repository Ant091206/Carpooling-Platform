import fs from 'fs';
import path from 'path';
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
      designation: profileData.designation,
      emergencyContactName: profileData.emergencyContactName,
      emergencyContactPhone: profileData.emergencyContactPhone
    });

    try {
      const triggerService = (await import('./notification/notificationTriggerService.js')).default;
      await triggerService.notifyProfileUpdated({ userId });
    } catch (err) {
      console.error('Error triggering profile update notification:', err);
    }

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

    // Delete old avatar if it exists
    if (user.avatar) {
      const oldPath = path.join(process.cwd(), user.avatar);
      try {
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (err) {
        console.error('Failed to delete old avatar file:', err.message);
      }
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
    // Check if duplicate place name already exists for the user
    const existingPlaces = await SavedPlace.findAllByUserId(userId);
    const duplicate = existingPlaces.find(
      (p) => p.place_name.toLowerCase() === placeData.place_name.toLowerCase()
    );
    if (duplicate) {
      throw new ApiError(400, `A saved place with the name '${placeData.place_name}' already exists.`);
    }

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

    if (placeData.place_name && placeData.place_name.toLowerCase() !== place.place_name.toLowerCase()) {
      const existingPlaces = await SavedPlace.findAllByUserId(userId);
      const duplicate = existingPlaces.find(
        (p) => p.place_name.toLowerCase() === placeData.place_name.toLowerCase() && p.id !== placeId
      );
      if (duplicate) {
        throw new ApiError(400, `A saved place with the name '${placeData.place_name}' already exists.`);
      }
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

  /**
   * Get user preferences
   * @param {number} userId
   */
  static async getUserPreferences(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User profile not found');
    }
    return user.preferences || {};
  }

  /**
   * Update user preferences
   * @param {number} userId
   * @param {object} preferences
   */
  static async updateUserPreferences(userId, preferences) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User profile not found');
    }
    const updatedPreferences = {
      ...(user.preferences || {}),
      ...preferences
    };
    await User.updatePreferences(userId, updatedPreferences);
    return updatedPreferences;
  }
}

export default UserService;
export { UserService };
