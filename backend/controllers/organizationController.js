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
   * Get authenticated user's own organization details
   */
  static getOwnOrganization = async (req, res) => {
    const orgId = req.user.organization_id;
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

    const result = await OrganizationService.verifyEmployee(employeeId, orgId);
    return new ApiResponse(200, result, 'Employee verification completed').send(res);
  };
}

export default OrganizationController;
export { OrganizationController };
