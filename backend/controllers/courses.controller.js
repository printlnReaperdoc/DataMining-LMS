const { getCurriculumWithProgress } = require('../services/progress.service');

async function getCurrentCourse(req, res, next) {
  try {
    const data = await getCurriculumWithProgress(req.session.user);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCurrentCourse
};

