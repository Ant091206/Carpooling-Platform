import prisma from '../config/db.js';

class Organization {
  /**
   * Register a new organization
   * @param {object} param0 Core registration fields
   */
  static async create({ name, company_code, email, phone = null, address = null, website = null, logo = null }) {
    const org = await prisma.organization.create({
      data: {
        name,
        companyCode: company_code,
        email,
        phone,
        address,
        website,
        logo,
        status: 'ACTIVE'
      }
    });

    return {
      ...org,
      company_code: org.companyCode,
      created_at: org.createdAt,
      updated_at: org.updatedAt
    };
  }

  /**
   * Find organization details by ID (including employees count)
   * @param {number} id
   */
  static async findById(id) {
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    if (!org) return null;

    return {
      id: org.id,
      name: org.name,
      company_code: org.companyCode,
      email: org.email,
      phone: org.phone,
      address: org.address,
      logo: org.logo,
      website: org.website,
      status: org.status,
      employee_count: org._count.users,
      created_at: org.createdAt,
      updated_at: org.updatedAt
    };
  }

  /**
   * Find organization profile details by unique company code string
   * @param {string} companyCode
   */
  static async findByCompanyCode(companyCode) {
    const org = await prisma.organization.findUnique({
      where: { companyCode }
    });

    if (!org) return null;

    return {
      ...org,
      company_code: org.companyCode,
      created_at: org.createdAt,
      updated_at: org.updatedAt
    };
  }

  /**
   * Update organization parameters
   * @param {number} id Organization ID
   * @param {object} updateData Parameters to update
   */
  static async update(id, updateData) {
    const org = await prisma.organization.update({
      where: { id },
      data: {
        name: updateData.name,
        email: updateData.email,
        phone: updateData.phone,
        website: updateData.website,
        address: updateData.address,
        logo: updateData.logo,
        status: updateData.status
      }
    });

    return {
      ...org,
      company_code: org.companyCode,
      created_at: org.createdAt,
      updated_at: org.updatedAt
    };
  }

  /**
   * Soft delete organization profile (sets status = INACTIVE)
   * @param {number} id Organization ID
   */
  static async softDelete(id) {
    const org = await prisma.organization.update({
      where: { id },
      data: {
        status: 'INACTIVE'
      }
    });

    return {
      ...org,
      company_code: org.companyCode,
      created_at: org.createdAt,
      updated_at: org.updatedAt
    };
  }

  /**
   * Fetch all employees belonging to this organization
   * @param {number} organizationId
   */
  static async findEmployees(organizationId) {
    const users = await prisma.user.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' }
    });

    return users.map((user) => ({
      id: user.id,
      organization_id: user.organizationId,
      employee_id: user.employeeId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      designation: user.designation,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      last_login: user.lastLogin,
      created_at: user.createdAt,
      updated_at: user.updatedAt
    }));
  }

  /**
   * Check if user is associated with organization
   * @param {string} employeeId
   * @param {number} organizationId
   */
  static async checkEmployeeVerification(employeeId, organizationId) {
    const user = await prisma.user.findFirst({
      where: {
        employeeId,
        organizationId
      }
    });
    return !!user;
  }
}

export default Organization;
export { Organization };
