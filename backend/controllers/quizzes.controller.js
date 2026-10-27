const ExcelJS = require('exceljs');
const { pool, withTransaction } = require('../config/db');
const { canAccessChapter } = require('../services/progress.service');
const { auditLog } = require('../services/audit.service');
const { chaptersData } = require('../database/seedData');

/**
 * Helper to shuffle array (Fisher-Yates)
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function getQuizByChapterId(req, res, next) {
  try {
    const chapterId = Number(req.params.chapterId);
    const user = req.session.user;

    const access = await canAccessChapter(user.id, user.role, chapterId);
    if (!access.allowed) {
      return res.status(403).json({ error: access.reason || 'This chapter quiz is locked.' });
    }

    const [quizzes] = await pool.execute(
      `SELECT q.*, c.chapter_number, c.title AS chapter_title
       FROM quizzes q
       JOIN chapters c ON c.id = q.chapter_id
       WHERE q.chapter_id = ?`,
      [chapterId]
    );

    if (quizzes.length === 0) {
      return res.status(404).json({ error: 'Quiz not found for this chapter.' });
    }

    const quiz = quizzes[0];

    if (user.role === 'student' && quiz.status !== 'published') {
      return res.status(403).json({ error: 'This quiz is currently being revised by the instructor.' });
    }

    // Fetch questions and options
    const [questions] = await pool.execute(
      `SELECT q.id, q.question_text, q.position, q.points,
              qo.id AS option_id, qo.option_label, qo.option_text, qo.is_correct
       FROM questions q
       JOIN question_options qo ON qo.question_id = q.id
       WHERE q.quiz_id = ?
       ORDER BY q.position ASC, qo.option_label ASC`,
      [quiz.id]
    );

    // Group options under their questions
    const questionMap = new Map();
    for (const row of questions) {
      if (!questionMap.has(row.id)) {
        questionMap.set(row.id, {
          id: row.id,
          position: row.position,
          questionText: row.question_text,
          points: row.points,
          options: []
        });
      }

      const q = questionMap.get(row.id);
      const opt = {
        id: row.option_id,
        label: row.option_label,
        text: row.option_text
      };

      // CRITICAL SECURITY REQUIREMENT: Never expose correct answers to student browsers!
      if (user.role === 'faculty') {
        opt.isCorrect = Boolean(row.is_correct);
      }

      q.options.push(opt);
    }

    let questionList = Array.from(questionMap.values());

    // If student is loading questions, randomize order for security and academic integrity
    if (user.role === 'student') {
      questionList = shuffle(questionList);
    }

    res.json({
      quiz: {
        id: quiz.id,
        chapterId: quiz.chapter_id,
        chapterNumber: quiz.chapter_number,
        chapterTitle: quiz.chapter_title,
        title: quiz.title,
        version: quiz.version,
        timeLimitSeconds: quiz.time_limit_seconds,
        questionCount: quiz.question_count,
        passingScore: quiz.passing_score,
        status: quiz.status,
        publishedAt: quiz.published_at
      },
      questions: questionList
    });
  } catch (error) {
    next(error);
  }
}

async function publishQuiz(req, res, next) {
  try {
    const chapterId = Number(req.params.chapterId);
    const { published } = req.body;

    const [quizzes] = await pool.execute(`SELECT * FROM quizzes WHERE chapter_id = ?`, [chapterId]);
    if (quizzes.length === 0) return res.status(404).json({ error: 'Quiz not found' });
    const quiz = quizzes[0];

    if (published) {
      // Validate that quiz contains exactly 20 valid questions before publishing
      const [qCount] = await pool.execute(`SELECT COUNT(*) as count FROM questions WHERE quiz_id = ?`, [quiz.id]);
      if (qCount[0].count !== 20) {
        return res.status(400).json({
          error: `Cannot publish: Quiz must contain exactly 20 questions (currently has ${qCount[0].count}).`
        });
      }
    }

    const newStatus = published ? 'published' : 'draft';
    await pool.execute(
      `UPDATE quizzes SET status = ?, published_at = IF(? = 'published', NOW(), published_at) WHERE id = ?`,
      [newStatus, newStatus, quiz.id]
    );

    await auditLog({
      req,
      action: published ? 'publish_quiz' : 'unpublish_quiz',
      entityType: 'quiz',
      entityId: quiz.id,
      details: { chapterId, status: newStatus }
    });

    res.json({ message: `Quiz is now ${newStatus}`, status: newStatus });
  } catch (error) {
    next(error);
  }
}

async function resetDefaultQuiz(req, res, next) {
  try {
    const chapterId = Number(req.params.chapterId);
    const [chapters] = await pool.execute(`SELECT * FROM chapters WHERE id = ?`, [chapterId]);
    if (chapters.length === 0) return res.status(404).json({ error: 'Chapter not found' });
    const chapter = chapters[0];

    const defaultChapterData = chaptersData.find(c => c.chapterNumber === chapter.chapter_number);
    if (!defaultChapterData) {
      return res.status(404).json({ error: 'Default question seed data not found for this chapter.' });
    }

    await withTransaction(async (conn) => {
      // Find or create quiz
      let [quizzes] = await conn.execute(`SELECT id, version FROM quizzes WHERE chapter_id = ?`, [chapterId]);
      let quizId;
      let newVersion = 1;

      if (quizzes.length > 0) {
        quizId = quizzes[0].id;
        newVersion = quizzes[0].version + 1;
        // Delete old questions
        await conn.execute(`DELETE FROM questions WHERE quiz_id = ?`, [quizId]);
        await conn.execute(
          `UPDATE quizzes SET version = ?, question_count = 20, time_limit_seconds = 600, passing_score = 75.00, status = 'published' WHERE id = ?`,
          [newVersion, quizId]
        );
      } else {
        const [qRes] = await conn.execute(
          `INSERT INTO quizzes (chapter_id, title, version, time_limit_seconds, question_count, passing_score, status)
           VALUES (?, ?, 1, 600, 20, 75.00, 'published')`,
          [chapterId, `${chapter.title} - Comprehensive Quiz`]
        );
        quizId = qRes.insertId;
      }

      // Insert 20 default questions
      for (const q of defaultChapterData.questions) {
        const [qRes] = await conn.execute(
          `INSERT INTO questions (quiz_id, question_text, question_type, points, position)
           VALUES (?, ?, 'multiple_choice', 1.00, ?)`,
          [quizId, q.questionText, q.questionNumber]
        );
        const questionId = qRes.insertId;

        for (const opt of q.options) {
          await conn.execute(
            `INSERT INTO question_options (question_id, option_text, option_label, is_correct)
             VALUES (?, ?, ?, ?)`,
            [questionId, opt.text, opt.label, opt.isCorrect]
          );
        }
      }

      await auditLog({
        req,
        connection: conn,
        action: 'reset_default_quiz',
        entityType: 'quiz',
        entityId: quizId,
        details: { chapterNumber: chapter.chapter_number, questionCount: 20, version: newVersion }
      });
    });

    res.json({ message: 'Quiz successfully reset to 20 curriculum-aligned questions.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Parse and validate imported quiz data from JSON, CSV, or XLSX
 */
