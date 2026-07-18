import db from '../config/db.js';

class User {
  /**
   * Find employee profile by record ID (excludes password by default)
   * @param {number} id Record ID
   */
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT u.id, u.organization_id, u.employee_id, u.name, u.email, u.phone, 
              u.department, u.designation, u.avatar, u.role, u.status, u.last_login, 
              u.created_at, u.updated_at, o.name AS organization_name 
       FROM users u
       INNER JOIN organizations o ON u.organization_id = o.id
       WHERE u.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Find user metadata by email (retains password for credentials checking)
   * @param {string} email Email address
   */
  static async findByEmail(email) {
    const [rows] = await db.query(
      `SELECT u.id, u.organization_id, u.employee_id, u.name, u.email, u.password, u.phone, 
              u.department, u.designation, u.avatar, u.role, u.status, u.last_login, 
              u.created_at, u.updated_at, o.name AS organization_name 
       FROM users u
       INNER JOIN organizations o ON u.organization_id = o.id
       WHERE u.email = ? LIMIT 1`,
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Insert user record
   * @param {object} userData Profile fields
   */
  static async create(userData) {
    const {
      organization_id,
      employee_id,
      name,
      email,
      password,
      phone = null,
      department = null,
      designation = null,
      avatar = null,
      role = 'EMPLOYEE',
      status = 'ACTIVE'
    } = userData;

    const [result] = await db.query(
      `INSERT INTO users (organization_id, employee_id, name, email, password, phone, department, designation, avatar, role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [organization_id, employee_id, name, email, password, phone, department, designation, avatar, role, status]
    );

    return result.insertId;
  }

  /**
   * Update employee log timestamps upon authentication success
   * @param {number} id Record ID
   */
  static async updateLastLogin(id) {
    const [result] = await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default User;
export { User };
