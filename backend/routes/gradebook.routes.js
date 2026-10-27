const express = require('express');
const { param, body } = require('express-validator');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const { requireFaculty } = require('../middleware/authorize');
const gradebookController = require('../controllers/gradebook.controller');

const router = express.Router();

router.get(
  '/topic/:chapterId',
  requireFaculty,
  [param('chapterId').isInt({ min: 1 })],
  validate,
  gradebookController.getTopicGradebook
);

router.get(
  '/topic/:chapterId/student/:studentId/attempts',
  requireFaculty,
  [
    param('chapterId').isInt({ min: 1 }),
    param('studentId').isInt({ min: 1 })
  ],
  validate,
  gradebookController.getStudentAttemptsForTopic
);

router.get('/master', requireFaculty, gradebookController.getMasterGradebook);

router.get('/my-summary', requireAuth, gradebookController.getMySummary);

router.post(
  '/override',
  requireFaculty,
  [
    body('studentId').isInt({ min: 1 }).withMessage('Valid student ID is required'),
    body('chapterId').isInt({ min: 1 }).withMessage('Valid chapter ID is required'),
    body('newStatus').isIn(['locked', 'available', 'passed', 'failed']).withMessage('Status must be locked, available, passed, or failed'),
    body('reason').trim().notEmpty().withMessage('Override reason is required')
  ],
  validate,
  gradebookController.overrideStudentProgress
);

module.exports = router;

