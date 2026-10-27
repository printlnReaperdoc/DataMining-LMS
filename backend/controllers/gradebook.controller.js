const { pool, withTransaction } = require('../config/db');
const { auditLog } = require('../services/audit.service');

// Server-side sort column allowlist for topic gradebook
const ALLOWED_SORT_COLUMNS = {
  surname: 'u.surname',
  score: 'highest_score',
  latest_date: 'latest_attempt_at'
};

async function getTopicGradebook(req, res, next) {
  try {
    const chapterId = Number(req.params.chapterId);
    const sortBy = req.query.sortBy || 'surname';
    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';
    const statusFilter = req.query.status || 'all';
    const search = req.query.search ? req.query.search.trim() : '';

    // Validate sort column against allowlist
    const sortSql = ALLOWED_SORT_COLUMNS[sortBy] || 'u.surname';

    // Verify chapter exists
    const [chapters] = await pool.execute(
      `SELECT c.id, c.chapter_number, c.title, m.module_number, m.title AS module_title
       FROM chapters c
       JOIN modules m ON m.id = c.module_id
       WHERE c.id = ?`,
      [chapterId]
    );

    if (chapters.length === 0) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const chapter = chapters[0];

    // Query enrolled students and their chapter metrics
    let whereQuery = `WHERE ce.status = 'enrolled'`;
    const params = [chapterId, chapterId, chapterId];

    if (search) {
      whereQuery += ` AND (u.username LIKE ? OR u.first_name LIKE ? OR u.surname LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const sql = `
      SELECT u.id AS student_id, u.username, u.first_name, u.surname,
             COALESCE(cp.status, 'locked') AS progress_status,
             cp.passed_at,
             COUNT(qa.id) AS attempts_count,
             MAX(qa.correct_answers) AS highest_score,
             MAX(qa.score_percentage) AS highest_percentage,
             (
               SELECT qa2.correct_answers
               FROM quiz_attempts qa2
               JOIN quizzes q2 ON q2.id = qa2.quiz_id
               WHERE qa2.student_id = u.id AND q2.chapter_id = ? AND qa2.status != 'in_progress'
               ORDER BY qa2.submitted_at DESC LIMIT 1
             ) AS latest_score,
             (
               SELECT qa2.submitted_at
               FROM quiz_attempts qa2
               JOIN quizzes q2 ON q2.id = qa2.quiz_id
               WHERE qa2.student_id = u.id AND q2.chapter_id = ? AND qa2.status != 'in_progress'
               ORDER BY qa2.submitted_at DESC LIMIT 1
             ) AS latest_attempt_at
      FROM users u
      JOIN course_enrollments ce ON ce.student_id = u.id
      LEFT JOIN chapter_progress cp ON cp.student_id = u.id AND cp.chapter_id = ?
      LEFT JOIN quizzes q ON q.chapter_id = ?
      LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.student_id = u.id AND qa.status != 'in_progress'
      ${whereQuery}
      GROUP BY u.id, u.username, u.first_name, u.surname, cp.status, cp.passed_at
      ORDER BY ${sortSql} ${sortOrder}
    `;

    // Need to supply chapterId for the 4 placeholders in subqueries and join
    const finalParams = [chapterId, chapterId, chapterId, chapterId];
    if (search) {
      finalParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.execute(sql, finalParams);

    const students = rows.map(r => {
      let derivedStatus = 'not_attempted';
      if (r.highest_score !== null) {
        derivedStatus = r.highest_score >= 15 ? 'passed' : 'failed';
      }

      return {
        studentId: r.student_id,
        username: r.username,
        firstName: r.first_name,
        surname: r.surname,
        attemptsCount: r.attempts_count,
        latestScore: r.latest_score !== null ? Number(r.latest_score) : null,
        highestScore: r.highest_score !== null ? Number(r.highest_score) : null,
        highestPercentage: r.highest_percentage !== null ? Number(r.highest_percentage) : null,
        status: derivedStatus,
        progressStatus: r.progress_status,
        passedAt: r.passed_at,
        latestAttemptAt: r.latest_attempt_at
      };
    });

    // Apply status filter if requested
    const filteredStudents = statusFilter === 'all'
      ? students
      : students.filter(s => s.status === statusFilter || (statusFilter === 'passed' && s.progressStatus === 'passed'));

    res.json({
      chapter: {
        id: chapter.id,
        chapterNumber: chapter.chapter_number,
        title: chapter.title,
        moduleNumber: chapter.module_number,
        moduleTitle: chapter.module_title
      },
      sort: { sortBy, sortOrder },
      filter: { status: statusFilter, search },
      totalCount: filteredStudents.length,
      students: filteredStudents
    });
  } catch (error) {
    next(error);
  }
}

async function getStudentAttemptsForTopic(req, res, next) {
  try {
    const chapterId = Number(req.params.chapterId);
    const studentId = Number(req.params.studentId);

    const [studentRows] = await pool.execute(
      `SELECT id, username, first_name, surname FROM users WHERE id = ?`,
      [studentId]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const [attempts] = await pool.execute(
      `SELECT qa.id, qa.quiz_version, qa.started_at, qa.submitted_at,
              qa.correct_answers, qa.score_percentage, qa.status
       FROM quiz_attempts qa
       JOIN quizzes q ON q.id = qa.quiz_id
       WHERE qa.student_id = ? AND q.chapter_id = ?
       ORDER BY qa.started_at DESC`,
      [studentId, chapterId]
    );

    res.json({
      student: studentRows[0],
      chapterId,
      attempts
    });
  } catch (error) {
    next(error);
  }
}

async function getMasterGradebook(req, res, next) {
  try {
    const search = req.query.search ? req.query.search.trim() : '';
    const statusFilter = req.query.status || 'all'; // 'all', 'completed', 'in_progress', 'not_started'

    // Fetch all 12 chapters
    const [chapters] = await pool.execute(
      `SELECT id, chapter_number, title FROM chapters ORDER BY chapter_number ASC`
    );

    // Fetch enrolled students
    let studentSql = `
      SELECT u.id, u.username, u.first_name, u.surname
      FROM users u
      JOIN course_enrollments ce ON ce.student_id = u.id
      WHERE ce.status = 'enrolled'
    `;
    const studentParams = [];

    if (search) {
      studentSql += ` AND (u.username LIKE ? OR u.first_name LIKE ? OR u.surname LIKE ?)`;
      studentParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    studentSql += ` ORDER BY u.surname ASC, u.first_name ASC`;
    const [students] = await pool.execute(studentSql, studentParams);

    // Fetch all quiz attempts grouped by student & chapter
    const [attemptRows] = await pool.execute(
      `SELECT qa.student_id, c.chapter_number,
              COUNT(qa.id) AS attempts_count,
              MAX(qa.correct_answers) AS highest_score,
              MAX(qa.score_percentage) AS highest_percentage,
              cp.status AS progress_status
       FROM quiz_attempts qa
       JOIN quizzes q ON q.id = qa.quiz_id
       JOIN chapters c ON c.id = q.chapter_id
       LEFT JOIN chapter_progress cp ON cp.student_id = qa.student_id AND cp.chapter_id = c.id
       WHERE qa.status != 'in_progress'
       GROUP BY qa.student_id, c.chapter_number, cp.status`
    );

    // Fetch all chapter_progress records for passed status verification
    const [progressRows] = await pool.execute(
      `SELECT cp.student_id, c.chapter_number, cp.status
       FROM chapter_progress cp
       JOIN chapters c ON c.id = cp.chapter_id`
    );

    const progressMap = new Map();
    for (const p of progressRows) {
      progressMap.set(`${p.student_id}_${p.chapter_number}`, p.status);
    }

    // Map attempts by `studentId_chapterNumber`
    const attemptsMap = new Map();
    for (const a of attemptRows) {
      attemptsMap.set(`${a.student_id}_${a.chapter_number}`, a);
    }

    // Assemble master matrix
    const masterStudents = students.map(s => {
      const chapterData = {};
      let totalAttempts = 0;
      let attemptedChaptersCount = 0;
      let totalHighestScoreSum = 0;
      let passedCount = 0;

      for (let ch = 1; ch <= 12; ch++) {
        const key = `${s.id}_${ch}`;
        const att = attemptsMap.get(key);
        const progStatus = progressMap.get(key) || 'locked';

        const isPassed = progStatus === 'passed' || (att && att.highest_score >= 15);
        if (isPassed) passedCount++;

        if (att) {
          totalAttempts += att.attempts_count;
          attemptedChaptersCount++;
          totalHighestScoreSum += (att.highest_score / 20) * 100;

          chapterData[ch] = {
            chapterNumber: ch,
            bestScore: att.highest_score,
            bestPercentage: att.highest_percentage,
            attemptsCount: att.attempts_count,
            status: isPassed ? 'passed' : 'failed'
          };
        } else {
          chapterData[ch] = {
            chapterNumber: ch,
            bestScore: null,
            bestPercentage: null,
            attemptsCount: 0,
            status: isPassed ? 'passed' : (progStatus === 'available' ? 'available' : 'not_attempted')
          };
        }
      }

      // Explicit aggregation rules from prompt:
      // - Overall average: highest score per attempted chapter
      // - Exclude chapters without attempts from numeric average (not silently treated as 0)
      const overallAverage = attemptedChaptersCount > 0
        ? Number((totalHighestScoreSum / attemptedChaptersCount).toFixed(1))
        : null;

      const completionPercentage = Number(((passedCount / 12) * 100).toFixed(1));

      let overallStatus = 'not_started';
      if (passedCount === 12) {
        overallStatus = 'completed';
      } else if (attemptedChaptersCount > 0) {
        overallStatus = 'in_progress';
      }

      return {
        id: s.id,
        username: s.username,
        firstName: s.first_name,
        surname: s.surname,
        chapters: chapterData,
        totalAttempts,
        attemptedChaptersCount,
        averageScore: overallAverage,
        passedCount,
        completionPercentage,
        overallStatus
      };
    });

    // Filter by status if specified
    const filtered = statusFilter === 'all'
      ? masterStudents
      : masterStudents.filter(s => s.overallStatus === statusFilter);

    res.json({
      chapters: chapters.map(c => ({ id: c.id, chapterNumber: c.chapter_number, title: c.title })),
      students: filtered,
      summary: {
        totalEnrolled: students.length,
        averageCompletion: masterStudents.length > 0
          ? Number((masterStudents.reduce((acc, s) => acc + s.completionPercentage, 0) / masterStudents.length).toFixed(1))
          : 0
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getMySummary(req, res, next) {
  try {
    const studentId = req.session.user.id;

    const [chapters] = await pool.execute(
      `SELECT c.id, c.chapter_number, c.title, m.module_number, m.title AS module_title
       FROM chapters c
       JOIN modules m ON m.id = c.module_id
       ORDER BY c.chapter_number ASC`
    );

    const [attempts] = await pool.execute(
      `SELECT c.chapter_number,
              COUNT(qa.id) AS attempts_count,
              MAX(qa.correct_answers) AS best_score,
              MAX(qa.score_percentage) AS best_percentage,
              cp.status AS progress_status,
              cp.passed_at
       FROM chapters c
       LEFT JOIN quizzes q ON q.chapter_id = c.id
       LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.student_id = ? AND qa.status != 'in_progress'
       LEFT JOIN chapter_progress cp ON cp.chapter_id = c.id AND cp.student_id = ?
       GROUP BY c.chapter_number, cp.status, cp.passed_at
       ORDER BY c.chapter_number ASC`,
      [studentId, studentId]
    );

    const attemptMap = new Map(attempts.map(a => [a.chapter_number, a]));

    let passedCount = 0;
    let totalScoreSum = 0;
    let attemptedCount = 0;

    const chapterList = chapters.map(c => {
      const att = attemptMap.get(c.chapter_number);
      const isPassed = att && (att.progress_status === 'passed' || att.best_score >= 15);

      if (isPassed) passedCount++;
      if (att && att.attempts_count > 0 && att.best_score !== null) {
        attemptedCount++;
        totalScoreSum += (att.best_score / 20) * 100;
      }

      return {
        chapterId: c.id,
        chapterNumber: c.chapter_number,
        title: c.title,
        moduleNumber: c.module_number,
        moduleTitle: c.module_title,
        status: isPassed ? 'passed' : (att?.progress_status || (c.chapter_number === 1 ? 'available' : 'locked')),
        bestScore: att && att.best_score !== null ? att.best_score : null,
        bestPercentage: att && att.best_percentage !== null ? att.best_percentage : null,
        attemptsCount: att ? att.attempts_count : 0,
        passedAt: att?.passed_at || null
      };
    });

    const averageScore = attemptedCount > 0 ? Number((totalScoreSum / attemptedCount).toFixed(1)) : null;
    const completionPercentage = Number(((passedCount / 12) * 100).toFixed(1));

    res.json({
      student: req.session.user,
      stats: {
        passedChapters: passedCount,
        totalChapters: 12,
        completionPercentage,
        averageScore,
        attemptedCount
      },
      chapters: chapterList
    });
  } catch (error) {
    next(error);
  }
}

async function overrideStudentProgress(req, res, next) {
  try {
    const { studentId, chapterId, newStatus, reason } = req.body;

    const [prevRows] = await pool.execute(
      `SELECT status FROM chapter_progress WHERE student_id = ? AND chapter_id = ?`,
      [studentId, chapterId]
    );

    const previousStatus = prevRows[0]?.status || 'locked';

    await pool.execute(
      `INSERT INTO chapter_progress (student_id, chapter_id, status, passed_at)
       VALUES (?, ?, ?, IF(? = 'passed', NOW(), NULL))
       ON DUPLICATE KEY UPDATE status = VALUES(status), passed_at = IF(VALUES(status) = 'passed', NOW(), passed_at)`,
      [studentId, chapterId, newStatus, newStatus]
    );

    await auditLog({
      req,
      action: 'progress_override',
      entityType: 'chapter_progress',
      entityId: `${studentId}_${chapterId}`,
      details: {
        studentId,
        chapterId,
        previousStatus,
        newStatus,
        reason: reason || 'Administrative decision by instructor'
      }
    });

    res.json({
      message: `Chapter progress updated to ${newStatus}`,
      studentId,
      chapterId,
      newStatus
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTopicGradebook,
  getStudentAttemptsForTopic,
  getMasterGradebook,
  getMySummary,
  overrideStudentProgress
};

