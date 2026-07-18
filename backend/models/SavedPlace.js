import prisma from '../config/db.js';

class SavedPlace {
  /**
   * Find all saved places for a specific employee user
   * @param {number} userId User record identifier
   */
  static async findAllByUserId(userId) {
    const places = await prisma.savedPlace.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { placeName: 'asc' }
      ]
    });

    return places.map((place) => ({
      ...place,
      user_id: place.userId,
      place_name: place.placeName,
      is_default: place.isDefault,
      created_at: place.createdAt,
      updated_at: place.updatedAt
    }));
  }

  /**
   * Find details of a specific saved place by ID
   * @param {number} id Saved place record id
   */
  static async findById(id) {
    const place = await prisma.savedPlace.findUnique({
      where: { id }
    });

    if (!place) return null;

    return {
      ...place,
      user_id: place.userId,
      place_name: place.placeName,
      is_default: place.isDefault,
      created_at: place.createdAt,
      updated_at: place.updatedAt
    };
  }

  /**
   * Save a new place for a user
   * @param {number} userId User ID
   * @param {object} placeData Coordinates and names fields
   */
  static async create(userId, { place_name, address, latitude, longitude, is_default = 0 }) {
    const place = await prisma.savedPlace.create({
      data: {
        userId,
        placeName: place_name,
        address,
        latitude,
        longitude,
        isDefault: is_default
      }
    });
    return place.id;
  }

  /**
   * Update saved place parameters
   * @param {number} id Saved place ID
   * @param {object} placeData Updated parameters
   */
  static async update(id, { place_name, address, latitude, longitude, is_default }) {
    const place = await prisma.savedPlace.update({
      where: { id },
      data: {
        placeName: place_name,
        address,
        latitude,
        longitude,
        isDefault: is_default
      }
    });
    return !!place;
  }

  /**
   * Remove a saved place
   * @param {number} id Saved place ID
   */
  static async delete(id) {
    try {
      const place = await prisma.savedPlace.delete({
        where: { id }
      });
      return !!place;
    } catch (error) {
      return false;
    }
  }

  /**
   * Enforce that only one saved place is marked as default for a user
   * @param {number} userId User ID
   * @param {number} exceptPlaceId Exclude the newly set default place ID
   */
  static async unsetOtherDefaults(userId, exceptPlaceId) {
    const result = await prisma.savedPlace.updateMany({
      where: {
        userId,
        id: { not: exceptPlaceId }
      },
      data: {
        isDefault: 0
      }
    });
    return result.count;
  }
}

export default SavedPlace;
export { SavedPlace };
