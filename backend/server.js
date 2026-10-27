require('dotenv').config();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');
const multer = require('multer');
const mysql = require('mysql2/promise');

const app = express();
const port = Number(process.env.PORT || 3000);
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'datamininglms',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true
});
const uploadDir = path.resolve(__dirname, process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, '..', 'frontend')));

const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'development-only-change-me',
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore({}, pool),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8
  }
};
app.use(session(sessionOptions));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true }));

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  next();
};
const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ error: 'Authentication required' });
  next();
};
const requireFaculty = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'faculty') return res.status(403).json({ error: 'Faculty access required' });
  next();
};
const csrf = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (!req.session.csrfToken || req.get('x-csrf-token') !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next();
};
app.use('/api', csrf);

async function audit(req, action, entityType, entityId = null) {
  await pool.execute(
    'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address) VALUES (?, ?, ?, ?, ?)',
    [req.session.user?.id || null, action, entityType, entityId, req.ip]
  );
}
function publicUser(user) {
  return { id: user.id, username: user.username, firstName: user.first_name, surname: user.surname, role: user.role };
}

app.get('/api/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok' }); }
  catch (error) { res.status(503).json({ status: 'unavailable' }); }
});
app.get('/api/auth/csrf', (req, res) => {
  if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  res.json({ csrfToken: req.session.csrfToken });
});
app.post('/api/auth/register', [
  body('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9._-]+$/),
  body('password').isLength({ min: 10, max: 128 }),
  body('firstName').trim().isLength({ min: 1, max: 80 }),
  body('surname').trim().isLength({ min: 1, max: 80 })
], validate, async (req, res, next) => {
  try {
    const { username, password, firstName, surname } = req.body;
    const hash = await bcrypt.hash(password, 12);
    await pool.execute('INSERT INTO users (username, password_hash, first_name, surname, role) VALUES (?, ?, ?, ?, ?)',
      [username, hash, firstName, surname, 'student']);
    await audit(req, 'register', 'user', username);
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username is already in use' });
    next(error);
  }
});
app.post('/api/auth/login', [
  body('username').trim().isLength({ min: 3, max: 50 }),
  body('password').isLength({ min: 1, max: 128 })
], validate, async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [req.body.username]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) return res.status(401).json({ error: 'Invalid username or password' });
    req.session.regenerate(async (regenerateError) => {
      if (regenerateError) return next(regenerateError);
      req.session.user = publicUser(user);
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
      await audit(req, 'login', 'user', user.id);
      res.json({ user: req.session.user, csrfToken: req.session.csrfToken });
    });
  } catch (error) { next(error); }
});
app.post('/api/auth/logout', requireAuth, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('connect.sid');
    res.status(204).end();
  });
});
app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: req.session.user, csrfToken: req.session.csrfToken }));

