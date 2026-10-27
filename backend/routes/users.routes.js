const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { requireFaculty } = require('../middleware/authorize');
const usersController = require('../controllers/users.controller');

const router = express.Router();

router.get('/', requireFaculty, usersController.getUsers);

router.post(
  '/faculty',
  requireFaculty,
  (req, res, next) => {
    if (!req.body.password) {
      req.body.password = '0829';
    }
    next();
  },
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9._@-]+$/)
      .withMessage('Username must be 3-50 characters alphanumeric (allowed: . _ - @)'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ max: 128 })
      .withMessage('Password cannot exceed 128 characters'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('surname').trim().notEmpty().withMessage('Surname is required')
  ],
  validate,
  usersController.createFacultyAccount
);

router.patch(
  '/:id/status',
  requireFaculty,
  [
    param('id').isInt({ min: 1 }),
    body('isActive').isBoolean().withMessage('isActive must be a boolean')
  ],
  validate,
  usersController.toggleUserStatus
);

module.exports = router;

