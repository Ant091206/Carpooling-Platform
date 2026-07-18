import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

/**
 * Generate Access Token
 * @param {object} user User payload keys
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id
    },
    jwtConfig.accessSecret,
    {
      expiresIn: jwtConfig.accessExpiration
    }
  );
};

/**
 * Generate Refresh Token
 * @param {object} user User payload keys
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id
    },
    jwtConfig.refreshSecret,
    {
      expiresIn: jwtConfig.refreshExpiration
    }
  );
};

export default {
  generateAccessToken,
  generateRefreshToken
};