async function importQuiz(req, res, next) {
  try {
    const chapterId = Number(req.params.chapterId);
    let parsedQuestions = [];

    // Support both direct JSON body or multipart file upload
    if (req.file) {
      const ext = req.file.originalname.split('.').pop().toLowerCase();
      if (ext === 'json') {
        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        parsedQuestions = JSON.parse(fileContent);
      } else if (ext === 'xlsx') {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(req.file.path);
        const worksheet = workbook.worksheets[0];
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // skip header
          const questionText = row.getCell(1).text;
          const optA = row.getCell(2).text;
          const optB = row.getCell(3).text;
          const optC = row.getCell(4).text;
          const optD = row.getCell(5).text;
          const correct = row.getCell(6).text.trim().toUpperCase();

          if (questionText) {
            parsedQuestions.push({
              questionNumber: rowNumber - 1,
              questionText,
              options: [
                { label: 'A', text: optA, isCorrect: correct === 'A' },
                { label: 'B', text: optB, isCorrect: correct === 'B' },
                { label: 'C', text: optC, isCorrect: correct === 'C' },
                { label: 'D', text: optD, isCorrect: correct === 'D' }
              ]
            });
          }
        });
      } else if (ext === 'csv') {
        const workbook = new ExcelJS.Workbook();
        await workbook.csv.readFile(req.file.path);
        const worksheet = workbook.worksheets[0];
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;
          const questionText = row.getCell(1).text;
          const optA = row.getCell(2).text;
          const optB = row.getCell(3).text;
          const optC = row.getCell(4).text;
          const optD = row.getCell(5).text;
          const correct = row.getCell(6).text.trim().toUpperCase();

          if (questionText) {
            parsedQuestions.push({
              questionNumber: rowNumber - 1,
              questionText,
              options: [
                { label: 'A', text: optA, isCorrect: correct === 'A' },
                { label: 'B', text: optB, isCorrect: correct === 'B' },
                { label: 'C', text: optC, isCorrect: correct === 'C' },
                { label: 'D', text: optD, isCorrect: correct === 'D' }
              ]
            });
          }
        });
      }
    } else if (req.body && req.body.questions) {
      parsedQuestions = Array.isArray(req.body.questions) ? req.body.questions : [];
    }

    // STRICT VALIDATION REQUIREMENTS:
    // 1. Must contain exactly 20 questions
    // 2. Each question must have valid prompt and exactly 4 options with 1 correct option
    const validationErrors = [];

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length !== 20) {
      validationErrors.push(`Quiz import must contain exactly 20 questions (received ${parsedQuestions ? parsedQuestions.length : 0}).`);
    } else {
      parsedQuestions.forEach((q, idx) => {
        const qNum = idx + 1;
        if (!q.questionText || !q.questionText.trim()) {
          validationErrors.push(`Question #${qNum}: Question text is required.`);
        }

        if (!Array.isArray(q.options) || q.options.length !== 4) {
          validationErrors.push(`Question #${qNum}: Must have exactly 4 choices (A, B, C, D).`);
        } else {
          const correctCount = q.options.filter(o => o.isCorrect === true || o.isCorrect === 'true' || o.isCorrect === 1).length;
          if (correctCount !== 1) {
            validationErrors.push(`Question #${qNum}: Must designate exactly 1 correct option (found ${correctCount}).`);
          }
        }
      });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Quiz import validation failed',
        details: validationErrors
      });
    }

    // Apply import in a transaction
    await withTransaction(async (conn) => {
      let [quizzes] = await conn.execute(`SELECT id, version FROM quizzes WHERE chapter_id = ?`, [chapterId]);
      let quizId;
      let newVersion = 1;

      if (quizzes.length > 0) {
        quizId = quizzes[0].id;
        newVersion = quizzes[0].version + 1;
        await conn.execute(`DELETE FROM questions WHERE quiz_id = ?`, [quizId]);
        await conn.execute(
          `UPDATE quizzes SET version = ?, question_count = 20 WHERE id = ?`,
          [newVersion, quizId]
        );
      } else {
        const [qRes] = await conn.execute(
          `INSERT INTO quizzes (chapter_id, title, version, time_limit_seconds, question_count, passing_score, status)
           VALUES (?, 'Imported Quiz', 1, 600, 20, 75.00, 'draft')`,
          [chapterId]
        );
        quizId = qRes.insertId;
      }

      for (let i = 0; i < parsedQuestions.length; i++) {
        const q = parsedQuestions[i];
        const [qRes] = await conn.execute(
          `INSERT INTO questions (quiz_id, question_text, question_type, points, position)
           VALUES (?, ?, 'multiple_choice', 1.00, ?)`,
          [quizId, q.questionText, i + 1]
        );
        const questionId = qRes.insertId;

        const labels = ['A', 'B', 'C', 'D'];
        for (let j = 0; j < q.options.length; j++) {
          const opt = q.options[j];
          const isCorrect = opt.isCorrect === true || opt.isCorrect === 'true' || opt.isCorrect === 1;
          await conn.execute(
            `INSERT INTO question_options (question_id, option_text, option_label, is_correct)
             VALUES (?, ?, ?, ?)`,
            [questionId, opt.text, labels[j] || opt.label, isCorrect]
          );
        }
      }

      await auditLog({
        req,
        connection: conn,
        action: 'import_quiz',
        entityType: 'quiz',
        entityId: quizId,
        details: { chapterId, version: newVersion, questionCount: 20 }
      });
    });

    res.json({ message: 'Quiz successfully imported with exactly 20 validated questions.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getQuizByChapterId,
  publishQuiz,
  resetDefaultQuiz,
  importQuiz
};

