require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
const cors = require('cors');

const { pool } = require('./config/db');
const requestId = require('./middleware/requestId');
const { verifyCsrf } = require('./middleware/csrf');

// Import routes
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const coursesRoutes = require('./routes/courses.routes');
const chaptersRoutes = require('./routes/chapters.routes');
const lessonsRoutes = require('./routes/lessons.routes');
const lessonFilesRoutes = require('./routes/lessonFiles.routes');
const quizzesRoutes = require('./routes/quizzes.routes');
const attemptsRoutes = require('./routes/attempts.routes');
const gradebookRoutes = require('./routes/gradebook.routes');
const exportsRoutes = require('./routes/exports.routes');
const auditRoutes = require('./routes/audit.routes');

const app = express();
const port = Number(process.env.PORT || 3000);

// Ensure storage directories exist
const storageDir = path.resolve(__dirname, 'storage', 'uploads');
fs.mkdirSync(storageDir, { recursive: true });

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        objectSrc: ["'self'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));

// Assign unique request ID to all incoming requests
app.use(requestId);

// Session configuration with MySQL persistent storage
const sessionStore = new MySQLStore(
  {
    clearExpired: true,
    checkExpirationInterval: 900000, // 15 mins
    expiration: 1000 * 60 * 60 * 8,   // 8 hours
    createDatabaseTable: true,
    schema: {
      tableName: 'sessions',
      columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data'
      }
    }
  },
  pool
);

app.use(
  session({
    key: 'lms.sid',
    secret: process.env.SESSION_SECRET || 'datamining-lms-super-secret-key-32chars-min!',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 8 // 8 hours
    }
  })
);

// CSRF verification on mutation routes
app.use('/api', verifyCsrf);

// Serve frontend static files
const frontendDir = path.resolve(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

// System Health Check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      course: 'ITEP411-T Data Mining'
    });
  } catch (error) {
    res.status(503).json({ status: 'unavailable', error: error.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/chapters', chaptersRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/lesson-files', lessonFilesRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/quiz-attempts', attemptsRoutes);
app.use('/api/gradebook', gradebookRoutes);
app.use('/api/exports', exportsRoutes);
app.use('/api/audit-logs', auditRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  console.error(`[Error] Request ID: ${req.id} - ${err.message}`, isDev ? err.stack : '');

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'An unexpected server error occurred',
    requestId: req.id,
    ...(isDev ? { stack: err.stack } : {})
  });
});

// Catch-all for single-page application frontend routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
  }
  if (req.accepts('html')) {
    return res.sendFile(path.join(frontendDir, 'index.html'));
  }
  res.status(404).end();
});

let server = null;
if (require.main === module) {
  server = app.listen(port, () => {
    console.log(`====================================================`);
    console.log(`🎓 Data Mining LMS (ITEP411-T) Server Started!`);
    console.log(`📡 URL: http://localhost:${port}`);
    console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });

  // Graceful shutdown
  const handleShutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    if (server) {
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections();
      }
      server.close(async () => {
        try {
          if (sessionStore && typeof sessionStore.close === 'function') {
            await sessionStore.close();
          }
          await pool.end();
          console.log('MySQL connection pool closed.');
          process.exit(0);
        } catch (e) {
          process.exit(1);
        }
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

module.exports = { app, pool, sessionStore };
