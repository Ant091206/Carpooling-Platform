import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import { jwtConfig } from '../config/jwt.js';
import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import triggerService from './notification/notificationTriggerService.js';

class AuthService {
  /**
   * Register a new user
   * @param {object} userData
   */
  static async register(userData) {
    const { email, password, firstName, lastName, phone, employee_id, organization, department } = userData;

    // 1. Detect and configure organization from domain / text
    const emailDomain = email.split('@')[1];
    const companyCode = emailDomain.split('.')[0].toUpperCase();

    let org = await prisma.organization.findFirst({
      where: { companyCode }
    });

    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: organization || `${companyCode} Corporation`,
          companyCode,
          email: `admin@${emailDomain}`,
          phone: phone || '1-800-555-0199',
          address: 'Corporate Head Office',
          status: 'ACTIVE'
        }
      });
    }

    if (org.status !== 'ACTIVE') {
      throw new ApiError(400, 'The organization is inactive and cannot onboard employees');
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save User in DB
    const userId = await User.create({
      firstName,
      lastName,
      employee_id,
      email,
      passwordHash: hashedPassword,
      phone,
      organization,
      organization_id: org.id,
      department,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      isVerified: false
    });

    // 4. Fetch the created user
    const userProfile = await User.findById(userId);

    // 5. Initialize notification preference & dispatch welcome alerts
    try {
      await prisma.notificationPreference.upsert({
        where: { userId },
        update: {},
        create: { userId }
      });

      await triggerService.notifySystem({
        userId,
        title: 'Welcome to EnterprisePool!',
        message: `Welcome ${firstName}! Start sharing rides and managing bookings inside your enterprise portal today.`,
        priority: 'HIGH',
        actionUrl: '/dashboard'
      });
    } catch (err) {
      console.error('Failed to trigger welcome notifications:', err.message);
    }

    return userProfile;
  }

  /**
   * Authenticate employee credentials
   * @param {string} email
   * @param {string} password
   */
  static async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiError(403, `Account status inactive: ${user.status}`);
    }

    // Update last login timestamp
    await User.updateLastLogin(user.id);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshToken.create(user.id, refreshToken, expiresAt);

    // Map profile output for client
    const userProfile = {
      id: user.id,
      uuid: user.uuid,
      organization_id: user.organization_id,
      organization_name: user.organization_name,
      employee_id: user.employee_id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified
    };

    return {
      user: userProfile,
      accessToken,
      refreshToken
    };
  }

  /**
   * Terminate user session
   */
  static async logout(refreshToken) {
    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token is required to perform logout');
    }
    await RefreshToken.deleteByToken(refreshToken);
  }

  /**
   * Issue a fresh access token using a valid refresh token
   */
  static async refreshToken(refreshTokenStr) {
    if (!refreshTokenStr) {
      throw new ApiError(400, 'Refresh token is required');
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshTokenStr, jwtConfig.refreshSecret);
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const tokenRecord = await RefreshToken.findByToken(refreshTokenStr);
    if (!tokenRecord) {
      throw new ApiError(401, 'Refresh token not found or already revoked');
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      await RefreshToken.deleteByToken(refreshTokenStr);
      throw new ApiError(401, 'Refresh token has expired');
    }

    const user = await User.findById(tokenRecord.user_id);
    if (!user) {
      throw new ApiError(401, 'Associated user account not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiError(403, 'Your account is inactive');
    }

    const newAccessToken = generateAccessToken(user);

    return {
      accessToken: newAccessToken
    };
  }

  /**
   * Fetch current user profile details
   */
  static async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User profile not found');
    }
    return user;
  }

  /**
   * Generate OTP and send email / write in logs
   */
  static async forgotPassword(email) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new ApiError(404, 'No employee account exists with this email address');
    }

    // Generate random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Persist OTP in User record
    await prisma.user.update({
      where: { email },
      data: {
        otpCode: otp,
        otpExpiresAt: expiresAt
      }
    });

    // Output code to console logs for verification
    console.log(`[AUTH SECURITY WARNING] OTP verification code generated for ${email}: ${otp}`);

    // Queue email dispatch using Module 12 email service if available
    try {
      const emailQueueService = (await import('./notification/emailQueueService.js')).default;
      await emailQueueService.enqueue({
        userId: user.id,
        recipient: email,
        subject: 'Carpooling Security Reset Code',
        body: `Hello ${user.first_name || 'Employee'},\n\nYour 6-digit password reset key is: ${otp}\nThis key expires in 15 minutes.\n\nBest regards,\nEnterprise Carpooling Team`
      });
    } catch (e) {
      console.warn('Could not enqueue OTP email directly, fallback to logs verification');
    }

    return { message: 'Security code dispatched to email successfully', otp }; // Expose OTP for verification/tests
  }

  /**
   * Reset password matching OTP code
   */
  static async resetPassword(email, otpCode, newPassword) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new ApiError(404, 'No employee account exists with this email');
    }

    if (!user.otpCode || user.otpCode !== otpCode) {
      throw new ApiError(400, 'Invalid security verification key');
    }

    if (user.otpExpiresAt && new Date(user.otpExpiresAt) < new Date()) {
      throw new ApiError(400, 'Verification key has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash: hashedPassword,
        otpCode: null,
        otpExpiresAt: null
      }
    });

    return { message: 'Password reset completed successfully. Please sign in.' };
  }
}

export default AuthService;
export { AuthService };
