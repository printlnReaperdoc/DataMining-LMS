const express = require('express');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { param } = require('express-validator');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const { requireFaculty } = require('../middleware/authorize');
const lessonFilesController = require('../controllers/lessonFiles.controller');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, lessonFilesController.uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]);

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isValidExt = ['.pdf', '.ppt', '.pptx'].includes(ext);
    if (allowedMimeTypes.has(file.mimetype) || isValidExt) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF and PowerPoint (.ppt, .pptx) files are permitted.'));
    }
  }
});

router.post(
  '/upload/:chapterId',
  requireFaculty,
  [param('chapterId').isInt({ min: 1 })],
  validate,
  upload.single('file'),
  lessonFilesController.uploadFile
);

router.get(
  '/:id/download',
  requireAuth,
  [param('id').isInt({ min: 1 })],
  validate,
  lessonFilesController.downloadFile
);

router.delete(
  '/:id',
  requireFaculty,
  [param('id').isInt({ min: 1 })],
  validate,
  lessonFilesController.deleteFile
);

module.exports = router;

