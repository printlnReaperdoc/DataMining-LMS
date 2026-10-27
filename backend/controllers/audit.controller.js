const { getAuditLogs } = require('../services/audit.service');

async function getLogs(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 100);
    const offset = Math.max(Number(req.query.offset || 0), 0);
    const action = req.query.action || null;
    const entityType = req.query.entityType || null;
    const actorId = req.query.actorId ? Number(req.query.actorId) : null;

    const data = await getAuditLogs({
      limit,
      offset,
      action,
      entityType,
      actorId
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLogs
};

