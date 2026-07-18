import db from '../config/db.js';

class RefreshToken {
  /**
   * Save refresh token record
   * @param {number} userId Associated user record id
   * @param {string} token Signed JWT refresh token string
   * @param {Date} expiresAt Token expiration date
   */
  static async create(userId, token, expiresAt) {
    const [result] = await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
    return result.insertId;
  }

  /**
   * Find token record details by token key string
   * @param {string} token Refresh token key
   */
  static async findByToken(token) {
    const [rows] = await db.query(
      'SELECT id, user_id, token, expires_at, created_at FROM refresh_tokens WHERE token = ? LIMIT 1',
      [token]
    );
    return rows[0] || null;
  }

  /**
   * Delete specific token record
   * @param {string} token Token string to remove
   */
  static async deleteByToken(token) {
    const [result] = await db.query(
      'DELETE FROM refresh_tokens WHERE token = ?',
      [token]
    );
    return result.affectedRows > 0;
  }

  /**
   * Revoke all token records for a user
   * @param {number} userId User record identifier
   */
  static async deleteByUserId(userId) {
    const [result] = await db.query(
      'DELETE FROM refresh_tokens WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }
}

export default RefreshToken;
export { RefreshToken };
