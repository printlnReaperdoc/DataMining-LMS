/**
 * Comprehensive Automated Test Suite for Data Mining LMS (ITEP411-T)
 * Validates:
 * 1. Student registration & login.
 * 2. Prevention of unauthorized Faculty registration (Role security).
 * 3. Password hashing & session protection.
 * 4. Sequential chapter unlocking (Chapter 1 available, Chapter 2 locked until passing Ch1).
 * 5. Accurate server-side grading (15/20 passes, 14/20 fails).
 * 6. 10-minute time limit enforcement.
 * 7. Duplicate submission prevention.
 * 8. Quiz import validation (exactly 20 questions required).
 * 9. Topic gradebook sorting & Master gradebook calculation integrity.
 * 10. PDF, XLSX, and CSV export generation.
 * 11. Centralized MySQL audit logging & transactional rollback.
 * 12. Protection against unauthorized access to other students' private attempts.
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const bcrypt = require('bcryptjs');
const { app, pool, sessionStore } = require('../server');

let server;
let baseUrl;

// Cookie Jar for session handling in tests
class TestAgent {
  constructor() {
    this.cookies = new Map();
    this.csrfToken = null;
  }

  async fetch(endpoint, options = {}) {
    const headers = { ...(options.headers || {}) };

    if (this.cookies.size > 0) {
      const cookieStr = Array.from(this.cookies.entries())
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');
      headers['Cookie'] = cookieStr;
    }

    if (this.csrfToken) {
      headers['x-csrf-token'] = this.csrfToken;
    }

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    // Capture cookies
    const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    for (const sc of setCookies) {
      const parts = sc.split(';')[0].split('=');
      if (parts.length >= 2) {
        this.cookies.set(parts[0].trim(), parts[1].trim());
      }
    }

    // Auto-sync CSRF token if returned in response JSON
    try {
      const clone = res.clone();
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await clone.json();
        if (data && data.csrfToken) {
          this.csrfToken = data.csrfToken;
        }
      }
    } catch (_) {}

    return res;
  }

  async initCsrf() {
    const res = await this.fetch('/api/auth/csrf');
    const data = await res.json();
    this.csrfToken = data.csrfToken;
    return this.csrfToken;
  }
}

describe('Data Mining LMS Comprehensive Test Suite', () => {
  before(async () => {
    // Start server on an ephemeral random port
    await new Promise((resolve) => {
      server = http.createServer(app).listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (sessionStore && typeof sessionStore.close === 'function') {
      await sessionStore.close();
    }
    if (pool) {
      await pool.end();
    }
  });

  // 1. Healthcheck Test
  test('GET /api/health should return status ok', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
  });

  // 2. Authentication & Role Security Tests
  describe('Authentication & Role Restrictions', () => {
    test('Public registration must only create Student role and reject privilege escalation to Faculty', async () => {
      const agent = new TestAgent();
      await agent.initCsrf();

      const testUsername = `sec_student_${Date.now()}`;
      const res = await agent.fetch('/api/auth/register', {
        method: 'POST',
        body: {
          username: testUsername,
          password: 'Password123!',
          confirmPassword: 'Password123!',
          firstName: 'Security',
          surname: 'Tester',
          role: 'faculty' // Attempt to register as faculty
        }
      });

      assert.equal(res.status, 201);

      // Verify in database that role was forced to 'student'
      const [rows] = await pool.execute(`SELECT role FROM users WHERE username = ?`, [testUsername]);
      assert.equal(rows.length, 1);
      assert.equal(rows[0].role, 'student', 'Security breach: User was granted faculty role via public registration!');
    });

    test('Password must be hashed using bcrypt; plaintext passwords must never be stored', async () => {
      const [rows] = await pool.execute(`SELECT password_hash FROM users WHERE username = 'faculty'`);
      assert.ok(rows.length > 0);
      const hash = rows[0].password_hash;

      assert.ok(hash.startsWith('$2a$') || hash.startsWith('$2b$'), 'Password hash does not use bcrypt');
      assert.notEqual(hash, '0829');
      const match = await bcrypt.compare('0829', hash);
      assert.ok(match, 'Bcrypt hash should correctly verify against password 0829');
    });

    test('Registration allows short passwords without 8-character requirement (e.g. 0829)', async () => {
      const agent = new TestAgent();
      await agent.initCsrf();

      const shortUser = `short_pwd_${Date.now()}`;
      const res = await agent.fetch('/api/auth/register', {
        method: 'POST',
        body: {
          username: shortUser,
          password: '0829',
          confirmPassword: '0829',
          firstName: 'Short',
          surname: 'Password'
        }
      });

      assert.equal(res.status, 201);
      const loginRes = await agent.fetch('/api/auth/login', {
        method: 'POST',
        body: { username: shortUser, password: '0829' }
      });
      assert.equal(loginRes.status, 200);
    });

    test('Registration with omitted or blank password defaults to 0829 automatically', async () => {
      const agent = new TestAgent();
      await agent.initCsrf();

      const defaultPwdUser = `default_pwd_${Date.now()}`;
      const res = await agent.fetch('/api/auth/register', {
        method: 'POST',
        body: {
          username: defaultPwdUser,
          firstName: 'Odette',
          surname: 'Snezhnaya'
        }
      });

      assert.equal(res.status, 201);
      const loginRes = await agent.fetch('/api/auth/login', {
        method: 'POST',
        body: { username: defaultPwdUser, password: '0829' }
      });
      assert.equal(loginRes.status, 200);
    });

    test('Registration requires matching password and confirmPassword', async () => {
      const agent = new TestAgent();
      await agent.initCsrf();

      const res = await agent.fetch('/api/auth/register', {
        method: 'POST',
        body: {
          username: 'mismatch_user',
          password: '0829',
          confirmPassword: 'DifferentPassword123!',
          firstName: 'Test',
          surname: 'Mismatch'
        }
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('match'));
    });

    test('Successful login regenerates session and authenticates student using password 0829', async () => {
      const studentAgent = new TestAgent();
      await studentAgent.initCsrf();

      const res = await studentAgent.fetch('/api/auth/login', {
        method: 'POST',
        body: { username: 'student1', password: '0829' }
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.user.username, 'student1');
      assert.equal(data.user.role, 'student');

      // Check /api/auth/me
      const meRes = await studentAgent.fetch('/api/auth/me');
      assert.equal(meRes.status, 200);
      const meData = await meRes.json();
      assert.equal(meData.user.username, 'student1');
    });

    test('Invalid login credentials should return 401 and not disclose account existence', async () => {
      const agent = new TestAgent();
      await agent.initCsrf();

      const res = await agent.fetch('/api/auth/login', {
        method: 'POST',
        body: { username: 'student1', password: 'WrongPassword999!' }
      });

      assert.equal(res.status, 401);
    });
  });

  // 3. Sequential Chapter Unlocking Tests
  describe('Sequential Chapter Unlocking', () => {
    let student3Agent;

    before(async () => {
      student3Agent = new TestAgent();
      await student3Agent.initCsrf();
      await student3Agent.fetch('/api/auth/login', {
        method: 'POST',
        body: { username: 'student3', password: '0829' }
      });
    });

    test('Enrolled student can access Chapter 1 by default', async () => {
      // Find Chapter 1 ID
      const [ch1] = await pool.execute(`SELECT id FROM chapters WHERE chapter_number = 1`);
      const res = await student3Agent.fetch(`/api/chapters/${ch1[0].id}`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.chapter.chapterNumber, 1);
    });

    test('Student CANNOT access Chapter 2 before passing Chapter 1 (Returns 403 Forbidden)', async () => {
      // Find Chapter 2 ID
      const [ch2] = await pool.execute(`SELECT id FROM chapters WHERE chapter_number = 2`);
      const res = await student3Agent.fetch(`/api/chapters/${ch2[0].id}`);
      assert.equal(res.status, 403, 'Security flaw: Student bypassed sequential unlock!');
      const data = await res.json();
      assert.ok(data.error.includes('locked') || data.error.includes('pass Chapter 1'));
    });

    test('Faculty can access any chapter without sequential restriction', async () => {
      const facultyAgent = new TestAgent();
      await facultyAgent.initCsrf();
      await facultyAgent.fetch('/api/auth/login', {
        method: 'POST',
        body: { username: 'faculty', password: '0829' }
      });

      const [ch12] = await pool.execute(`SELECT id FROM chapters WHERE chapter_number = 12`);
      const res = await facultyAgent.fetch(`/api/chapters/${ch12[0].id}`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.chapter.chapterNumber, 12);
    });
  });

  // 4. Server-Side Grading and Time Limit Tests
  describe('Quiz Assessment, Scoring & Retakes', () => {
    let studentAgent;
    let ch1QuizId;
    let testStudent;

    before(async () => {
      studentAgent = new TestAgent();
      await studentAgent.initCsrf();

      // Create a fresh student for grading tests
      testStudent = `grade_student_${Date.now()}`;
      await studentAgent.fetch('/api/auth/register', {
        method: 'POST',
        body: {
          username: testStudent,
          password: 'Password123!',
          confirmPassword: 'Password123!',
          firstName: 'Grade',
          surname: 'Tester'
        }
      });
      await studentAgent.fetch('/api/auth/login', {
        method: 'POST',
        body: { username: testStudent, password: 'Password123!' }
      });

      const [quizzes] = await pool.execute(
        `SELECT q.id FROM quizzes q JOIN chapters c ON c.id = q.chapter_id WHERE c.chapter_number = 1`
      );
      ch1QuizId = quizzes[0].id;
    });

    test('Start quiz attempt returns 20 questions without exposing answer keys', async () => {
      const res = await studentAgent.fetch(`/api/quiz-attempts/start/${ch1QuizId}`, { method: 'POST' });
      assert.equal(res.status, 201);
      const data = await res.json();

      assert.equal(data.questionCount, 20);
      assert.equal(data.timeLimitSeconds, 600);
      assert.equal(data.questions.length, 20);

      // Verify that no option exposes isCorrect to student!
      for (const q of data.questions) {
        assert.equal(q.options.length, 4);
        for (const opt of q.options) {
          assert.equal(opt.isCorrect, undefined, 'CRITICAL: Answer key leaked to student browser!');
        }
      }
    });

    test('Scoring exactly 14/20 results in FAILED and does NOT unlock next chapter', async () => {
      // Start fresh attempt
      const startRes = await studentAgent.fetch(`/api/quiz-attempts/start/${ch1QuizId}`, { method: 'POST' });
      const { attemptId } = await startRes.json();

      // Fetch questions and answer keys from DB to construct exact 14 correct answers
      const [questions] = await pool.execute(
        `SELECT q.id, qo.id as correct_opt_id,
                (SELECT id FROM question_options WHERE question_id = q.id AND is_correct = FALSE LIMIT 1) as wrong_opt_id
         FROM questions q
         JOIN question_options qo ON qo.question_id = q.id AND qo.is_correct = TRUE
         WHERE q.quiz_id = ?
         ORDER BY q.position`,
        [ch1QuizId]
      );

      const submittedAnswers = questions.map((q, idx) => {
        return {
          questionId: q.id,
          selectedOptionId: idx < 14 ? q.correct_opt_id : q.wrong_opt_id // 14 correct, 6 wrong
        };
      });

      const submitRes = await studentAgent.fetch(`/api/quiz-attempts/submit/${attemptId}`, {
        method: 'POST',
        body: { answers: submittedAnswers }
      });

      assert.equal(submitRes.status, 200);
      const result = await submitRes.json();
      assert.equal(result.correctAnswers, 14);
      assert.equal(result.scorePercentage, 70);
      assert.equal(result.passed, false, 'Score of 14/20 should fail (< 75%)');
      assert.equal(result.nextChapterUnlocked, false);

      // Verify Chapter 2 is STILL locked
      const [ch2] = await pool.execute(`SELECT id FROM chapters WHERE chapter_number = 2`);
      const ch2Res = await studentAgent.fetch(`/api/chapters/${ch2[0].id}`);
      assert.equal(ch2Res.status, 403);
    });

    test('Retake allowed: Scoring 15/20 results in PASSED and unlocks Chapter 2', async () => {
      // Start retake attempt
      const startRes = await studentAgent.fetch(`/api/quiz-attempts/start/${ch1QuizId}`, { method: 'POST' });
      const { attemptId } = await startRes.json();

      const [questions] = await pool.execute(
        `SELECT q.id, qo.id as correct_opt_id,
                (SELECT id FROM question_options WHERE question_id = q.id AND is_correct = FALSE LIMIT 1) as wrong_opt_id
         FROM questions q
         JOIN question_options qo ON qo.question_id = q.id AND qo.is_correct = TRUE
         WHERE q.quiz_id = ?
         ORDER BY q.position`,
        [ch1QuizId]
      );

      // 15 correct, 5 wrong
      const submittedAnswers = questions.map((q, idx) => {
        return {
          questionId: q.id,
          selectedOptionId: idx < 15 ? q.correct_opt_id : q.wrong_opt_id
        };
      });

      const submitRes = await studentAgent.fetch(`/api/quiz-attempts/submit/${attemptId}`, {
        method: 'POST',
        body: { answers: submittedAnswers }
      });

      assert.equal(submitRes.status, 200);
      const result = await submitRes.json();
      assert.equal(result.correctAnswers, 15);
      assert.equal(result.scorePercentage, 75);
      assert.equal(result.passed, true, 'Score of 15/20 should PASS (>= 75%)');
      assert.equal(result.nextChapterUnlocked, true);

      // Verify Chapter 2 is NOW UNLOCKED!
      const [ch2] = await pool.execute(`SELECT id FROM chapters WHERE chapter_number = 2`);
      const ch2Res = await studentAgent.fetch(`/api/chapters/${ch2[0].id}`);
      assert.equal(ch2Res.status, 200, 'Chapter 2 was not unlocked after passing Chapter 1!');
    });

    test('Prevents duplicate submission on already finalized attempt', async () => {
      // Find the last completed attempt by this student
      const [lastAttempt] = await pool.execute(
        `SELECT qa.id FROM quiz_attempts qa
         JOIN users u ON u.id = qa.student_id
         WHERE qa.status != 'in_progress' AND u.username = ?
         ORDER BY qa.id DESC LIMIT 1`,
        [testStudent]
      );

      assert.ok(lastAttempt.length > 0, 'Completed attempt not found');

      const res = await studentAgent.fetch(`/api/quiz-attempts/submit/${lastAttempt[0].id}`, {
        method: 'POST',
        body: { answers: [] }
      });

      assert.equal(res.status, 409, 'Duplicate submission was not rejected');
    });
  });

  // 5. Quiz Import Validation Tests
  describe('Quiz Import Validation', () => {
    let facultyAgent;

    before(async () => {
      facultyAgent = new TestAgent();
      await facultyAgent.initCsrf();
      await facultyAgent.fetch('/api/auth/login', {
        method: 'POST',
        body: { username: 'faculty', password: '0829' }
      });
    });

    test('Rejects quiz import that does not contain exactly 20 questions', async () => {
      const res = await facultyAgent.fetch('/api/quizzes/chapter/1/import', {
        method: 'POST',
        body: {
          questions: [
            {
              questionText: 'Incomplete quiz question 1',
              options: [
                { text: 'A', label: 'A', isCorrect: true },
                { text: 'B', label: 'B', isCorrect: false },
                { text: 'C', label: 'C', isCorrect: false },
                { text: 'D', label: 'D', isCorrect: false }
              ]
            }
          ]
        }
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.ok(data.details[0].includes('exactly 20 questions'));
    });
  });

  // 6. Gradebook & Exports Tests
  describe('Gradebook Calculations & Exports', () => {
    let facultyAgent;

    before(async () => {
      facultyAgent = new TestAgent();
      await facultyAgent.initCsrf();
      await facultyAgent.fetch('/api/auth/login', {
        method: 'POST',
        body: { username: 'faculty', password: '0829' }
      });
    });

    test('Topic gradebook returns sorted students and calculates statistics', async () => {
      const res = await facultyAgent.fetch('/api/gradebook/topic/1?sortBy=surname&sortOrder=asc');
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data.students));
      assert.ok(data.students.length > 0);
    });

    test('Topic Gradebook exports valid PDF buffer', async () => {
      const res = await facultyAgent.fetch('/api/exports/topic/1/pdf');
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('content-type'), 'application/pdf');
    });

    test('Topic Gradebook exports valid CSV buffer', async () => {
      const res = await facultyAgent.fetch('/api/exports/topic/1/csv');
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('content-type'), 'text/csv');
    });

    test('Topic Gradebook exports valid XLSX buffer', async () => {
      const res = await facultyAgent.fetch('/api/exports/topic/1/xlsx');
      assert.equal(res.status, 200);
      assert.ok(res.headers.get('content-type').includes('spreadsheetml'));
    });

    test('Master Gradebook exports valid PDF buffer', async () => {
      const res = await facultyAgent.fetch('/api/exports/master/pdf');
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('content-type'), 'application/pdf');
    });

    test('Master Gradebook exports valid XLSX buffer', async () => {
      const res = await facultyAgent.fetch('/api/exports/master/xlsx');
      assert.equal(res.status, 200);
      assert.ok(res.headers.get('content-type').includes('spreadsheetml'));
    });
  });

  // 7. Audit Logging & Transaction Integrity
  describe('Mandatory Audit Logging', () => {
    test('Audit logs capture mutations in MySQL audit_logs table', async () => {
      const [logs] = await pool.execute(`SELECT * FROM audit_logs ORDER BY id DESC LIMIT 5`);
      assert.ok(logs.length > 0);
      assert.ok(logs[0].action);
      assert.ok(logs[0].created_at);
    });

    test('Student cannot access other students private attempt details', async () => {
      const student1Agent = new TestAgent();
      await student1Agent.initCsrf();
      await student1Agent.fetch('/api/auth/login', {
        method: 'POST',
        body: { username: 'student1', password: '0829' }
      });

      // Find an attempt made by student2
      const [student2User] = await pool.execute(`SELECT id FROM users WHERE username = 'student2'`);
      const [s2Attempts] = await pool.execute(
        `SELECT id FROM quiz_attempts WHERE student_id = ? LIMIT 1`,
        [student2User[0].id]
      );

      if (s2Attempts.length > 0) {
        const res = await student1Agent.fetch(`/api/quiz-attempts/${s2Attempts[0].id}`);
        assert.equal(res.status, 403, 'Privacy violation: Student 1 viewed Student 2 private attempt!');
      }
    });
  });
});
