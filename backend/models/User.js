import prisma from '../config/db.js';

class User {
  /**
   * Find employee profile by record ID
   * @param {number} id Record ID
   */
  static async findById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        organization: true
      }
    });

    if (!user) return null;

    // Map output to ensure 100% database field compatibility with mysql2 outputs
    return {
      ...user,
      organization_id: user.organizationId,
      employee_id: user.employeeId,
      last_login: user.lastLogin,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      organization_name: user.organization.name
    };
  }

  /**
   * Find user metadata by email (retains password for credentials checking)
   * @param {string} email Email address
   */
  static async findByEmail(email) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true
      }
    });

    if (!user) return null;

    return {
      ...user,
      organization_id: user.organizationId,
      employee_id: user.employeeId,
      last_login: user.lastLogin,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      organization_name: user.organization.name
    };
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

    const user = await prisma.user.create({
      data: {
        organizationId: organization_id,
        employeeId: employee_id,
        name,
        email,
        password,
        phone,
        department,
        designation,
        avatar,
        role,
        status
      }
    });

    return user.id;
  }

  /**
   * Update employee log timestamps upon authentication success
   * @param {number} id Record ID
   */
  static async updateLastLogin(id) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        lastLogin: new Date()
      }
    });
    return !!user;
  }

  /**
   * Update user profile fields
   * @param {number} id Record ID
   * @param {object} param1 Fields to update: name, phone, department, designation
   */
  static async updateProfile(id, { name, phone, department, designation }) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        phone,
        department,
        designation
      }
    });
    return !!user;
  }

  /**
   * Update user profile avatar file path
   * @param {number} id Record ID
   * @param {string} avatarPath Uploaded file path
   */
  static async updateAvatar(id, avatarPath) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        avatar: avatarPath
      }
    });
    return !!user;
  }
}

export default User;
export { User };
