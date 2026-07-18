import { body } from 'express-validator';
import prisma from '../config/db.js';

export const registerValidator = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name must not exceed 50 characters'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name must not exceed 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Company email is required')
    .isEmail().withMessage('Must be a valid email address')
    .isLength({ max: 100 }).withMessage('Email must not exceed 100 characters')
    .custom(async (value) => {
      const user = await prisma.user.findUnique({
        where: { email: value }
      });
      if (user) {
        throw new Error('Email address is already registered by another employee');
      }
      return true;
    }),

  body('employee_id')
    .trim()
    .notEmpty().withMessage('Employee ID is required')
    .isLength({ max: 50 }).withMessage('Employee ID must not exceed 50 characters')
    .custom(async (value, { req }) => {
      const orgName = req.body.organization || '';
      const user = await prisma.user.findFirst({
        where: {
          employeeId: value,
          organization: orgName
        }
      });
      if (user) {
        throw new Error('Employee ID is already registered for this organization');
      }
      return true;
    }),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isLength({ min: 5, max: 20 }).withMessage('Phone number must be between 5 and 20 characters'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character'),

  body('confirmPassword')
    .notEmpty().withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  body('organization')
    .trim()
    .notEmpty().withMessage('Company/organization name is required')
    .isLength({ max: 150 }).withMessage('Organization name must not exceed 150 characters'),

  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Department name must not exceed 100 characters'),

  body('terms')
    .custom((value) => {
      if (value !== true && value !== 'true') {
        throw new Error('You must accept the terms and conditions');
      }
      return true;
    })
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Company email is required')
    .isEmail().withMessage('Must be a valid email address'),

  body('password')
    .notEmpty().withMessage('Password is required')
];

export default {
  registerValidator,
  loginValidator
};
