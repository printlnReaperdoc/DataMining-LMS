function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

module.exports = requireAuth;

