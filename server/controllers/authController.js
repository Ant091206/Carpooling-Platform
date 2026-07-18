import AuthService from '../services/authService.js';
import ApiResponse from '../utils/ApiResponse.js';
import { jwtConfig } from '../config/jwt.js';

class AuthController {
  /**
   * Register a new corporate user
   */
  static register = async (req, res) => {
    const { email, password } = req.body;
    const user = await AuthService.register(req.body);
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
