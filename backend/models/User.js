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
        organizationObj: true
      }
    });

    if (!user) return null;

    // Map output to ensure 100% database field compatibility with other systems
    return {
      ...user,
      name: `${user.firstName} ${user.lastName}`.trim(),
      organization_id: user.organizationId,
      employee_id: user.employeeId,
      last_login: user.lastLogin,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      organization_name: user.organizationObj ? user.organizationObj.name : user.organization
    };
  }

  /**
   * Find user metadata by email (retains password/hash for credentials checking)
   * @param {string} email Email address
   */
  static async findByEmail(email) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organizationObj: true
      }
    });

    if (!user) return null;

    return {
      ...user,
      name: `${user.firstName} ${user.lastName}`.trim(),
      organization_id: user.organizationId,
      employee_id: user.employeeId,
      last_login: user.lastLogin,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      organization_name: user.organizationObj ? user.organizationObj.name : user.organization
    };
  }

  /**
   * Insert user record
   * @param {object} userData Profile fields
   */
  static async create(userData) {
    const {
      firstName,
      lastName,
      employee_id,
      email,
      passwordHash,
      phone = null,
      department = null,
      designation = null,
      avatar = null,
      organization,
      organization_id = null,
      role = 'EMPLOYEE',
      status = 'ACTIVE',
      isVerified = false
    } = userData;

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        employeeId: employee_id,
        email,
        passwordHash,
        phone,
        department,
        designation,
        avatar,
        organization,
        organizationId: organization_id,
        role,
        status,
        isVerified
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
   * Update user profile fields (name / firstName + lastName, phone, department, designation)
   * @param {number} id Record ID
   * @param {object} profileData Fields to update
   */
  static async updateProfile(id, { name, firstName, lastName, phone, department, designation }) {
    let fName = firstName;
    let lName = lastName;

    if (name && (!fName || !lName)) {
      const parts = name.trim().split(/\s+/);
      fName = parts[0] || '';
      lName = parts.slice(1).join(' ') || '';
    }

    const updateData = {};
    if (fName !== undefined) updateData.firstName = fName;
    if (lName !== undefined) updateData.lastName = lName;
    if (phone !== undefined) updateData.phone = phone;
    if (department !== undefined) updateData.department = department;
    if (designation !== undefined) updateData.designation = designation;

    const user = await prisma.user.update({
      where: { id },
      data: updateData
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
