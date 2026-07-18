import { body, query } from 'express-validator';

export const createOrganizationValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Company name is required')
    .isLength({ max: 150 }).withMessage('Company name must not exceed 150 characters'),
  
  body('company_code')
    .trim()
    .notEmpty().withMessage('Company code is required')
    .isAlphanumeric().withMessage('Company code must contain only alphanumeric characters')
    .isLength({ min: 3, max: 50 }).withMessage('Company code must be between 3 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Company email is required')
    .isEmail().withMessage('Must be a valid email address')
    .isLength({ max: 100 }).withMessage('Company email must not exceed 100 characters'),
  
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 20 }).withMessage('Phone number must be between 5 and 20 characters'),
  
  body('website')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL().withMessage('Must be a valid URL link')
    .isLength({ max: 255 }).withMessage('Website URL must not exceed 255 characters'),
  
  body('address')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
];

export const updateOrganizationValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Company name cannot be empty')
    .isLength({ max: 150 }).withMessage('Company name must not exceed 150 characters'),
  
  body('email')
    .optional()
    .trim()
    .notEmpty().withMessage('Company email cannot be empty')
    .isEmail().withMessage('Must be a valid email address')
    .isLength({ max: 100 }).withMessage('Company email must not exceed 100 characters'),
  
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 20 }).withMessage('Phone number must be between 5 and 20 characters'),
  
  body('website')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL().withMessage('Must be a valid URL link'),
  
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE')
];

export const lookupOrganizationValidator = [
  query('code')
    .trim()
    .notEmpty().withMessage('Company code is required')
    .isAlphanumeric().withMessage('Company code must contain only alphanumeric characters')
    .isLength({ min: 3, max: 50 }).withMessage('Company code must be between 3 and 50 characters')
];

export const registerCompanyValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Company name is required')
    .isLength({ max: 150 }).withMessage('Company name must not exceed 150 characters'),
  
  body('company_code')
    .trim()
    .notEmpty().withMessage('Company code is required')
    .isAlphanumeric().withMessage('Company code must contain only alphanumeric characters')
    .isLength({ min: 3, max: 50 }).withMessage('Company code must be between 3 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Company email is required')
    .isEmail().withMessage('Must be a valid email address')
    .isLength({ max: 100 }).withMessage('Company email must not exceed 100 characters'),
  
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 20 }).withMessage('Phone number must be between 5 and 20 characters'),
  
  body('website')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL().withMessage('Must be a valid URL link')
    .isLength({ max: 255 }).withMessage('Website URL must not exceed 255 characters'),
  
  body('address')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body('admin_name')
    .trim()
    .notEmpty().withMessage('Admin name is required')
    .isLength({ max: 100 }).withMessage('Admin name must not exceed 100 characters'),

  body('admin_email')
    .trim()
    .notEmpty().withMessage('Admin email is required')
    .isEmail().withMessage('Must be a valid email address')
    .isLength({ max: 100 }).withMessage('Admin email must not exceed 100 characters'),

  body('admin_password')
    .notEmpty().withMessage('Admin password is required')
    .isLength({ min: 8 }).withMessage('Admin password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Admin password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Admin password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Admin password must contain at least one number')
    .matches(/[^A-Za-z0-9]/).withMessage('Admin password must contain at least one special character'),

  body('admin_phone')
    .trim()
    .notEmpty().withMessage('Admin phone number is required')
    .isLength({ min: 5, max: 20 }).withMessage('Admin phone number must be between 5 and 20 characters')
];

export default {
  createOrganizationValidator,
  updateOrganizationValidator,
  lookupOrganizationValidator,
  registerCompanyValidator
};
