const express = require('express');
const { requireFaculty } = require('../middleware/authorize');
const auditController = require('../controllers/audit.controller');

const router = express.Router();

router.get('/', requireFaculty, auditController.getLogs);

module.exports = router;

