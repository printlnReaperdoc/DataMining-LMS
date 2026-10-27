const crypto = require('crypto');

function ensureCsrfToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}

function verifyCsrf(req, res, next) {
  // Safe HTTP read methods skip CSRF validation
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Exempt public login and register from CSRF token requirement if session was not established yet,
  // but if session has a token, or for all authenticated routes, enforce it
  const isAuthEntry = req.path === '/api/auth/login' || req.path === '/api/auth/register';
  if (isAuthEntry && !req.session?.csrfToken) {
    return next();
  }

  const clientToken = req.get('x-csrf-token') || req.body?._csrf;

  if (!req.session?.csrfToken || !clientToken || clientToken !== req.session.csrfToken) {
    return res.status(403).json({ error: 'CSRF token verification failed' });
  }

  next();
}

module.exports = {
  ensureCsrfToken,
  verifyCsrf
};

