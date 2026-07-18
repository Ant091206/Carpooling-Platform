import { body } from 'express-validator';

export const registerValidator = [
  body('organization_id')
    .optional()
    .isInt({ min: 1 }).withMessage('organization_id must be a valid integer ID'),
  
  body('employee_id')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('employee_id must not exceed 50 characters'),
  
  body('name')
    .trim()
    .notEmpty().withMessage('name is required')
    .isLength({ max: 100 }).withMessage('name must not exceed 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('email is required')
    .isEmail().withMessage('Must be a valid email address')
    .isLength({ max: 100 }).withMessage('email must not exceed 100 characters'),
  
  body('password')
    .notEmpty().withMessage('password is required')
    .isLength({ min: 8 }).withMessage('password must be at least 8 characters long'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('phone is required')
    .isLength({ min: 5, max: 20 }).withMessage('phone must be between 5 and 20 characters'),

  body('role')
    .optional()
    .isIn(['ADMIN', 'EMPLOYEE']).withMessage('role must be either ADMIN or EMPLOYEE'),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('department must not exceed 100 characters'),
  
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('designation must not exceed 100 characters')
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('email is required')
    .isEmail().withMessage('Must be a valid email address'),
  
  body('password')
    .notEmpty().withMessage('password is required')
];

export default {
  registerValidator,
  loginValidator
};
