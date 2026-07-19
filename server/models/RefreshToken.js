import prisma from '../config/db.js';

class RefreshToken {
  /**
   * Save refresh token record
   * @param {number} userId Associated user record id
   * @param {string} token Signed JWT refresh token string
   * @param {Date} expiresAt Token expiration date
   */
  static async create(userId, token, expiresAt) {
    const existing = await prisma.refreshToken.findUnique({
      where: { token }
    });
    if (existing) {
      return existing.id;
    }
    const result = await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt
      }
    });
    return result.id;
  }

  /**
   * Find token record details by token key string
   * @param {string} token Refresh token key
   */
  static async findByToken(token) {
    const record = await prisma.refreshToken.findUnique({
      where: { token }
    });

    if (!record) return null;

    return {
      ...record,
      user_id: record.userId,
      expires_at: record.expiresAt,
      created_at: record.createdAt
    };
  }

  /**
   * Delete specific token record
   * @param {string} token Token string to remove
   */
  static async deleteByToken(token) {
    try {
      const record = await prisma.refreshToken.findUnique({
        where: { token }
      });
      if (!record) return false;

      await prisma.refreshToken.delete({
        where: { token }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Revoke all token records for a user
   * @param {number} userId User record identifier
   */
  static async deleteByUserId(userId) {
    const result = await prisma.refreshToken.deleteMany({
      where: { userId }
    });
    return result.count > 0;
  }
}

export default RefreshToken;
export { RefreshToken };
