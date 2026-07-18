import { body } from 'express-validator';

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
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']).withMessage('Status must be ACTIVE, INACTIVE, or SUSPENDED')
];

export default {
  createOrganizationValidator,
  updateOrganizationValidator
};
