const express = require('express');
const { param, body } = require('express-validator');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const { requireFaculty } = require('../middleware/authorize');
const lessonsController = require('../controllers/lessons.controller');

const router = express.Router();

router.get(
  '/:chapterId',
  requireAuth,
  [param('chapterId').isInt({ min: 1 })],
  validate,
  lessonsController.getLessonByChapterId
);

router.put(
  '/:chapterId',
  requireFaculty,
  [
    param('chapterId').isInt({ min: 1 }),
    body('overview').optional().trim(),
    body('objectives').optional().isArray(),
    body('content').optional().isString(),
    body('keyConcepts').optional().isString(),
    body('slides').optional().isArray()
  ],
  validate,
  lessonsController.updateLesson
);

module.exports = router;

