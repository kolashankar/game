/**
 * Validator Utility
 * Provides validation functions for request data
 */

const { body, param, query, validationResult } = require('express-validator');
const { ApiError } = require('./errorHandler');

/**
 * Process validation results
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map(err => ({
    [err.param]: err.msg
  }));

  throw new ApiError(400, 'Validation Error', true, JSON.stringify(extractedErrors));
};

/**
 * User registration validation rules
 */
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores and hyphens'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter'),
  
  validate
];

/**
 * User login validation rules
 */
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate
];

/**
 * Game creation validation rules
 */
const createGameValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Game name must be between 3 and 50 characters'),
  
  body('maxPlayers')
    .optional()
    .isInt({ min: 2, max: 10 })
    .withMessage('Maximum players must be between 2 and 10'),
  
  body('settings')
    .optional()
    .isObject()
    .withMessage('Settings must be an object'),
  
  validate
];

/**
 * Join game validation rules
 */
const joinGameValidation = [
  body('joinCode')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('Join code must be 6 characters')
    .isAlphanumeric()
    .withMessage('Join code must be alphanumeric')
    .toUpperCase(),
  
  body('role')
    .isIn(['Techno Monk', 'Shadow Broker', 'Chrono Diplomat', 'Bio-Smith'])
    .withMessage('Invalid role selected'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Player name must be between 2 and 30 characters'),
  
  validate
];

/**
 * Decision validation rules
 */
const decisionValidation = [
  body('decisionText')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Decision text must be between 10 and 1000 characters'),
  
  body('context')
    .isObject()
    .withMessage('Context must be an object'),
  
  validate
];

/**
 * UUID parameter validation
 */
const uuidParamValidation = [
  param('id')
    .isUUID(4)
    .withMessage('Invalid ID format'),
  
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  createGameValidation,
  joinGameValidation,
  decisionValidation,
  uuidParamValidation
};
