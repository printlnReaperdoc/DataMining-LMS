const express = require('express');
const { param, body } = require('express-validator');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const { requireFaculty } = require('../middleware/authorize');
const chaptersController = require('../controllers/chapters.controller');

const router = express.Router();

router.get(
  '/:id',
  requireAuth,
  [param('id').isInt({ min: 1 }).withMessage('Valid chapter ID is required')],
  validate,
  chaptersController.getChapterById
);

router.put(
  '/:id',
  requireFaculty,
  [
    param('id').isInt({ min: 1 }).withMessage('Valid chapter ID is required'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim(),
    body('isPublished').optional().isBoolean()
  ],
  validate,
  chaptersController.updateChapter
);

module.exports = router;

