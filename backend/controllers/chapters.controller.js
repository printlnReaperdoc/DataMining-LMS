const { pool } = require('../config/db');
const { canAccessChapter } = require('../services/progress.service');
const { auditLog } = require('../services/audit.service');

async function getChapterById(req, res, next) {
  try {
    const chapterId = Number(req.params.id);
    const user = req.session.user;

    // Check sequential lock authorization
    const access = await canAccessChapter(user.id, user.role, chapterId);
    if (!access.allowed) {
      return res.status(403).json({ error: access.reason || 'This chapter is locked' });
    }

    // Fetch chapter & module info
    const [chapters] = await pool.execute(
      `SELECT c.id, c.module_id, c.chapter_number, c.title, c.description, c.is_published,
              m.module_number, m.title AS module_title
       FROM chapters c
       JOIN modules m ON m.id = c.module_id
       WHERE c.id = ?`,
      [chapterId]
    );

    if (chapters.length === 0) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const chapter = chapters[0];

    // Fetch lesson details
    const [lessons] = await pool.execute(
      `SELECT id, overview, learning_objectives, content, key_concepts, slides_json, updated_at
       FROM lessons
       WHERE chapter_id = ?`,
      [chapterId]
    );

    const lesson = lessons[0] || {
      overview: '',
      learning_objectives: [],
      content: '',
      key_concepts: '',
      slides_json: []
    };

    // Parse JSON fields
    const objectives = typeof lesson.learning_objectives === 'string'
      ? JSON.parse(lesson.learning_objectives)
      : lesson.learning_objectives || [];

    const slides = typeof lesson.slides_json === 'string'
      ? JSON.parse(lesson.slides_json)
      : lesson.slides_json || [];

    // Fetch associated lesson files
    const [files] = await pool.execute(
      `SELECT id, original_filename, mime_type, file_size, created_at
       FROM lesson_files
       WHERE chapter_id = ?
       ORDER BY created_at DESC`,
      [chapterId]
    );

    // Fetch associated quiz
    const [quizzes] = await pool.execute(
      `SELECT id, title, version, time_limit_seconds, question_count, passing_score, status
       FROM quizzes
       WHERE chapter_id = ?
       LIMIT 1`,
      [chapterId]
    );

    const quiz = quizzes[0] || null;

    // Fetch student's progress and attempt stats if student
    let studentProgress = null;
    if (user.role === 'student') {
      const [progRows] = await pool.execute(
        `SELECT cp.status, cp.passed_at,
                COALESCE(MAX(qa.correct_answers), 0) AS best_score,
                COALESCE(MAX(qa.score_percentage), 0) AS best_percentage,
                COUNT(qa.id) AS attempts_count
         FROM chapter_progress cp
         LEFT JOIN quizzes q ON q.chapter_id = cp.chapter_id
         LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.student_id = cp.student_id AND qa.status != 'in_progress'
         WHERE cp.student_id = ? AND cp.chapter_id = ?
         GROUP BY cp.status, cp.passed_at`,
        [user.id, chapterId]
      );

      studentProgress = progRows[0] || {
        status: access.status || 'available',
        best_score: null,
        best_percentage: null,
        attempts_count: 0
      };
    }

    // Determine previous and next chapter IDs
    const [adjacentChapters] = await pool.execute(
      `SELECT id, chapter_number FROM chapters WHERE chapter_number IN (?, ?) ORDER BY chapter_number ASC`,
      [chapter.chapter_number - 1, chapter.chapter_number + 1]
    );

    const prevChapter = adjacentChapters.find(c => c.chapter_number === chapter.chapter_number - 1) || null;
    const nextChapter = adjacentChapters.find(c => c.chapter_number === chapter.chapter_number + 1) || null;

    res.json({
      chapter: {
        id: chapter.id,
        chapterNumber: chapter.chapter_number,
        title: chapter.title,
        description: chapter.description,
        isPublished: Boolean(chapter.is_published),
        moduleId: chapter.module_id,
        moduleNumber: chapter.module_number,
        moduleTitle: chapter.module_title,
        previousChapterId: prevChapter ? prevChapter.id : null,
        nextChapterId: nextChapter ? nextChapter.id : null
      },
      lesson: {
        id: lesson.id,
        overview: lesson.overview,
        objectives,
        content: lesson.content,
        keyConcepts: lesson.key_concepts,
        slides,
        updatedAt: lesson.updated_at
      },
      files: files.map(f => ({
        id: f.id,
        name: f.original_filename,
        mimeType: f.mime_type,
        sizeBytes: f.file_size,
        uploadedAt: f.created_at
      })),
      quiz: quiz ? {
        id: quiz.id,
        title: quiz.title,
        version: quiz.version,
        timeLimitSeconds: quiz.time_limit_seconds,
        questionCount: quiz.question_count,
        passingScore: quiz.passing_score,
        status: quiz.status
      } : null,
      studentProgress
    });
  } catch (error) {
    next(error);
  }
}

async function updateChapter(req, res, next) {
  try {
    const chapterId = Number(req.params.id);
    const { title, description, isPublished } = req.body;

    const [prevRows] = await pool.execute(
      `SELECT title, description, is_published FROM chapters WHERE id = ?`,
      [chapterId]
    );

    if (prevRows.length === 0) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const prev = prevRows[0];

    await pool.execute(
      `UPDATE chapters
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           is_published = COALESCE(?, is_published)
       WHERE id = ?`,
      [title, description, isPublished, chapterId]
    );

    await auditLog({
      req,
      action: 'update_chapter',
      entityType: 'chapter',
      entityId: chapterId,
      details: {
        previous: prev,
        updated: { title, description, isPublished }
      }
    });

    res.json({ message: 'Chapter updated successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getChapterById,
  updateChapter
};

