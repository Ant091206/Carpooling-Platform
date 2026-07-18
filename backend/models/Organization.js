import db from '../config/db.js';

class Organization {
  /**
   * Find organization profile by record ID
   * @param {number} id Record unique identifier
   */
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, company_code, email, phone, address, status, created_at, updated_at FROM organizations WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Find organization profile by custom organization code string
   * @param {string} code Unique code (e.g. GOOG123)
   */
  static async findByCompanyCode(code) {
    const [rows] = await db.query(
      'SELECT id, name, company_code, email, phone, address, status, created_at, updated_at FROM organizations WHERE company_code = ? LIMIT 1',
      [code]
    );
    return rows[0] || null;
  }
}

export default Organization;
export { Organization };
