require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { courseData, modulesData, chaptersData } = require('./seedData');

async function runSeed() {
  console.log('--- Starting Data Mining LMS Database Seed ---');

  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    namedPlaceholders: true
  });

  const connection = await pool.getConnection();

  try {
    // 1. Run Schema Migration
    console.log('1. Applying schema...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(schemaSql);

    // Switch to database
    await connection.query('USE datamininglms;');
    await connection.beginTransaction();

    // 2. Insert Course
    console.log('2. Inserting Course metadata...');
    const [courseResult] = await connection.execute(
      `INSERT INTO courses (course_code, course_title, academic_year_level, term, classification, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        courseData.code,
        courseData.title,
        courseData.academicYearLevel,
        courseData.term,
        courseData.classification,
        courseData.description
      ]
    );
    const courseId = courseResult.insertId;

    // 3. Insert Modules
    console.log('3. Inserting 4 Modules...');
    const moduleMap = new Map();
    for (const mod of modulesData) {
      const [modResult] = await connection.execute(
        `INSERT INTO modules (course_id, module_number, title, description)
         VALUES (?, ?, ?, ?)`,
        [courseId, mod.moduleNumber, mod.title, mod.description]
      );
      moduleMap.set(mod.moduleNumber, modResult.insertId);
    }

    // 4. Insert Chapters, Lessons, Quizzes, Questions, and Options
    console.log('4. Inserting 12 Chapters with rich Lessons, Slides, and 240 Questions...');
    const chapterMap = new Map();
    const quizMap = new Map();

    for (const chap of chaptersData) {
      const moduleId = moduleMap.get(chap.moduleNumber);

      const [chapResult] = await connection.execute(
        `INSERT INTO chapters (module_id, chapter_number, title, description, is_published)
         VALUES (?, ?, ?, ?, TRUE)`,
        [moduleId, chap.chapterNumber, chap.title, chap.description]
      );
      const chapterId = chapResult.insertId;
      chapterMap.set(chap.chapterNumber, chapterId);

      // Insert Lesson
      await connection.execute(
        `INSERT INTO lessons (chapter_id, overview, learning_objectives, content, key_concepts, slides_json)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          chapterId,
          chap.overview,
          JSON.stringify(chap.objectives),
          chap.content,
          chap.keyConcepts,
          JSON.stringify(chap.slides)
        ]
      );

      // Insert Quiz
      const [quizResult] = await connection.execute(
        `INSERT INTO quizzes (chapter_id, title, version, time_limit_seconds, question_count, passing_score, status, published_at)
         VALUES (?, ?, 1, 600, 20, 75.00, 'published', NOW())`,
        [chapterId, `${chap.title} - Comprehensive Quiz`]
      );
      const quizId = quizResult.insertId;
      quizMap.set(chap.chapterNumber, quizId);

      // Insert 20 Questions
      for (const q of chap.questions) {
        const [qResult] = await connection.execute(
          `INSERT INTO questions (quiz_id, question_text, question_type, points, position)
           VALUES (?, ?, 'multiple_choice', 1.00, ?)`,
          [quizId, q.questionText, q.questionNumber]
        );
        const questionId = qResult.insertId;

        // Insert Options
        for (const opt of q.options) {
          await connection.execute(
            `INSERT INTO question_options (question_id, option_text, option_label, is_correct)
             VALUES (?, ?, ?, ?)`,
            [questionId, opt.text, opt.label, opt.isCorrect]
          );
        }
      }
    }

    // 5. Insert Users (Faculty and Students)
    console.log('5. Inserting Users with secure bcrypt hashes...');
    const facultyPassHash = await bcrypt.hash(process.env.FACULTY_PASSWORD || 'FacultyPass123!', 12);
    const studentPassHash = await bcrypt.hash(process.env.STUDENT_PASSWORD || 'StudentPass123!', 12);

    // Faculty
    const [facultyResult] = await connection.execute(
      `INSERT INTO users (username, password_hash, first_name, surname, role)
       VALUES (?, ?, ?, ?, 'faculty')`,
      [
        process.env.FACULTY_USERNAME || 'faculty',
        facultyPassHash,
        process.env.FACULTY_FIRST_NAME || 'Dr. Evelyn',
        process.env.FACULTY_SURNAME || 'Vance'
      ]
    );
    const facultyUserId = facultyResult.insertId;

    // Student 1 (Advanced Student)
    const [student1Result] = await connection.execute(
      `INSERT INTO users (username, password_hash, first_name, surname, role)
       VALUES ('student1', ?, 'Alex', 'Mercer', 'student')`,
      [studentPassHash]
    );
    const student1Id = student1Result.insertId;

    // Student 2 (Student with Retake History)
    const [student2Result] = await connection.execute(
      `INSERT INTO users (username, password_hash, first_name, surname, role)
       VALUES ('student2', ?, 'Beatrix', 'Kiddo', 'student')`,
      [studentPassHash]
    );
    const student2Id = student2Result.insertId;

    // Student 3 (Newly Enrolled Student)
    const [student3Result] = await connection.execute(
      `INSERT INTO users (username, password_hash, first_name, surname, role)
       VALUES ('student3', ?, 'Carlos', 'Rodriguez', 'student')`,
      [studentPassHash]
    );
    const student3Id = student3Result.insertId;

    const studentIds = [student1Id, student2Id, student3Id];

    // 6. Enroll Students & Initialize Chapter Progress
    console.log('6. Enrolling students and initializing chapter progress...');
    for (const studentId of studentIds) {
      await connection.execute(
        `INSERT INTO course_enrollments (course_id, student_id, status)
         VALUES (?, ?, 'enrolled')`,
        [courseId, studentId]
      );

      for (let ch = 1; ch <= 12; ch++) {
        const chapterId = chapterMap.get(ch);
        // Chapter 1 is available by default, chapters 2-12 are locked
        const initialStatus = ch === 1 ? 'available' : 'locked';
        await connection.execute(
          `INSERT INTO chapter_progress (student_id, chapter_id, status)
           VALUES (?, ?, ?)`,
          [studentId, chapterId, initialStatus]
        );
      }
    }

    // 7. Seed Sample Quiz Attempts for Realistic Gradebook Demonstration
    console.log('7. Seeding sample realistic attempts and unlocks...');

    // Function to simulate quiz submission for seed data
    async function recordSeedAttempt(studentId, chapterNum, score, startedMinutesAgo) {
      const quizId = quizMap.get(chapterNum);
      const chapterId = chapterMap.get(chapterNum);
      const startedAt = new Date(Date.now() - startedMinutesAgo * 60 * 1000);
      const submittedAt = new Date(startedAt.getTime() + 8.5 * 60 * 1000); // 8.5 minutes later
      const percentage = (score / 20) * 100;
      const status = score >= 15 ? 'passed' : 'failed';

      // Insert attempt
      const [attemptRes] = await connection.execute(
        `INSERT INTO quiz_attempts (student_id, quiz_id, quiz_version, started_at, submitted_at, correct_answers, score_percentage, status)
         VALUES (?, ?, 1, ?, ?, ?, ?, ?)`,
        [studentId, quizId, startedAt, submittedAt, score, percentage, status]
      );
      const attemptId = attemptRes.insertId;

      // Fetch questions & correct options for this quiz
      const [questions] = await connection.execute(
        `SELECT q.id, qo.id AS correct_opt_id
         FROM questions q
         JOIN question_options qo ON qo.question_id = q.id AND qo.is_correct = TRUE
         WHERE q.quiz_id = ?
         ORDER BY q.position`,
        [quizId]
      );

      // Record answers: first 'score' questions get correct option, remaining get incorrect
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const isCorrect = i < score;

        let selectedOptId = q.correct_opt_id;
        if (!isCorrect) {
          const [wrongOpts] = await connection.execute(
            `SELECT id FROM question_options WHERE question_id = ? AND is_correct = FALSE LIMIT 1`,
            [q.id]
          );
          selectedOptId = wrongOpts[0]?.id || q.correct_opt_id;
        }

        await connection.execute(
          `INSERT INTO attempt_answers (attempt_id, question_id, selected_option_id, is_correct)
           VALUES (?, ?, ?, ?)`,
          [attemptId, q.id, selectedOptId, isCorrect]
        );
      }

      // Update chapter_progress if passed
      if (score >= 15) {
        await connection.execute(
          `UPDATE chapter_progress
           SET status = 'passed', passed_at = ?
           WHERE student_id = ? AND chapter_id = ?`,
          [submittedAt, studentId, chapterId]
        );

        // Unlock next chapter if it exists
        if (chapterNum < 12) {
          const nextChapId = chapterMap.get(chapterNum + 1);
          await connection.execute(
            `UPDATE chapter_progress
             SET status = 'available'
             WHERE student_id = ? AND chapter_id = ? AND status = 'locked'`,
            [studentId, nextChapId]
          );
        }
      } else {
        // If not already passed, mark failed (still available for retake)
        await connection.execute(
          `UPDATE chapter_progress
           SET status = 'failed'
           WHERE student_id = ? AND chapter_id = ? AND status != 'passed'`,
          [studentId, chapterId]
        );
      }
    }

    // Student 1: Passed Ch1 (19/20) and Ch2 (18/20), Ch3 is available
    await recordSeedAttempt(student1Id, 1, 19, 120);
    await recordSeedAttempt(student1Id, 2, 18, 60);

    // Student 2: Failed Ch1 first (13/20), then retook and passed Ch1 (16/20); took Ch2 and failed (14/20)
    await recordSeedAttempt(student2Id, 1, 13, 180);
    await recordSeedAttempt(student2Id, 1, 16, 100);
    await recordSeedAttempt(student2Id, 2, 14, 40);

    // Student 3: Has not taken any quiz yet (Ch1 is available)

    // 8. Insert System Settings
    console.log('8. Initializing System Settings...');
    await connection.execute(
      `INSERT INTO system_settings (setting_key, setting_value)
       VALUES
       ('quiz_time_limit_seconds', '600'),
       ('quiz_passing_threshold', '75.0'),
       ('allow_retakes', 'true'),
       ('academic_year', '2026-2027')`
    );

    // 9. Initial Audit Log
    console.log('9. Writing Initial Audit Logs...');
    await connection.execute(
      `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details_json, ip_address, request_id)
       VALUES (?, 'system_seed', 'course', ?, ?, '127.0.0.1', 'seed-init-0001')`,
      [
        facultyUserId,
        String(courseId),
        JSON.stringify({
          message: 'Initial curriculum seeded: 4 modules, 12 chapters, 240 questions.',
          courseCode: courseData.code
        })
      ]
    );

    await connection.commit();
    console.log('✅ Database successfully seeded!');
    console.log('----------------------------------------------------');
    console.log('Faculty Account:');
    console.log(`  Username: ${process.env.FACULTY_USERNAME || 'faculty'}`);
    console.log(`  Password: ${process.env.FACULTY_PASSWORD || 'FacultyPass123!'}`);
    console.log('Student Accounts:');
    console.log('  Username: student1  |  Password: StudentPass123!');
    console.log('  Username: student2  |  Password: StudentPass123!');
    console.log('  Username: student3  |  Password: StudentPass123!');
    console.log('----------------------------------------------------');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Seeding failed with error:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runSeed };