app.get('/api/course', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT m.id moduleId, m.module_number moduleNumber, m.title moduleTitle,
             c.id, c.chapter_number chapterNumber, c.title, c.overview, c.objectives,
             c.published, q.id quizId
      FROM modules m LEFT JOIN chapters c ON c.module_id=m.id
      LEFT JOIN quizzes q ON q.chapter_id=c.id ORDER BY m.module_number, c.chapter_number`);
    const [attempts] = req.session.user.role === 'student'
      ? await pool.execute(`SELECT c.chapter_number chapterNumber, MAX(a.score) score
          FROM attempts a JOIN quizzes q ON q.id=a.quiz_id JOIN chapters c ON c.id=q.chapter_id
          WHERE a.user_id=? GROUP BY c.chapter_number`, [req.session.user.id])
      : [[]];
    const scores = new Map(attempts.map((a) => [a.chapterNumber, a.score]));
    const modules = [];
    for (const row of rows) {
      let module = modules.find((item) => item.id === row.moduleId);
      if (!module) { module = { id: row.moduleId, number: row.moduleNumber, title: row.moduleTitle, chapters: [] }; modules.push(module); }
      if (row.id) module.chapters.push({
        id: row.id, number: row.chapterNumber, title: row.title, overview: row.overview,
        objectives: typeof row.objectives === 'string' ? JSON.parse(row.objectives) : row.objectives,
        quizId: row.quizId, status: req.session.user.role === 'faculty' ? 'available'
          : row.chapterNumber === 1 || scores.get(row.chapterNumber - 1) >= 15 ? (scores.get(row.chapterNumber) >= 15 ? 'passed' : 'available') : 'locked',
        bestScore: scores.get(row.chapterNumber) ?? null
      });
    }
    res.json({ course: { title: 'Data Mining (Elective 2)', code: 'ITEP411-T', classification: 'IT Professional Elective 2', academicLevel: '4th Year', term: '1st Term (4-1)', modules } });
  } catch (error) { next(error); }
});
app.get('/api/chapters/:id', requireAuth, [param('id').isInt({ min: 1 })], validate, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`SELECT c.*, m.title moduleTitle, q.id quizId
      FROM chapters c JOIN modules m ON m.id=c.module_id LEFT JOIN quizzes q ON q.chapter_id=c.id WHERE c.id=?`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Chapter not found' });
    const chapter = rows[0];
    if (req.session.user.role === 'student') {
      const [gate] = await pool.execute(`SELECT c.chapter_number, COALESCE(MAX(a.score),0) bestScore
        FROM chapters c LEFT JOIN quizzes q ON q.chapter_id=c.id LEFT JOIN attempts a ON a.quiz_id=q.id AND a.user_id=?
        WHERE c.id=? GROUP BY c.id`, [req.session.user.id, req.params.id]);
      if (chapter.chapter_number > 1 && (!gate[0] || gate[0].bestScore < 15)) return res.status(403).json({ error: 'Complete the previous chapter with at least 15 correct answers first' });
    }
    chapter.objectives = typeof chapter.objectives === 'string' ? JSON.parse(chapter.objectives) : chapter.objectives;
    res.json({ chapter });
  } catch (error) { next(error); }
});
app.get('/api/chapters/:id/quiz', requireAuth, [param('id').isInt({ min: 1 })], validate, async (req, res, next) => {
  try {
    const [gate] = await pool.execute(`SELECT c.chapter_number, q.id quizId FROM chapters c JOIN quizzes q ON q.chapter_id=c.id WHERE c.id=?`, [req.params.id]);
    if (!gate[0]) return res.status(404).json({ error: 'Quiz not found' });
    if (req.session.user.role === 'student' && gate[0].chapter_number > 1) {
      const [previous] = await pool.execute(`SELECT MAX(a.score) bestScore FROM attempts a JOIN quizzes q ON q.id=a.quiz_id JOIN chapters c ON c.id=q.chapter_id WHERE a.user_id=? AND c.chapter_number=?`, [req.session.user.id, gate[0].chapter_number - 1]);
      if (!previous[0] || previous[0].bestScore < 15) return res.status(403).json({ error: 'Previous chapter must be passed first' });
    }
    const [questions] = await pool.execute('SELECT id, question_number questionNumber, prompt, options FROM questions WHERE quiz_id=? ORDER BY question_number', [gate[0].quizId]);
    res.json({ quizId: gate[0].quizId, timeLimitSeconds: 600, questions: questions.map((q) => ({ ...q, options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options })) });
  } catch (error) { next(error); }
});
app.post('/api/quizzes/:quizId/attempts', requireAuth, [
  param('quizId').isInt({ min: 1 }),
  body('startedAt').isISO8601(),
  body('answers').isArray({ min: 20, max: 20 }),
  body('answers.*.questionId').isInt({ min: 1 }),
  body('answers.*.selectedOption').isInt({ min: 0, max: 20 })
], validate, async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const [questions] = await connection.execute('SELECT id, correct_option FROM questions WHERE quiz_id=? ORDER BY question_number', [req.params.quizId]);
    if (questions.length !== 20) return res.status(409).json({ error: 'This quiz is not ready: it must contain exactly 20 questions' });
    if (Date.now() - new Date(req.body.startedAt).getTime() > 610000) return res.status(400).json({ error: 'The 10-minute time limit has expired' });
    const answerMap = new Map(req.body.answers.map((answer) => [Number(answer.questionId), Number(answer.selectedOption)]));
    const score = questions.reduce((total, question) => total + (answerMap.get(question.id) === question.correct_option ? 1 : 0), 0);
    await connection.beginTransaction();
    const [attempt] = await connection.execute('INSERT INTO attempts (quiz_id,user_id,score,started_at) VALUES (?,?,?,?,?)', [req.params.quizId, req.session.user.id, score, new Date(req.body.startedAt)]);
    for (const question of questions) await connection.execute('INSERT INTO attempt_answers (attempt_id,question_id,selected_option) VALUES (?,?,?)', [attempt.insertId, question.id, answerMap.get(question.id) ?? 0]);
    await connection.commit();
    await audit(req, 'submit_attempt', 'quiz', req.params.quizId);
    res.status(201).json({ attemptId: attempt.insertId, score, passed: score >= 15 });
  } catch (error) { await connection.rollback(); next(error); } finally { connection.release(); }
});

const storage = multer.diskStorage({ destination: uploadDir, filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`) });
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.mimetype)) });
app.post('/api/chapters/:id/files', requireFaculty, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Only PDF and PowerPoint files up to 10 MB are accepted' });
    await pool.execute('INSERT INTO lesson_files (chapter_id, original_name, stored_name, mime_type, size_bytes) VALUES (?,?,?,?,?)', [req.params.id, req.file.originalname, req.file.filename, req.file.mimetype, req.file.size]);
    await audit(req, 'upload_file', 'chapter', req.params.id);
    res.status(201).json({ message: 'File uploaded' });
  } catch (error) { if (req.file) fs.rmSync(path.join(uploadDir, req.file.filename), { force: true }); next(error); }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'An unexpected server error occurred' });
});
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Route not found' });
  if (req.accepts('html')) return res.sendFile(path.resolve(__dirname, '..', 'frontend', 'index.html'));
  next();
});
if (require.main === module) app.listen(port, () => console.log(`LMS server listening on port ${port}`));
module.exports = { app, pool };
