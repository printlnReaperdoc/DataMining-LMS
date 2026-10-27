const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const { canAccessChapter } = require('../services/progress.service');
const { auditLog } = require('../services/audit.service');

const uploadDir = path.resolve(__dirname, '..', 'storage', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

async function uploadFile(req, res, next) {
  try {
    const chapterId = Number(req.params.chapterId);
    if (!req.file) {
      return res.status(400).json({ error: 'No valid file uploaded. Accepted formats: PDF, PPT, PPTX (max 15MB).' });
    }

    const { originalname, filename, path: tempPath, mimetype, size } = req.file;

    const [result] = await pool.execute(
      `INSERT INTO lesson_files (chapter_id, original_filename, stored_filename, storage_path, mime_type, file_size, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [chapterId, originalname, filename, filename, mimetype, size, req.session.user.id]
    );

    await auditLog({
      req,
      action: 'upload_lesson_file',
      entityType: 'lesson_file',
      entityId: result.insertId,
      details: {
        chapterId,
        filename: originalname,
        sizeBytes: size,
        mimeType: mimetype
      }
    });

    res.status(201).json({
      message: 'Lesson material uploaded successfully',
      fileId: result.insertId,
      filename: originalname
    });
  } catch (error) {
    if (req.file) {
      fs.rmSync(path.join(uploadDir, req.file.filename), { force: true });
    }
    next(error);
  }
}

async function downloadFile(req, res, next) {
  try {
    const fileId = Number(req.params.id);
    const user = req.session.user;

    const [rows] = await pool.execute(
      `SELECT lf.*, c.chapter_number
       FROM lesson_files lf
       JOIN chapters c ON c.id = lf.chapter_id
       WHERE lf.id = ?`,
      [fileId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'File record not found' });
    }

    const file = rows[0];

    // Check sequential access permissions
    const access = await canAccessChapter(user.id, user.role, file.chapter_id);
    if (!access.allowed) {
      return res.status(403).json({ error: 'Access denied: You have not unlocked this chapter yet' });
    }

    const filePath = path.join(uploadDir, file.stored_filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File was deleted from server storage' });
    }

    res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.original_filename)}"`);
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
}

async function deleteFile(req, res, next) {
  try {
    const fileId = Number(req.params.id);
    const [rows] = await pool.execute(
      `SELECT * FROM lesson_files WHERE id = ?`,
      [fileId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = rows[0];
    const filePath = path.join(uploadDir, file.stored_filename);
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { force: true });
    }

    await pool.execute(`DELETE FROM lesson_files WHERE id = ?`, [fileId]);

    await auditLog({
      req,
      action: 'delete_lesson_file',
      entityType: 'lesson_file',
      entityId: fileId,
      details: {
        filename: file.original_filename,
        chapterId: file.chapter_id
      }
    });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadFile,
  downloadFile,
  deleteFile,
  uploadDir
};

