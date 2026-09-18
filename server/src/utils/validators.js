const { body, query, validationResult, param } = require('express-validator');
const Client = require('../models/Client');

// Reads the result of any express-validator chain and short-circuits
// the request with a 400 if something failed validation.
function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: result.array().map((e) => e.msg),
    });
  }
  next();
}

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firm').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const clientRules = [
  body('name').trim().notEmpty().withMessage('Client name is required'),
  body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('phone')
    .trim()
    .matches(/^[+]?[\d\s-]{7,15}$/)
    .withMessage('Enter a valid phone number'),
  body('netWorth')
    .isFloat({ min: 0 })
    .withMessage('Net worth must be a positive number'),
  body('category')
    .isIn(Client.CATEGORIES)
    .withMessage(`Category must be one of: ${Client.CATEGORIES.join(', ')}`),
  body('primaryAssetClass').trim().notEmpty().withMessage('Primary asset class is required'),
  body('interests').optional().isArray().withMessage('Interests must be a list of tags'),
  body('interests.*').optional().isString().trim(),
  body('onboardingDate')
    .isISO8601()
    .withMessage('Onboarding date must be a valid date'),
];

// PUT allows partial updates, so nothing is required — only checked when present.
const clientUpdateRules = [
  body('name').optional().trim().notEmpty().withMessage('Client name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s-]{7,15}$/)
    .withMessage('Enter a valid phone number'),
  body('netWorth').optional().isFloat({ min: 0 }).withMessage('Net worth must be a positive number'),
  body('category')
    .optional()
    .isIn(Client.CATEGORIES)
    .withMessage(`Category must be one of: ${Client.CATEGORIES.join(', ')}`),
  body('primaryAssetClass').optional().trim().notEmpty(),
  body('interests').optional().isArray().withMessage('Interests must be a list of tags'),
  body('interests.*').optional().isString().trim(),
  body('onboardingDate').optional().isISO8601().withMessage('Onboarding date must be a valid date'),
];

const idParamRule = [param('id').isMongoId().withMessage('Invalid client id')];

const listQueryRules = [
  query('search').optional().trim(),
  query('category').optional().isIn(['HNI', 'UHNI', 'All']),
  query('sortBy').optional().isIn(['netWorth', 'name', 'onboardingDate']),
  query('order').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  clientRules,
  clientUpdateRules,
  idParamRule,
  listQueryRules,
};
