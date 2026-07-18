import { body } from 'express-validator';

export const updateProfileValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('name is required')
    .isLength({ max: 100 }).withMessage('name must not exceed 100 characters'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('phone is required')
    .isLength({ min: 5, max: 20 }).withMessage('phone must be between 5 and 20 characters'),
  
  body('department')
    .trim()
    .notEmpty().withMessage('department is required')
    .isLength({ max: 100 }).withMessage('department must not exceed 100 characters'),
  
  body('designation')
    .trim()
    .notEmpty().withMessage('designation is required')
    .isLength({ max: 100 }).withMessage('designation must not exceed 100 characters')
];

export const savedPlaceValidator = [
  body('place_name')
    .trim()
    .notEmpty().withMessage('place_name is required')
    .isIn(['Home', 'Office', 'Airport', 'Metro', 'Custom']).withMessage('place_name must be one of: Home, Office, Airport, Metro, Custom'),
  
  body('address')
    .trim()
    .notEmpty().withMessage('address is required')
    .isLength({ max: 255 }).withMessage('address must not exceed 255 characters'),
  
  body('latitude')
    .notEmpty().withMessage('latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('latitude must be a valid float value between -90 and 90'),
  
  body('longitude')
    .notEmpty().withMessage('longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('longitude must be a valid float value between -180 and 180'),
  
  body('is_default')
    .optional()
    .isInt({ min: 0, max: 1 }).withMessage('is_default must be either 0 or 1')
];

export default {
  updateProfileValidator,
  savedPlaceValidator
};
