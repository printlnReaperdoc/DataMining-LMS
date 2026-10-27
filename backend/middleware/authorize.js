function requireFaculty(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.session.user.role !== 'faculty') {
    return res.status(403).json({ error: 'Access denied: Faculty privileges required' });
  }
  next();
}

function requireStudent(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.session.user.role !== 'student') {
    return res.status(403).json({ error: 'Access denied: Student account required' });
  }
  next();
}

module.exports = {
  requireFaculty,
  requireStudent
};

