const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

router.get('/csrf', authController.getCsrfToken);

router.post(
  '/register',
  authLimiter,
  (req, res, next) => {
    // If password is blank or omitted, default both to '0829'
    if (!req.body.password && !req.body.confirmPassword) {
      req.body.password = '0829';
      req.body.confirmPassword = '0829';
    }
    next();
  },
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9._@-]+$/)
      .withMessage('Username can only contain alphanumeric characters, dots, underscores, hyphens, and @ (no spaces)'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ max: 128 })
      .withMessage('Password cannot exceed 128 characters'),
    body('confirmPassword')
      .notEmpty()
      .withMessage('Confirm password is required'),
    body('firstName')
      .trim()
      .isLength({ min: 1, max: 80 })
      .withMessage('First name is required'),
    body('surname')
      .trim()
      .isLength({ min: 1, max: 80 })
      .withMessage('Surname is required')
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  authController.login
);

router.post('/logout', requireAuth, authController.logout);

router.get('/me', requireAuth, authController.getMe);

module.exports = router;

