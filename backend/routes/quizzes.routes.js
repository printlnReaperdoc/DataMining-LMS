const express = require('express');
const multer = require('multer');
const { param, body } = require('express-validator');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const { requireFaculty } = require('../middleware/authorize');
const quizzesController = require('../controllers/quizzes.controller');

const router = express.Router();
const upload = multer({ dest: 'uploads/temp/' });

router.get(
  '/chapter/:chapterId',
  requireAuth,
  [param('chapterId').isInt({ min: 1 })],
  validate,
  quizzesController.getQuizByChapterId
);

router.post(
  '/chapter/:chapterId/publish',
  requireFaculty,
  [
    param('chapterId').isInt({ min: 1 }),
    body('published').isBoolean().withMessage('Published status must be a boolean')
  ],
  validate,
  quizzesController.publishQuiz
);

router.post(
  '/chapter/:chapterId/reset-default',
  requireFaculty,
  [param('chapterId').isInt({ min: 1 })],
  validate,
  quizzesController.resetDefaultQuiz
);

router.post(
  '/chapter/:chapterId/import',
  requireFaculty,
  [param('chapterId').isInt({ min: 1 })],
  validate,
  upload.single('file'),
  quizzesController.importQuiz
);

module.exports = router;

