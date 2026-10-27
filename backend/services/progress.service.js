const { pool } = require('../config/db');
const { auditLog } = require('./audit.service');

/**
 * Check whether a user is authorized to access a chapter.
 * Faculty has unrestricted access.
 * Students must have the chapter unlocked sequentially.
 */
async function canAccessChapter(userId, userRole, chapterId) {
  if (userRole === 'faculty') {
    return { allowed: true, reason: 'Faculty access' };
  }

  // Get chapter details
  const [chapters] = await pool.execute(
    `SELECT c.id, c.chapter_number, c.is_published
     FROM chapters c
     WHERE c.id = ?`,
    [chapterId]
  );

  if (!chapters || chapters.length === 0) {
    return { allowed: false, reason: 'Chapter not found' };
  }

  const chapter = chapters[0];

  // Chapter 1 is unlocked for all enrolled students
  if (chapter.chapter_number === 1) {
    return { allowed: true, reason: 'Chapter 1 is foundational' };
  }

  // Check progress table for current chapter
  const [progress] = await pool.execute(
    `SELECT status FROM chapter_progress WHERE student_id = ? AND chapter_id = ?`,
    [userId, chapterId]
  );

  if (progress.length > 0 && ['available', 'passed', 'failed'].includes(progress[0].status)) {
    return { allowed: true, status: progress[0].status };
  }

  // Double check if previous chapter was passed
  const [prevChapters] = await pool.execute(
    `SELECT c.id FROM chapters c WHERE c.chapter_number = ?`,
    [chapter.chapter_number - 1]
  );

  if (prevChapters.length > 0) {
    const prevChapId = prevChapters[0].id;
    const [prevProgress] = await pool.execute(
      `SELECT status FROM chapter_progress WHERE student_id = ? AND chapter_id = ?`,
      [userId, prevChapId]
    );

    if (prevProgress.length > 0 && prevProgress[0].status === 'passed') {
      // Ensure current chapter is recorded as available
      await pool.execute(
        `INSERT INTO chapter_progress (student_id, chapter_id, status)
         VALUES (?, ?, 'available')
         ON DUPLICATE KEY UPDATE status = IF(status = 'locked', 'available', status)`,
        [userId, chapterId]
      );
      return { allowed: true, status: 'available' };
    }
  }

  return {
    allowed: false,
    reason: `Chapter ${chapter.chapter_number} is locked. You must pass Chapter ${chapter.chapter_number - 1} with at least 15/20 correct answers first.`
  };
}

/**
 * Get full curriculum structure with student's progress and stats
 */
async function getCurriculumWithProgress(user) {
  // Course Metadata
  const [courses] = await pool.execute(
    `SELECT * FROM courses WHERE course_code = 'ITEP411-T' LIMIT 1`
  );
  const course = courses[0] || {
    course_code: 'ITEP411-T',
    course_title: 'Data Mining (Elective 2)',
    academic_year_level: '4th Year',
    term: '1st Term (4-1)',
    classification: 'IT Professional Elective 2'
  };

  // Modules & Chapters
  const [modules] = await pool.execute(
    `SELECT id, module_number, title, description FROM modules ORDER BY module_number ASC`
  );

  const [chapters] = await pool.execute(
    `SELECT c.id, c.module_id, c.chapter_number, c.title, c.description, c.is_published,
            q.id AS quiz_id, q.version AS quiz_version, q.question_count, q.time_limit_seconds, q.status AS quiz_status
     FROM chapters c
     LEFT JOIN quizzes q ON q.chapter_id = c.id
     ORDER BY c.chapter_number ASC`
  );

  let studentProgressMap = new Map();
  let studentBestScoreMap = new Map();
  let studentAttemptsCountMap = new Map();

  if (user.role === 'student') {
    const [progressRows] = await pool.execute(
      `SELECT cp.chapter_id, cp.status, cp.passed_at,
              COALESCE(MAX(qa.correct_answers), 0) as best_score,
              COALESCE(MAX(qa.score_percentage), 0.0) as best_percentage,
              COUNT(qa.id) as attempts_count
       FROM chapter_progress cp
       LEFT JOIN quizzes q ON q.chapter_id = cp.chapter_id
       LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.student_id = cp.student_id AND qa.status != 'in_progress'
       WHERE cp.student_id = ?
       GROUP BY cp.chapter_id, cp.status, cp.passed_at`,
      [user.id]
    );

    for (const row of progressRows) {
      studentProgressMap.set(row.chapter_id, row.status);
      studentBestScoreMap.set(row.chapter_id, {
        score: row.best_score,
        percentage: row.best_percentage,
        passedAt: row.passed_at
      });
      studentAttemptsCountMap.set(row.chapter_id, row.attempts_count);
    }
  }

  // Construct hierarchical module -> chapter tree
  let passedChaptersCount = 0;
  let totalAttemptedScoreSum = 0;
  let totalAttemptedCount = 0;

  const curriculum = modules.map(m => {
    const moduleChapters = chapters
      .filter(c => c.module_id === m.id)
      .map(c => {
        let status = 'available';
        let best = null;
        let attemptsCount = 0;

        if (user.role === 'faculty') {
          status = 'available';
        } else {
          status = studentProgressMap.get(c.id) || (c.chapter_number === 1 ? 'available' : 'locked');
          best = studentBestScoreMap.get(c.id) || null;
          attemptsCount = studentAttemptsCountMap.get(c.id) || 0;

          if (status === 'passed') {
            passedChaptersCount++;
          }
          if (attemptsCount > 0 && best) {
            totalAttemptedScoreSum += (best.score / 20) * 100;
            totalAttemptedCount++;
          }
        }

        return {
          id: c.id,
          chapterNumber: c.chapter_number,
          title: c.title,
          description: c.description,
          isPublished: Boolean(c.is_published),
          quizId: c.quiz_id,
          quizStatus: c.quiz_status,
          timeLimitSeconds: c.time_limit_seconds || 600,
          status, // 'locked' | 'available' | 'passed' | 'failed'
          bestScore: best ? best.score : null,
          bestPercentage: best ? best.percentage : null,
          attemptsCount
        };
      });

    return {
      id: m.id,
      moduleNumber: m.module_number,
      title: m.title,
      description: m.description,
      chapters: moduleChapters
    };
  });

  const overallAverage = totalAttemptedCount > 0 ? Number((totalAttemptedScoreSum / totalAttemptedCount).toFixed(1)) : null;
  const completionPercentage = Number(((passedChaptersCount / 12) * 100).toFixed(1));

  return {
    course: {
      code: course.course_code,
      title: course.course_title,
      academicLevel: course.academic_year_level,
      term: course.term,
      classification: course.classification,
      description: course.description
    },
    stats: user.role === 'student' ? {
      passedChapters: passedChaptersCount,
      totalChapters: 12,
      completionPercentage,
      averageScore: overallAverage,
      attemptedCount: totalAttemptedCount,
      remainingAssessments: 12 - passedChaptersCount
    } : null,
    modules: curriculum
  };
}

module.exports = {
  canAccessChapter,
  getCurriculumWithProgress
};

