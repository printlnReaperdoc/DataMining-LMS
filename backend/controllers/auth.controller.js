const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool, withTransaction } = require('../config/db');
const { auditLog } = require('../services/audit.service');

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    firstName: user.first_name,
    surname: user.surname,
    role: user.role,
    isActive: Boolean(user.is_active)
  };
}

async function getCsrfToken(req, res) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.json({ csrfToken: req.session.csrfToken });
}

async function register(req, res, next) {
  try {
    const { username, password, confirmPassword, firstName, surname, role } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Role Security Requirement: Public registration must NEVER allow creating Faculty accounts!
    // Public users always register as Students.
    const assignedRole = 'student';

    // Hash password
    const hash = await bcrypt.hash(password, 12);

    await withTransaction(async (conn) => {
      // 1. Insert user
      const [userResult] = await conn.execute(
        `INSERT INTO users (username, password_hash, first_name, surname, role)
         VALUES (?, ?, ?, ?, ?)`,
        [username, hash, firstName, surname, assignedRole]
      );
      const newUserId = userResult.insertId;

      // 2. Fetch course ID
      const [courses] = await conn.execute(`SELECT id FROM courses WHERE course_code = 'ITEP411-T' LIMIT 1`);
      if (courses.length > 0) {
        const courseId = courses[0].id;

        // 3. Enroll student
        await conn.execute(
          `INSERT INTO course_enrollments (course_id, student_id, status)
           VALUES (?, ?, 'enrolled')`,
          [courseId, newUserId]
        );

        // 4. Initialize chapter progress: Ch1 is available, Ch2-12 are locked
        const [chapters] = await conn.execute(`SELECT id, chapter_number FROM chapters ORDER BY chapter_number ASC`);
        for (const ch of chapters) {
          const initStatus = ch.chapter_number === 1 ? 'available' : 'locked';
          await conn.execute(
            `INSERT INTO chapter_progress (student_id, chapter_id, status)
             VALUES (?, ?, ?)`,
            [newUserId, ch.id, initStatus]
          );
        }
      }

      // 5. Audit Log
      await auditLog({
        req,
        connection: conn,
        actorUserId: newUserId,
        action: 'register',
        entityType: 'user',
        entityId: newUserId,
        details: { username, role: assignedRole, firstName, surname }
      });
    });

    res.status(201).json({
      message: 'Student account registered successfully. You may now sign in.'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username is already taken. Please choose another.' });
    }
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.execute(
      `SELECT * FROM users WHERE username = ?`,
      [username]
    );

    const user = rows[0];
    const passwordValid = user ? await bcrypt.compare(password, user.password_hash) : false;

    if (!user || !passwordValid) {
      // Log failed login event without exposing password
      await auditLog({
        req,
        action: 'failed_login',
        entityType: 'user',
        entityId: username,
        details: { attemptedUsername: username, reason: 'Invalid credentials' }
      });
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated. Please contact an instructor.' });
    }

    // Regenerate session ID to prevent session fixation attacks
    req.session.regenerate(async (err) => {
      if (err) return next(err);

      req.session.user = publicUser(user);
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');

      await auditLog({
        req,
        actorUserId: user.id,
        action: 'login',
        entityType: 'user',
        entityId: user.id,
        details: { role: user.role }
      });

      res.json({
        message: 'Signed in successfully',
        user: req.session.user,
        csrfToken: req.session.csrfToken
      });
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    if (req.session.user) {
      await auditLog({
        req,
        actorUserId: req.session.user.id,
        action: 'logout',
        entityType: 'user',
        entityId: req.session.user.id
      });
    }

    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie('connect.sid');
      res.status(204).end();
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.json({
    user: req.session.user,
    csrfToken: req.session.csrfToken
  });
}

module.exports = {
  getCsrfToken,
  register,
  login,
  logout,
  getMe
};

