import OrganizationService from '../services/organizationService.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

class OrganizationController {
  /**
   * Register a new corporate organization
   */
  static create = async (req, res) => {
    const org = await OrganizationService.registerOrganization(req.body);
    return new ApiResponse(201, org, 'Organization registered successfully').send(res);
  };

  /**
   * Lookup organization by company code (Public)
   */
  static lookup = async (req, res) => {
    const { code } = req.query;
    const org = await OrganizationService.lookupByCompanyCode(code);
    return new ApiResponse(200, org, 'Organization resolved successfully').send(res);
  };

  /**
   * Self-serve company registration with admin account (Public)
   */
  static registerCompany = async (req, res) => {
    const data = await OrganizationService.registerCompanyWithAdmin(req.body);
    return new ApiResponse(201, data, 'Company and administrator registered successfully').send(res);
  };

  /**
   * Get authenticated user's own organization details or list all active organizations
   */
  static getOwnOrganization = async (req, res) => {
    if (req.query.all === 'true' || req.query.list === 'true') {
      const orgs = await OrganizationService.listOrganizations();
      return new ApiResponse(200, orgs, 'Organizations list fetched successfully').send(res);
    }
    const orgId = req.user.organization_id;
    if (!orgId) {
      throw new ApiError(400, 'User is not associated with any organization');
    }
    const org = await OrganizationService.getOrganizationDetails(orgId);
    return new ApiResponse(200, org, 'Organization details fetched successfully').send(res);
  };

  /**
   * Get specific organization details by ID
   */
  static get = async (req, res) => {
    const orgId = parseInt(req.params.id, 10);
    if (isNaN(orgId)) {
      throw new ApiError(400, 'Invalid organization record identifier');
    }

    if (req.user.organization_id !== orgId) {
      throw new ApiError(403, 'Access denied. You do not belong to this organization');
    }

    const org = await OrganizationService.getOrganizationDetails(orgId);
    return new ApiResponse(200, org, 'Organization details fetched successfully').send(res);
  };

  /**
   * Update organization details
   */
  static update = async (req, res) => {
    const orgId = parseInt(req.params.id, 10);
    if (isNaN(orgId)) {
      throw new ApiError(400, 'Invalid organization record identifier');
    }

    if (req.user.role !== 'ADMIN' || req.user.organization_id !== orgId) {
      throw new ApiError(403, 'Access denied. You do not have permissions to modify this organization');
    }

    const updatedOrg = await OrganizationService.updateOrganizationDetails(orgId, req.body);
    return new ApiResponse(200, updatedOrg, 'Organization details updated successfully').send(res);
  };

  /**
   * Soft delete organization (sets status = INACTIVE)
   */
  static delete = async (req, res) => {
    const orgId = parseInt(req.params.id, 10);
    if (isNaN(orgId)) {
      throw new ApiError(400, 'Invalid organization record identifier');
    }

    if (req.user.role !== 'ADMIN' || req.user.organization_id !== orgId) {
      throw new ApiError(403, 'Access denied. You do not have permissions to delete this organization');
    }

    await OrganizationService.deleteOrganization(orgId);
    return new ApiResponse(200, null, 'Organization deleted successfully').send(res);
  };

  /**
   * Get list of employees belonging to a specific organization
   */
  static getEmployees = async (req, res) => {
    const orgId = parseInt(req.params.id, 10);
    if (isNaN(orgId)) {
      throw new ApiError(400, 'Invalid organization record identifier');
    }

    if (req.user.role !== 'ADMIN' || req.user.organization_id !== orgId) {
      throw new ApiError(403, 'Access denied. You do not have permissions to view employees for this organization');
    }

    const employees = await OrganizationService.getOrganizationEmployees(orgId);
    return new ApiResponse(200, employees, 'Employees list fetched successfully').send(res);
  };

  /**
   * Verify if an employee is associated with a specific organization
   */
  static verifyEmployee = async (req, res) => {
    const { employeeId, organizationId } = req.body;
    if (!employeeId || !organizationId) {
      throw new ApiError(400, 'employeeId and organizationId parameters are required');
    }

    const orgId = parseInt(organizationId, 10);
    if (isNaN(orgId)) {
      throw new ApiError(400, 'organizationId must be a valid integer ID');
    }

    if (req.user.role !== 'ADMIN' || req.user.organization_id !== orgId) {
      throw new ApiError(403, 'Access denied. You do not have permissions to verify employees for this organization');
    }

    const result = await OrganizationService.verifyEmployee(employeeId, orgId);
    return new ApiResponse(200, result, 'Employee verification completed').send(res);
  };

  /**
   * Fetch all distinct departments of the organization
   */
  static getDepartments = async (req, res) => {
    let orgId = req.user.organization_id;
    if (req.params.id) {
      const paramOrgId = parseInt(req.params.id, 10);
      if (!isNaN(paramOrgId)) {
        if (req.user.organization_id !== paramOrgId) {
          throw new ApiError(403, 'Access denied. You do not belong to this organization');
        }
        orgId = paramOrgId;
      }
    }

    if (!orgId) {
      throw new ApiError(400, 'User is not associated with any organization');
    }

    const departments = await OrganizationService.getOrganizationDepartments(orgId);
    return new ApiResponse(200, departments, 'Departments list fetched successfully').send(res);
  };

  /**
   * Invite a new employee via email
   */
  static inviteEmployee = async (req, res) => {
    const orgId = req.user.organization_id;
    if (!orgId) {
      throw new ApiError(400, 'User is not associated with any organization');
    }

    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, 'Email address is required');
    }

    const result = await OrganizationService.inviteEmployee(req.user.id, orgId, email);
    return new ApiResponse(200, result, 'Employee invitation sent successfully').send(res);
  };

  /**
   * Fetch settings of the organization
   */
  static getSettings = async (req, res) => {
    let orgId = req.user.organization_id;
    if (req.params.id) {
      const paramOrgId = parseInt(req.params.id, 10);
      if (!isNaN(paramOrgId)) {
        if (req.user.organization_id !== paramOrgId) {
          throw new ApiError(403, 'Access denied. You do not belong to this organization');
        }
        orgId = paramOrgId;
      }
    }

    if (!orgId) {
      throw new ApiError(400, 'User is not associated with any organization');
    }

    const settings = await OrganizationService.getSettings(orgId);
    return new ApiResponse(200, settings, 'Organization settings retrieved successfully').send(res);
  };

  /**
   * Update settings of the organization
   */
  static updateSettings = async (req, res) => {
    let orgId = req.user.organization_id;
    if (req.params.id) {
      const paramOrgId = parseInt(req.params.id, 10);
      if (!isNaN(paramOrgId)) {
        orgId = paramOrgId;
      }
    }

    if (!orgId) {
      throw new ApiError(400, 'User is not associated with any organization');
    }

    if (req.user.role !== 'ADMIN' || req.user.organization_id !== orgId) {
      throw new ApiError(403, 'Access denied. You do not have permissions to modify settings for this organization');
    }

    const updated = await OrganizationService.updateSettings(orgId, req.body);
    return new ApiResponse(200, updated, 'Organization settings updated successfully').send(res);
  };
}

export default OrganizationController;
export { OrganizationController };
