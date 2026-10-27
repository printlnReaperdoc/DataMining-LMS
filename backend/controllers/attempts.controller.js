const { pool } = require('../config/db');
const { canAccessChapter } = require('../services/progress.service');
const { gradeAndSubmitAttempt, TIME_LIMIT_SECONDS } = require('../services/grading.service');
const { auditLog } = require('../services/audit.service');

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function startAttempt(req, res, next) {
  try {
    const quizId = Number(req.params.quizId);
    const studentId = req.session.user.id;

    // Check quiz exists and fetch chapter
    const [quizzes] = await pool.execute(
      `SELECT q.*, c.chapter_number
       FROM quizzes q
       JOIN chapters c ON c.id = q.chapter_id
       WHERE q.id = ?`,
      [quizId]
    );

    if (quizzes.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = quizzes[0];

    // Check student sequential unlock
    const access = await canAccessChapter(studentId, req.session.user.role, quiz.chapter_id);
    if (!access.allowed) {
      return res.status(403).json({ error: access.reason || 'This chapter quiz is locked.' });
    }

    // Check quiz status
    if (quiz.status !== 'published') {
      return res.status(400).json({ error: 'This quiz is not currently published for assessment.' });
    }

    // Check questions count
    const [questions] = await pool.execute(
      `SELECT q.id, q.question_text, q.position,
              qo.id AS option_id, qo.option_label, qo.option_text
       FROM questions q
       JOIN question_options qo ON qo.question_id = q.id
       WHERE q.quiz_id = ?
       ORDER BY q.position ASC, qo.option_label ASC`,
      [quizId]
    );

    // Group options
    const questionMap = new Map();
    for (const row of questions) {
      if (!questionMap.has(row.id)) {
        questionMap.set(row.id, {
          id: row.id,
          position: row.position,
          questionText: row.question_text,
          options: []
        });
      }
      questionMap.get(row.id).options.push({
        id: row.option_id,
        label: row.option_label,
        text: row.option_text
      });
    }

    if (questionMap.size !== 20) {
      return res.status(409).json({
        error: `Assessment configuration issue: Quiz must contain exactly 20 questions (found ${questionMap.size}).`
      });
    }

    // Check if there is an existing in-progress attempt that hasn't timed out
    const [existingAttempts] = await pool.execute(
      `SELECT * FROM quiz_attempts
       WHERE student_id = ? AND quiz_id = ? AND status = 'in_progress'
       ORDER BY started_at DESC LIMIT 1`,
      [studentId, quizId]
    );

    let attemptId;
    let startedAt = new Date();

    if (existingAttempts.length > 0) {
      const activeAttempt = existingAttempts[0];
      const elapsed = Math.floor((Date.now() - new Date(activeAttempt.started_at).getTime()) / 1000);

      // If active attempt is still within the 10-minute window, resume it!
      if (elapsed < TIME_LIMIT_SECONDS) {
        attemptId = activeAttempt.id;
        startedAt = activeAttempt.started_at;
      } else {
        // Active attempt timed out, close it as abandoned/timeout
        await pool.execute(
          `UPDATE quiz_attempts SET status = 'abandoned', submitted_at = NOW() WHERE id = ?`,
          [activeAttempt.id]
        );
      }
    }

    if (!attemptId) {
      // Create fresh attempt
      startedAt = new Date();
      const [insertRes] = await pool.execute(
        `INSERT INTO quiz_attempts (student_id, quiz_id, quiz_version, started_at, status)
         VALUES (?, ?, ?, ?, 'in_progress')`,
        [studentId, quizId, quiz.version, startedAt]
      );
      attemptId = insertRes.insertId;

      await auditLog({
        req,
        actorUserId: studentId,
        action: 'start_quiz_attempt',
        entityType: 'quiz_attempt',
        entityId: attemptId,
        details: { quizId, chapterNumber: quiz.chapter_number }
      });
    }

    // Randomize question presentation order
    const randomizedQuestions = shuffle(Array.from(questionMap.values()));

    res.status(201).json({
      attemptId,
      quizId,
      timeLimitSeconds: TIME_LIMIT_SECONDS,
      startedAt: startedAt.toISOString(),
      questionCount: 20,
      passingScore: 15,
      questions: randomizedQuestions
    });
  } catch (error) {
    next(error);
  }
}

async function submitAttempt(req, res, next) {
  try {
    const attemptId = Number(req.params.attemptId);
    const studentId = req.session.user.id;
    const { answers, isTimeout } = req.body;

    const result = await gradeAndSubmitAttempt({
      attemptId,
      studentId,
      submittedAnswers: answers,
      isTimeout: Boolean(isTimeout),
      req
    });

    res.json({
      message: result.passed ? 'Congratulations! You passed the chapter quiz.' : 'Quiz completed. Passing score is 15/20. You may retake this quiz.',
      ...result
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
}

async function getMyAttemptsForChapter(req, res, next) {
  try {
    const chapterId = Number(req.params.chapterId);
    const studentId = req.session.user.id;

    const [rows] = await pool.execute(
      `SELECT qa.id, qa.quiz_id, qa.quiz_version, qa.started_at, qa.submitted_at,
              qa.correct_answers, qa.score_percentage, qa.status
       FROM quiz_attempts qa
       JOIN quizzes q ON q.id = qa.quiz_id
       WHERE qa.student_id = ? AND q.chapter_id = ?
       ORDER BY qa.started_at DESC`,
      [studentId, chapterId]
    );

    res.json({ attempts: rows });
  } catch (error) {
    next(error);
  }
}

async function getAttemptDetails(req, res, next) {
  try {
    const attemptId = Number(req.params.attemptId);
    const user = req.session.user;

    const [attempts] = await pool.execute(
      `SELECT qa.*, q.chapter_id, c.chapter_number, c.title AS chapter_title,
              u.username, u.first_name, u.surname
       FROM quiz_attempts qa
       JOIN quizzes q ON q.id = qa.quiz_id
       JOIN chapters c ON c.id = q.chapter_id
       JOIN users u ON u.id = qa.student_id
       WHERE qa.id = ?`,
      [attemptId]
    );

    if (attempts.length === 0) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    const attempt = attempts[0];

    // Authorization: only student who took the attempt or faculty can view
    if (user.role !== 'faculty' && attempt.student_id !== user.id) {
      return res.status(403).json({ error: 'Access denied to this attempt record' });
    }

    // Fetch answers
    const [answers] = await pool.execute(
      `SELECT aa.question_id, aa.selected_option_id, aa.is_correct,
              q.question_text, q.position,
              sel_qo.option_label AS selected_label, sel_qo.option_text AS selected_text,
              cor_qo.id AS correct_opt_id, cor_qo.option_label AS correct_label, cor_qo.option_text AS correct_text
       FROM attempt_answers aa
       JOIN questions q ON q.id = aa.question_id
       LEFT JOIN question_options sel_qo ON sel_qo.id = aa.selected_option_id
       LEFT JOIN question_options cor_qo ON cor_qo.question_id = q.id AND cor_qo.is_correct = TRUE
       WHERE aa.attempt_id = ?
       ORDER BY q.position ASC`,
      [attemptId]
    );

    res.json({
      attempt,
      answers: answers.map(a => ({
        questionId: a.question_id,
        position: a.position,
        questionText: a.question_text,
        selectedOptionId: a.selected_option_id,
        selectedLabel: a.selected_label,
        selectedText: a.selected_text,
        isCorrect: Boolean(a.is_correct),
        // Reveal correct answer only on completed/submitted attempts
        correctLabel: attempt.status !== 'in_progress' ? a.correct_label : null,
        correctText: attempt.status !== 'in_progress' ? a.correct_text : null
      }))
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  startAttempt,
  submitAttempt,
  getMyAttemptsForChapter,
  getAttemptDetails
};

