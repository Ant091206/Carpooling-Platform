import { body } from 'express-validator';

export const vehicleValidator = [
  body('model')
    .trim()
    .notEmpty().withMessage('Vehicle model is required')
    .isLength({ max: 100 }).withMessage('Vehicle model must not exceed 100 characters'),
  
  body('plate_number')
    .trim()
    .notEmpty().withMessage('License plate number is required')
    .isLength({ max: 50 }).withMessage('License plate number must not exceed 50 characters'),
  
  body('color')
    .trim()
    .notEmpty().withMessage('Vehicle color is required')
    .isLength({ max: 50 }).withMessage('Vehicle color must not exceed 50 characters'),
  
  body('capacity')
    .notEmpty().withMessage('Vehicle capacity is required')
    .isInt({ min: 1, max: 20 }).withMessage('Vehicle capacity must be an integer between 1 and 20'),
  
  body('type')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Vehicle type description must not exceed 50 characters')
];

export default {
  vehicleValidator
};
