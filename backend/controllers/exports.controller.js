const { pool } = require('../config/db');
const { auditLog } = require('../services/audit.service');
const {
  generateTopicGradebookCSV,
  generateTopicGradebookXLSX,
  generateTopicGradebookPDF,
  generateMasterGradebookCSV,
  generateMasterGradebookXLSX,
  generateMasterGradebookPDF,
  generateStudentSummaryPDF
} = require('../services/export.service');

async function exportTopicGradebook(req, res, next) {
  try {
    const chapterId = Number(req.params.chapterId);
    const format = req.params.format.toLowerCase();

    // Verify chapter
    const [chapters] = await pool.execute(`SELECT * FROM chapters WHERE id = ?`, [chapterId]);
    if (chapters.length === 0) return res.status(404).json({ error: 'Chapter not found' });
    const chapter = chapters[0];

    // Fetch student data for this topic
    const [rows] = await pool.execute(
      `SELECT u.username, u.first_name, u.surname,
              COALESCE(cp.status, 'locked') AS status,
              COUNT(qa.id) AS attempts_count,
              MAX(qa.correct_answers) AS highest_score,
              MAX(qa.score_percentage) AS highest_percentage,
              (
                SELECT qa2.correct_answers FROM quiz_attempts qa2
                JOIN quizzes q2 ON q2.id = qa2.quiz_id
                WHERE qa2.student_id = u.id AND q2.chapter_id = ? AND qa2.status != 'in_progress'
                ORDER BY qa2.submitted_at DESC LIMIT 1
              ) AS latest_score,
              (
                SELECT qa2.submitted_at FROM quiz_attempts qa2
                JOIN quizzes q2 ON q2.id = qa2.quiz_id
                WHERE qa2.student_id = u.id AND q2.chapter_id = ? AND qa2.status != 'in_progress'
                ORDER BY qa2.submitted_at DESC LIMIT 1
              ) AS latest_attempt_at
       FROM users u
       JOIN course_enrollments ce ON ce.student_id = u.id
       LEFT JOIN chapter_progress cp ON cp.student_id = u.id AND cp.chapter_id = ?
       LEFT JOIN quizzes q ON q.chapter_id = ?
       LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.student_id = u.id AND qa.status != 'in_progress'
       WHERE ce.status = 'enrolled'
       GROUP BY u.id, u.username, u.first_name, u.surname, cp.status
       ORDER BY u.surname ASC`,
      [chapterId, chapterId, chapterId, chapterId]
    );

    await auditLog({
      req,
      action: 'export_topic_gradebook',
      entityType: 'chapter',
      entityId: chapterId,
      details: { format, chapterNumber: chapter.chapter_number }
    });

    const filename = `ITEP411T_Ch${chapter.chapter_number}_Gradebook.${format}`;

    if (format === 'csv') {
      const buffer = await generateTopicGradebookCSV(chapter, rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(buffer);
    } else if (format === 'xlsx') {
      const buffer = await generateTopicGradebookXLSX(chapter, rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(buffer);
    } else if (format === 'pdf') {
      const buffer = await generateTopicGradebookPDF(chapter, rows);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return res.send(buffer);
    } else {
      return res.status(400).json({ error: 'Unsupported format. Choose csv, xlsx, or pdf.' });
    }
  } catch (error) {
    next(error);
  }
}

async function exportMasterGradebook(req, res, next) {
  try {
    const format = req.params.format.toLowerCase();

    // Fetch students
    const [students] = await pool.execute(
      `SELECT u.id, u.username, u.first_name, u.surname
       FROM users u
       JOIN course_enrollments ce ON ce.student_id = u.id
       WHERE ce.status = 'enrolled'
       ORDER BY u.surname ASC`
    );

    // Fetch attempts
    const [attemptRows] = await pool.execute(
      `SELECT qa.student_id, c.chapter_number,
              COUNT(qa.id) AS attempts_count,
              MAX(qa.correct_answers) AS highest_score
       FROM quiz_attempts qa
       JOIN quizzes q ON q.id = qa.quiz_id
       JOIN chapters c ON c.id = q.chapter_id
       WHERE qa.status != 'in_progress'
       GROUP BY qa.student_id, c.chapter_number`
    );

    const attemptsMap = new Map();
    for (const a of attemptRows) {
      attemptsMap.set(`${a.student_id}_${a.chapter_number}`, a);
    }

    const masterStudents = students.map(s => {
      const chaptersObj = {};
      let totalAttempts = 0;
      let attemptedChaptersCount = 0;
      let totalHighestScoreSum = 0;
      let passedCount = 0;

      for (let ch = 1; ch <= 12; ch++) {
        const att = attemptsMap.get(`${s.id}_${ch}`);
        if (att) {
          totalAttempts += att.attempts_count;
          attemptedChaptersCount++;
          totalHighestScoreSum += (att.highest_score / 20) * 100;
          if (att.highest_score >= 15) passedCount++;

          chaptersObj[ch] = {
            best_score: att.highest_score,
            status: att.highest_score >= 15 ? 'passed' : 'failed'
          };
        } else {
          chaptersObj[ch] = {
            best_score: null,
            status: 'not_attempted'
          };
        }
      }

      const overallAverage = attemptedChaptersCount > 0
        ? Number((totalHighestScoreSum / attemptedChaptersCount).toFixed(1))
        : null;

      const completionPercentage = Number(((passedCount / 12) * 100).toFixed(1));

      return {
        username: s.username,
        first_name: s.first_name,
        surname: s.surname,
        chapters: chaptersObj,
        total_attempts: totalAttempts,
        average_score: overallAverage,
        passed_count: passedCount,
        completion_percentage: completionPercentage
      };
    });

    await auditLog({
      req,
      action: 'export_master_gradebook',
      entityType: 'gradebook',
      entityId: 'master',
      details: { format, enrolledStudentsCount: students.length }
    });

    const filename = `ITEP411T_Master_Gradebook.${format}`;

    if (format === 'csv') {
      const buffer = await generateMasterGradebookCSV({ students: masterStudents });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(buffer);
    } else if (format === 'xlsx') {
      const buffer = await generateMasterGradebookXLSX({ students: masterStudents });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(buffer);
    } else if (format === 'pdf') {
      const buffer = await generateMasterGradebookPDF({ students: masterStudents });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return res.send(buffer);
    } else {
      return res.status(400).json({ error: 'Unsupported format. Choose csv, xlsx, or pdf.' });
    }
  } catch (error) {
    next(error);
  }
}

async function exportMySummary(req, res, next) {
  try {
    const student = req.session.user;
    const format = req.params.format.toLowerCase();

    // Fetch chapters and attempts
    const [chapters] = await pool.execute(`SELECT id, chapter_number, title FROM chapters ORDER BY chapter_number ASC`);
    const [attempts] = await pool.execute(
      `SELECT c.chapter_number, COUNT(qa.id) AS attempts_count,
              MAX(qa.correct_answers) AS best_score,
              MAX(qa.score_percentage) AS best_percentage,
              cp.status AS progress_status
       FROM chapters c
       LEFT JOIN quizzes q ON q.chapter_id = c.id
       LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.student_id = ? AND qa.status != 'in_progress'
       LEFT JOIN chapter_progress cp ON cp.chapter_id = c.id AND cp.student_id = ?
       GROUP BY c.chapter_number, cp.status
       ORDER BY c.chapter_number ASC`,
      [student.id, student.id]
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
        chapterNumber: c.chapter_number,
        title: c.title,
        status: isPassed ? 'passed' : (att?.progress_status || (c.chapter_number === 1 ? 'available' : 'locked')),
        bestScore: att && att.best_score !== null ? att.best_score : null,
        bestPercentage: att && att.best_percentage !== null ? att.best_percentage : null,
        attemptsCount: att ? att.attempts_count : 0
      };
    });

    const averageScore = attemptedCount > 0 ? Number((totalScoreSum / attemptedCount).toFixed(1)) : null;
    const completionPercentage = Number(((passedCount / 12) * 100).toFixed(1));

    await auditLog({
      req,
      action: 'export_student_summary',
      entityType: 'student_summary',
      entityId: student.id,
      details: { format, studentUsername: student.username }
    });

    const filename = `My_DataMining_Progress_${student.username}.${format}`;

    if (format === 'pdf') {
      const buffer = await generateStudentSummaryPDF(student, {
        stats: { passedChapters: passedCount, completionPercentage, averageScore },
        chapters: chapterList
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return res.send(buffer);
    } else {
      return res.status(400).json({ error: 'Format supported for student summary: pdf' });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  exportTopicGradebook,
  exportMasterGradebook,
  exportMySummary
};

