import Organization from '../models/Organization.js';
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import ApiError from '../utils/ApiError.js';
import { sendEmail } from './notification/emailService.js';

class OrganizationService {
  /**
   * Register a new corporate organization
   * @param {object} orgData Corporate profile details
   */
  static async registerOrganization(orgData) {
    // Check if duplicate companyCode exists
    const existingOrg = await Organization.findByCompanyCode(orgData.company_code);
    if (existingOrg) {
      throw new ApiError(400, `Organization company code '${orgData.company_code}' is already registered`);
    }

    return await Organization.create(orgData);
  }

  /**
   * Public lookup by company code
   * @param {string} code
   */
  static async lookupByCompanyCode(code) {
    const org = await Organization.findByCompanyCode(code);
    if (!org || org.status !== 'ACTIVE') {
      throw new ApiError(404, `Organization with company code '${code}' not found or is inactive`);
    }

    return {
      id: org.id,
      name: org.name,
      company_code: org.company_code
    };
  }

  /**
   * Self-serve company registration (creates organization and first admin user atomically)
   */
  static async registerCompanyWithAdmin(data) {
    const {
      name,
      company_code,
      email,
      phone = null,
      website = null,
      address = null,
      admin_name,
      admin_email,
      admin_password,
      admin_phone
    } = data;

    // Check company code uniqueness
    const existingOrg = await Organization.findByCompanyCode(company_code);
    if (existingOrg) {
      throw new ApiError(400, `Organization company code '${company_code}' is already registered`);
    }

    // Check admin email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email: admin_email }
    });
    if (existingUser) {
      throw new ApiError(400, `Admin email '${admin_email}' is already registered by another user`);
    }

    // Hash admin password
    const hashed = await bcrypt.hash(admin_password, 10);

    // Atomically create Organization and Admin User
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name,
          companyCode: company_code,
          email,
          phone,
          address,
          website,
          status: 'ACTIVE'
        }
      });

      // Split admin_name into firstName & lastName
      const nameParts = admin_name.trim().split(/\s+/);
      const firstName = nameParts[0] || 'Admin';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      const admin = await tx.user.create({
        data: {
          firstName,
          lastName,
          name: `${firstName} ${lastName}`.trim(),
          employeeId: 'ADMIN-001',
          email: admin_email,
          passwordHash: hashed,
          phone: admin_phone,
          organization: org.name,
          organizationId: org.id,
          role: 'ADMIN',
          status: 'ACTIVE',
          isVerified: true
        }
      });

      return { org, admin };
    });

    const mappedOrg = {
      ...result.org,
      company_code: result.org.companyCode,
      created_at: result.org.createdAt,
      updated_at: result.org.updatedAt
    };

    const mappedAdmin = {
      id: result.admin.id,
      uuid: result.admin.uuid,
      employee_id: result.admin.employeeId,
      firstName: result.admin.firstName,
      lastName: result.admin.lastName,
      name: `${result.admin.firstName} ${result.admin.lastName}`.trim(),
      email: result.admin.email,
      phone: result.admin.phone,
      organization: result.admin.organization,
      organization_id: result.admin.organizationId,
      role: result.admin.role,
      status: result.admin.status,
      isVerified: result.admin.isVerified,
      created_at: result.admin.createdAt,
      updated_at: result.admin.updatedAt
    };

    return {
      organization: mappedOrg,
      admin: mappedAdmin
    };
  }

  /**
   * Get organization profile parameters including worker count
   * @param {number} orgId
   */
  static async getOrganizationDetails(orgId) {
    const org = await Organization.findById(orgId);
    if (!org) {
      throw new ApiError(404, 'Organization profile not found');
    }
    return org;
  }

  /**
   * Update organization parameters
   * @param {number} orgId Target organization record id
   * @param {object} updateData Parameters
   */
  static async updateOrganizationDetails(orgId, updateData) {
    const org = await Organization.findById(orgId);
    if (!org) {
      throw new ApiError(404, 'Organization profile not found');
    }

    return await Organization.update(orgId, updateData);
  }

  /**
   * Soft-delete organization (updates status = INACTIVE)
   * @param {number} orgId
   */
  static async deleteOrganization(orgId) {
    const org = await Organization.findById(orgId);
    if (!org) {
      throw new ApiError(404, 'Organization profile not found');
    }

    await Organization.softDelete(orgId);
    return true;
  }

  /**
   * Verify whether an employee belongs to a specific organization
   * @param {string} employeeId Employee badge ID
   * @param {number} organizationId Organization ID
   */
  static async verifyEmployee(employeeId, organizationId) {
    // Check if organization exists first
    const org = await Organization.findById(organizationId);
    if (!org) {
      throw new ApiError(404, 'Organization profile not found');
    }

    const verified = await Organization.checkEmployeeVerification(employeeId, organizationId);
    return { verified };
  }

  /**
   * Fetch all employees associated with an organization
   * @param {number} orgId
   */
  static async getOrganizationEmployees(orgId) {
    const org = await Organization.findById(orgId);
    if (!org) {
      throw new ApiError(404, 'Organization profile not found');
    }

    return await Organization.findEmployees(orgId);
  }

  /**
   * List all active organizations
   */
  static async listOrganizations() {
    const orgs = await prisma.organization.findMany({
      where: { status: 'ACTIVE' }
    });
    return orgs.map(org => ({
      id: org.id,
      name: org.name,
      company_code: org.companyCode,
      email: org.email,
      phone: org.phone,
      address: org.address,
      logo: org.logo,
      website: org.website,
      status: org.status,
      created_at: org.createdAt,
      updated_at: org.updatedAt
    }));
  }

  /**
   * Fetch all distinct departments for an organization
   * @param {number} orgId
   */
  static async getOrganizationDepartments(orgId) {
    const org = await Organization.findById(orgId);
    if (!org) {
      throw new ApiError(404, 'Organization profile not found');
    }

    const users = await prisma.user.findMany({
      where: {
        organizationId: orgId,
        department: { not: null }
      },
      select: {
        department: true
      },
      distinct: ['department']
    });

    return users.map(u => u.department).filter(Boolean);
  }

  /**
   * Invite an employee to join the organization via email
   * @param {number} adminUserId
   * @param {number} orgId
   * @param {string} email
   */
  static async inviteEmployee(adminUserId, orgId, email) {
    const org = await Organization.findById(orgId);
    if (!org) {
      throw new ApiError(404, 'Organization profile not found');
    }

    // Check if the user is already associated with this organization
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser && existingUser.organizationId === orgId) {
      throw new ApiError(400, 'User with this email is already an employee in your organization');
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId }
    });

    const adminName = adminUser ? adminUser.name : 'Organization Administrator';

    const emailResult = await sendEmail(email, 'invite', {
      userName: 'Employee',
      orgName: org.name,
      companyCode: org.company_code,
      userNameVal: adminName
    });

    await prisma.emailQueue.create({
      data: {
        userId: adminUserId,
        recipient: email,
        subject: `Invitation to join ${org.name} on Enterprise Carpooling`,
        body: `You have been invited to join ${org.name} on the Enterprise Carpooling Platform. Company Code: ${org.company_code}`,
        status: emailResult.success ? 'SENT' : 'FAILED',
        sentAt: emailResult.success ? new Date() : null
      }
    });

    return { success: true, email };
  }

  /**
   * Retrieve organization settings
   * @param {number} orgId
   */
  static async getSettings(orgId) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId }
    });
    if (!org) {
      throw new ApiError(404, 'Organization profile not found');
    }
    return org.settings || {};
  }

  /**
   * Update organization settings
   * @param {number} orgId
   * @param {object} settings
   */
  static async updateSettings(orgId, settings) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId }
    });
    if (!org) {
      throw new ApiError(404, 'Organization profile not found');
    }

    const updatedSettings = {
      ...(org.settings || {}),
      ...settings
    };

    const updated = await prisma.organization.update({
      where: { id: orgId },
      data: {
        settings: updatedSettings
      }
    });

    return updated.settings;
  }
}

export default OrganizationService;
export { OrganizationService };
