const express = require('express');
const { param } = require('express-validator');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const { requireFaculty } = require('../middleware/authorize');
const exportsController = require('../controllers/exports.controller');

const router = express.Router();

router.get(
  '/topic/:chapterId/:format',
  requireFaculty,
  [
    param('chapterId').isInt({ min: 1 }),
    param('format').isIn(['csv', 'xlsx', 'pdf'])
  ],
  validate,
  exportsController.exportTopicGradebook
);

router.get(
  '/master/:format',
  requireFaculty,
  [param('format').isIn(['csv', 'xlsx', 'pdf'])],
  validate,
  exportsController.exportMasterGradebook
);

router.get(
  '/my-summary/:format',
  requireAuth,
  [param('format').isIn(['pdf', 'csv', 'xlsx'])],
  validate,
  exportsController.exportMySummary
);

module.exports = router;

