// middleware/validators.js - Request validation middleware
const { body, validationResult } = require('express-validator');

// Validate registration request
exports.validateRegistration = [
  // Name validation: Min 20 characters, Max 60 characters
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 20 }).withMessage('Name must be at least 20 characters')
    .isLength({ max: 60 }).withMessage('Name cannot exceed 60 characters'),
  
  // Email validation
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  
  // Address validation: Max 400 characters
  body('address')
    .notEmpty().withMessage('Address is required')
    .isLength({ max: 400 }).withMessage('Address cannot exceed 400 characters'),
  
  // Password validation: 8-16 characters, one uppercase, one special character
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 16 }).withMessage('Password must be 8-16 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character'),
  
  // Validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validate login request
exports.validateLogin = [
  // Email validation
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  
  // Password validation
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  // Validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    next();
  }
];

