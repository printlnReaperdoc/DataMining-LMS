const express = require('express');
const requireAuth = require('../middleware/auth');
const coursesController = require('../controllers/courses.controller');

const router = express.Router();

router.get('/current', requireAuth, coursesController.getCurrentCourse);

module.exports = router;

