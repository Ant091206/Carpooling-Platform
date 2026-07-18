import AuthService from '../services/authService.js';
import ApiResponse from '../utils/ApiResponse.js';
import { jwtConfig } from '../config/jwt.js';
import { prisma } from '../config/db.js';

class AuthController {
  /**
   * Register a new corporate user with auto-organization detection and vehicle onboarding
   */
  static register = async (req, res) => {
    const { email, password, name, phone, employee_id, own_vehicle, vehicle_number, vehicle_type } = req.body;

    // Detect company from email domain
    const emailDomain = email.split('@')[1];
    const companyCode = emailDomain.split('.')[0].toUpperCase(); // e.g. GOOGLE or TCS

    // Find or create organization on-the-fly
    let org = await prisma.organization.findFirst({
      where: { companyCode }
    });

    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: `${companyCode} Corp`,
          companyCode,
          email: `admin@${emailDomain}`,
          phone: phone || '1-800-555-0199',
          address: 'Corporate Workspace Office',
          status: 'ACTIVE'
        }
      });
    }

    // Map fields for standard AuthService registration
    const userData = {
      organization_id: org.id,
      employee_id: employee_id || `EMP-${Date.now()}`,
      name,
      email,
      password,
      phone: phone || '9999999999',
      role: 'EMPLOYEE',
      department: 'Corporate Commute',
      designation: 'Associate'
    };

    const user = await AuthService.register(userData);

    // Register vehicle if owns_vehicle is checked in Step 2
    if (own_vehicle === 'yes' || own_vehicle === true) {
      await prisma.vehicle.create({
        data: {
          userId: user.id,
          vehicleName: `${vehicle_type || 'Electric'} Car`,
          brand: 'Generic',
          model: vehicle_type || 'Commuter Sedan',
          plateNumber: vehicle_number || `REG-${Date.now()}`,
          fuelType: 'Electric',
          seatCapacity: 4,
          isDefault: true
        }
      });
    }

    // Execute standard login handshake to retrieve credentials
    const { accessToken, refreshToken } = await AuthService.login(email, password);

    // Set refresh token inside an HTTP-only secure cookie
    res.cookie('refreshToken', refreshToken, jwtConfig.cookieOptions);

    return new ApiResponse(201, { user, accessToken }, 'User registered successfully').send(res);
  };

  /**
   * Login credentials and issue access + refresh tokens
   */
  static login = async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await AuthService.login(email, password);

    // Set refresh token inside an HTTP-only secure cookie
    res.cookie('refreshToken', refreshToken, jwtConfig.cookieOptions);

    return new ApiResponse(200, { user, accessToken }, 'Login successful').send(res);
  };

  /**
   * Logout user and invalidate refresh token
   */
  static logout = async (req, res) => {
    // Resolve token from cookie or request payload fallback
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    // Clear client cookie
    res.clearCookie('refreshToken', {
      ...jwtConfig.cookieOptions,
      maxAge: 0
    });

    return new ApiResponse(200, null, 'Logged out successfully').send(res);
  };

  /**
   * Generate new access token using stored refresh token
   */
  static refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const { accessToken } = await AuthService.refreshToken(refreshToken);

    return new ApiResponse(200, { accessToken }, 'Access token refreshed successfully').send(res);
  };

  /**
   * Fetch details of currently logged-in user profile
   */
  static me = async (req, res) => {
    const user = await AuthService.getCurrentUser(req.user.id);
    return new ApiResponse(200, user, 'User profile fetched successfully').send(res);
  };
}

export default AuthController;
export { AuthController };
