import AuthService from '../services/authService.js';
import ApiResponse from '../utils/ApiResponse.js';
import { jwtConfig } from '../config/jwt.js';

class AuthController {
  /**
   * Register a new corporate user
   */
  static register = async (req, res) => {
    const {
      firstName,
      lastName,
      employee_id,
      email,
      phone,
      password,
      organization,
      department
    } = req.body;

    const user = await AuthService.register({
      firstName,
      lastName,
      employee_id,
      email,
      phone,
      password,
      organization,
      department
    });

    // Execute standard login handshake
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
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

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

  /**
   * Request OTP code for forgot password
   */
  static forgotPassword = async (req, res) => {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);
    return new ApiResponse(200, result, 'Security key dispatched successfully').send(res);
  };

  /**
   * Verify OTP and reset password
   */
  static resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;
    const result = await AuthService.resetPassword(email, otp, password);
    return new ApiResponse(200, result, 'Password reset completed successfully').send(res);
  };
}

export default AuthController;
export { AuthController };
