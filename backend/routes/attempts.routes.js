const express = require('express');
const { param, body } = require('express-validator');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const attemptsController = require('../controllers/attempts.controller');

const router = express.Router();

router.post(
  '/start/:quizId',
  requireAuth,
  [param('quizId').isInt({ min: 1 })],
  validate,
  attemptsController.startAttempt
);

router.post(
  '/submit/:attemptId',
  requireAuth,
  [
    param('attemptId').isInt({ min: 1 }),
    body('answers').optional().isArray()
  ],
  validate,
  attemptsController.submitAttempt
);

router.get(
  '/my-history/:chapterId',
  requireAuth,
  [param('chapterId').isInt({ min: 1 })],
  validate,
  attemptsController.getMyAttemptsForChapter
);

router.get(
  '/:attemptId',
  requireAuth,
  [param('attemptId').isInt({ min: 1 })],
  validate,
  attemptsController.getAttemptDetails
);

module.exports = router;

