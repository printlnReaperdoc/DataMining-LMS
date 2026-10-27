const { pool } = require('../config/db');

// List of sensitive property keys to redact from audit logs
const SENSITIVE_KEYS = new Set([
  'password',
  'confirmPassword',
  'password_hash',
  'csrfToken',
  'token',
  'secret',
  'SESSION_SECRET',
  'authorization'
]);

function redactSensitiveData(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redactSensitiveData);

  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key)) {
      clean[key] = '[REDACTED]';
    } else if (val && typeof val === 'object') {
      clean[key] = redactSensitiveData(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

/**
 * Record an audit log entry.
 * If a transaction connection is provided, writes within that transaction.
 */
async function auditLog({
  req = null,
  connection = null,
  actorUserId = null,
  action,
  entityType,
  entityId = null,
  details = null,
  ipAddress = null,
  requestId = null
}) {
  const actor = actorUserId ?? req?.session?.user?.id ?? null;
  const ip = ipAddress ?? req?.ip ?? req?.connection?.remoteAddress ?? '127.0.0.1';
  const reqId = requestId ?? req?.id ?? null;
  const sanitizedDetails = details ? JSON.stringify(redactSensitiveData(details)) : null;

  const sql = `
    INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details_json, ip_address, request_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [actor, action, entityType, entityId ? String(entityId) : null, sanitizedDetails, ip, reqId];

  const executor = connection || pool;
  await executor.execute(sql, params);
}

/**
 * Retrieve audit logs with filtering and pagination (Faculty only)
 */
async function getAuditLogs({ limit = 50, offset = 0, action = null, entityType = null, actorId = null }) {
  let whereClauses = [];
  let params = [];

  if (action) {
    whereClauses.push('a.action = ?');
    params.push(action);
  }
  if (entityType) {
    whereClauses.push('a.entity_type = ?');
    params.push(entityType);
  }
  if (actorId) {
    whereClauses.push('a.actor_user_id = ?');
    params.push(actorId);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) as total FROM audit_logs a ${whereSql}`,
    params
  );
  const total = countRows[0].total;

  const queryParams = [...params, Number(limit), Number(offset)];
  const [rows] = await pool.execute(
    `SELECT a.id, a.actor_user_id, a.action, a.entity_type, a.entity_id,
            a.details_json, a.ip_address, a.request_id, a.created_at,
            u.username AS actor_username, u.first_name AS actor_first_name, u.surname AS actor_surname, u.role AS actor_role
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.actor_user_id
     ${whereSql}
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`,
    queryParams
  );

  return {
    total,
    limit: Number(limit),
    offset: Number(offset),
    logs: rows.map(r => ({
      ...r,
      details: typeof r.details_json === 'string' ? JSON.parse(r.details_json) : r.details_json
    }))
  };
}

module.exports = {
  auditLog,
  getAuditLogs,
  redactSensitiveData
};

