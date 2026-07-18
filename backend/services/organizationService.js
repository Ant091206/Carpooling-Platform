import Organization from '../models/Organization.js';
import ApiError from '../utils/ApiError.js';

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
}

export default OrganizationService;
export { OrganizationService };
