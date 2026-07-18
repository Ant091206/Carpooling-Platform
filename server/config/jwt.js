import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  accessSecret: process.env.JWT_SECRET || 'super_secret_carpooling_access_token_key_7788',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'super_secret_carpooling_refresh_token_key_9900',
  accessExpiration: '15m',
  refreshExpiration: '7d',
  
  // Cookie setting configuration for the refresh token
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  }
};

export default jwtConfig;
