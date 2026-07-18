import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import { jwtConfig } from '../config/jwt.js';
import ApiError from '../utils/ApiError.js';

class AuthService {
  /**
   * Register a new user
   * @param {object} userData
   */
  static async register(userData) {
    // 1. Verify organization exists in database
    const org = await Organization.findById(userData.organization_id);
    if (!org) {
      throw new ApiError(404, `Organization with ID ${userData.organization_id} does not exist`);
    }

    if (org.status !== 'ACTIVE') {
      throw new ApiError(400, 'The organization is inactive and cannot register new employees');
    }

    // 2. Check email uniqueness
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw new ApiError(400, 'Email address is already registered by another employee');
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 4. Save User
    const userId = await User.create({
      ...userData,
      password: hashedPassword
    });

    // 5. Fetch and return created user (excluding password)
    const userProfile = await User.findById(userId);
    return userProfile;
  }

  /**
   * Authenticate employee credentials
   * @param {string} email
   * @param {string} password
   */
  static async login(email, password) {
    // 1. Find user by email (includes password checks)
    const user = await User.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // 2. Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // 3. Ensure user account status is ACTIVE
    if (user.status !== 'ACTIVE') {
      throw new ApiError(403, `Account cannot log in. Current status: ${user.status}`);
    }

    // 4. Update last login timestamp
    await User.updateLastLogin(user.id);

    // 5. Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 6. Calculate refresh token expiration date (7 days from now)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 7. Save refresh token inside DB
    await RefreshToken.create(user.id, refreshToken, expiresAt);

    // Clean user profile payload before response return (remove hashed password)
    const userProfile = {
      id: user.id,
      organization_id: user.organization_id,
      organization_name: user.organization_name,
      employee_id: user.employee_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      designation: user.designation,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      last_login: user.last_login
    };

    return {
      user: userProfile,
      accessToken,
      refreshToken
    };
  }

  /**
   * Terminate user session and invalidate token
   * @param {string} refreshToken
   */
  static async logout(refreshToken) {
    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token is required to perform logout');
    }
    
    // Remove token record from MySQL database
    await RefreshToken.deleteByToken(refreshToken);
  }

  /**
   * Request a fresh access token using a valid refresh token
   * @param {string} refreshTokenStr
   */
  static async refreshToken(refreshTokenStr) {
    if (!refreshTokenStr) {
      throw new ApiError(400, 'Refresh token is required');
    }

    // 1. Verify token structure signature
    let decoded;
    try {
      decoded = jwt.verify(refreshTokenStr, jwtConfig.refreshSecret);
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    // 2. Query token record from database
    const tokenRecord = await RefreshToken.findByToken(refreshTokenStr);
    if (!tokenRecord) {
      throw new ApiError(401, 'Refresh token not found or already revoked');
    }

    // 3. Confirm database record is not past expiration date
    if (new Date(tokenRecord.expires_at) < new Date()) {
      // Invalidate the record
      await RefreshToken.deleteByToken(refreshTokenStr);
      throw new ApiError(401, 'Refresh token has expired');
    }

    // 4. Retrieve associated user profile
    const user = await User.findById(tokenRecord.user_id);
    if (!user) {
      throw new ApiError(401, 'Associated employee user account not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiError(403, 'Your account status is currently not ACTIVE');
    }

    // 5. Generate a brand new access token
    const newAccessToken = generateAccessToken(user);

    return {
      accessToken: newAccessToken
    };
  }

  /**
   * Get user profile details by ID
   * @param {number} userId
   */
  static async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User profile not found');
    }
    return user;
  }
}

export default AuthService;
export { AuthService };
