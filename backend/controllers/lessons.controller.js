const { pool } = require('../config/db');
const { auditLog } = require('../services/audit.service');

async function getLessonByChapterId(req, res, next) {
  try {
    const chapterId = Number(req.params.chapterId);
    const [rows] = await pool.execute(
      `SELECT l.*, c.title AS chapter_title, c.chapter_number
       FROM lessons l
       JOIN chapters c ON c.id = l.chapter_id
       WHERE l.chapter_id = ?`,
      [chapterId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const lesson = rows[0];
    res.json({
      lesson: {
        id: lesson.id,
        chapterId: lesson.chapter_id,
        chapterTitle: lesson.chapter_title,
        chapterNumber: lesson.chapter_number,
        overview: lesson.overview,
        objectives: typeof lesson.learning_objectives === 'string'
          ? JSON.parse(lesson.learning_objectives)
          : lesson.learning_objectives,
        content: lesson.content,
        keyConcepts: lesson.key_concepts,
        slides: typeof lesson.slides_json === 'string'
          ? JSON.parse(lesson.slides_json)
          : lesson.slides_json,
        updatedAt: lesson.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
}

async function updateLesson(req, res, next) {
  try {
    const chapterId = Number(req.params.chapterId);
    const { overview, objectives, content, keyConcepts, slides } = req.body;

    const [existing] = await pool.execute(
      `SELECT * FROM lessons WHERE chapter_id = ?`,
      [chapterId]
    );

    const prevLesson = existing[0] || null;

    const objectivesJson = objectives ? JSON.stringify(objectives) : null;
    const slidesJson = slides ? JSON.stringify(slides) : null;

    if (prevLesson) {
      await pool.execute(
        `UPDATE lessons
         SET overview = COALESCE(?, overview),
             learning_objectives = COALESCE(?, learning_objectives),
             content = COALESCE(?, content),
             key_concepts = COALESCE(?, key_concepts),
             slides_json = COALESCE(?, slides_json),
             updated_by = ?
         WHERE chapter_id = ?`,
        [overview, objectivesJson, content, keyConcepts, slidesJson, req.session.user.id, chapterId]
      );
    } else {
      await pool.execute(
        `INSERT INTO lessons (chapter_id, overview, learning_objectives, content, key_concepts, slides_json, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [chapterId, overview || '', objectivesJson || '[]', content || '', keyConcepts || '', slidesJson || '[]', req.session.user.id]
      );
    }

    await auditLog({
      req,
      action: 'update_lesson',
      entityType: 'lesson',
      entityId: chapterId,
      details: {
        chapterId,
        updatedFields: {
          overview: overview !== undefined,
          objectives: objectives !== undefined,
          content: content !== undefined,
          keyConcepts: keyConcepts !== undefined,
          slides: slides !== undefined
        }
      }
    });

    res.json({ message: 'Lesson content saved successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLessonByChapterId,
  updateLesson
};

