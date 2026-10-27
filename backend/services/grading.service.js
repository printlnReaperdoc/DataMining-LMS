const { pool } = require('../config/db');
const { auditLog } = require('./audit.service');

const TIME_LIMIT_SECONDS = 600; // 10 minutes
const TIME_GRACE_SECONDS = 20; // 20s network latency allowance
const PASSING_THRESHOLD_PERCENT = 75.0;
const PASSING_MIN_CORRECT = 15;
const REQUIRED_QUESTIONS_COUNT = 20;

/**
 * Grade a student's quiz attempt transactionally.
 * Prevents duplicate submissions and updates chapter progress.
 */
async function gradeAndSubmitAttempt({
  attemptId,
  studentId,
  submittedAnswers, // array of { questionId, selectedOptionId }
  isTimeout = false,
  req = null
}) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Lock and verify attempt
    const [attempts] = await connection.execute(
      `SELECT a.*, q.chapter_id, q.version, c.chapter_number
       FROM quiz_attempts a
       JOIN quizzes q ON q.id = a.quiz_id
       JOIN chapters c ON c.id = q.chapter_id
       WHERE a.id = ? AND a.student_id = ?
       FOR UPDATE`,
      [attemptId, studentId]
    );

    if (!attempts || attempts.length === 0) {
      throw { status: 404, message: 'Quiz attempt not found or unauthorized.' };
    }

    const attempt = attempts[0];

    if (attempt.status !== 'in_progress') {
      throw { status: 409, message: 'This quiz attempt has already been submitted or finalized.' };
    }

    const now = new Date();
    const startTime = new Date(attempt.started_at);
    const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);

    // 2. Validate time limit (600s + grace window)
    const timeExceeded = elapsedSeconds > (TIME_LIMIT_SECONDS + TIME_GRACE_SECONDS);
    if (timeExceeded && !isTimeout) {
      // Time exceeded: we still accept whatever answers were provided, but log timeout
      isTimeout = true;
    }

    // 3. Fetch all questions and answer key for this quiz
    const [questions] = await connection.execute(
      `SELECT q.id, q.position, qo.id AS correct_option_id
       FROM questions q
       JOIN question_options qo ON qo.question_id = q.id AND qo.is_correct = TRUE
       WHERE q.quiz_id = ?
       ORDER BY q.position`,
      [attempt.quiz_id]
    );

    if (questions.length !== REQUIRED_QUESTIONS_COUNT) {
      throw {
        status: 409,
        message: `Quiz configuration error: This quiz must contain exactly ${REQUIRED_QUESTIONS_COUNT} questions.`
      };
    }

    // Map student answers by questionId
    const studentAnswerMap = new Map();
    if (Array.isArray(submittedAnswers)) {
      for (const ans of submittedAnswers) {
        if (ans && ans.questionId) {
          studentAnswerMap.set(Number(ans.questionId), ans.selectedOptionId ? Number(ans.selectedOptionId) : null);
        }
      }
    }

    // 4. Calculate score
    let correctCount = 0;
    const answerRecords = [];

    for (const q of questions) {
      const selectedOptionId = studentAnswerMap.get(q.id) || null;
      let isCorrect = false;

      if (selectedOptionId && selectedOptionId === q.correct_option_id) {
        isCorrect = true;
        correctCount++;
      }

      answerRecords.push({
        attemptId: attempt.id,
        questionId: q.id,
        selectedOptionId,
        isCorrect
      });
    }

    const scorePercentage = (correctCount / REQUIRED_QUESTIONS_COUNT) * 100;
    const isPassed = correctCount >= PASSING_MIN_CORRECT;
    const finalStatus = isPassed ? 'passed' : 'failed';

    // 5. Save all attempt_answers
    for (const ans of answerRecords) {
      await connection.execute(
        `INSERT INTO attempt_answers (attempt_id, question_id, selected_option_id, is_correct)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE selected_option_id = VALUES(selected_option_id), is_correct = VALUES(is_correct)`,
        [ans.attemptId, ans.questionId, ans.selectedOptionId, ans.isCorrect]
      );
    }

    // 6. Update quiz_attempts table
    await connection.execute(
      `UPDATE quiz_attempts
       SET submitted_at = ?,
           correct_answers = ?,
           score_percentage = ?,
           status = ?
       WHERE id = ?`,
      [now, correctCount, scorePercentage, finalStatus, attempt.id]
    );

    // 7. Handle sequential chapter unlocking in chapter_progress
    let nextChapterUnlocked = false;
    if (isPassed) {
      // Mark current chapter as passed
      await connection.execute(
        `UPDATE chapter_progress
         SET status = 'passed', passed_at = ?
         WHERE student_id = ? AND chapter_id = ?`,
        [now, studentId, attempt.chapter_id]
      );

      // Check if next chapter exists and unlock it
      if (attempt.chapter_number < 12) {
        const [nextChapters] = await connection.execute(
          `SELECT id, chapter_number FROM chapters WHERE chapter_number = ?`,
          [attempt.chapter_number + 1]
        );

        if (nextChapters.length > 0) {
          const nextChap = nextChapters[0];
          // Unlock next chapter if it is currently locked
          const [unlockRes] = await connection.execute(
            `UPDATE chapter_progress
             SET status = 'available'
             WHERE student_id = ? AND chapter_id = ? AND status = 'locked'`,
            [studentId, nextChap.id]
          );

          if (unlockRes.affectedRows > 0) {
            nextChapterUnlocked = true;
            await auditLog({
              req,
              connection,
              actorUserId: studentId,
              action: 'chapter_unlock',
              entityType: 'chapter',
              entityId: nextChap.id,
              details: {
                unlockedChapterNumber: nextChap.chapter_number,
                unlockedByPassingChapter: attempt.chapter_number,
                score: correctCount
              }
            });
          }
        }
      }
    } else {
      // Record failed status if not already passed
      await connection.execute(
        `UPDATE chapter_progress
         SET status = 'failed'
         WHERE student_id = ? AND chapter_id = ? AND status != 'passed'`,
        [studentId, attempt.chapter_id]
      );
    }

    // 8. Mandatory Audit Logging
    await auditLog({
      req,
      connection,
      actorUserId: studentId,
      action: isTimeout ? 'quiz_timeout_submission' : 'quiz_submission',
      entityType: 'quiz_attempt',
      entityId: attempt.id,
      details: {
        quizId: attempt.quiz_id,
        chapterNumber: attempt.chapter_number,
        correctAnswers: correctCount,
        totalQuestions: REQUIRED_QUESTIONS_COUNT,
        scorePercentage,
        passed: isPassed,
        elapsedSeconds,
        isTimeout
      }
    });

    await connection.commit();

    return {
      attemptId: attempt.id,
      correctAnswers: correctCount,
      totalQuestions: REQUIRED_QUESTIONS_COUNT,
      scorePercentage,
      passed: isPassed,
      passingScore: PASSING_MIN_CORRECT,
      elapsedSeconds,
      submittedAt: now,
      nextChapterUnlocked
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  TIME_LIMIT_SECONDS,
  PASSING_THRESHOLD_PERCENT,
  PASSING_MIN_CORRECT,
  REQUIRED_QUESTIONS_COUNT,
  gradeAndSubmitAttempt
};

