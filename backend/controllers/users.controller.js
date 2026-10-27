const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { auditLog } = require('../services/audit.service');

async function getUsers(req, res, next) {
  try {
    const role = req.query.role || null;
    const search = req.query.search ? req.query.search.trim() : '';

    let sql = `SELECT id, username, first_name, surname, role, is_active, created_at FROM users`;
    const where = [];
    const params = [];

    if (role) {
      where.push(`role = ?`);
      params.push(role);
    }
    if (search) {
      where.push(`(username LIKE ? OR first_name LIKE ? OR surname LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (where.length > 0) {
      sql += ` WHERE ${where.join(' AND ')}`;
    }
    sql += ` ORDER BY surname ASC, first_name ASC`;

    const [rows] = await pool.execute(sql, params);
    res.json({ users: rows.map(r => ({ ...r, is_active: Boolean(r.is_active) })) });
  } catch (error) {
    next(error);
  }
}

async function createFacultyAccount(req, res, next) {
  try {
    const { username, password, firstName, surname } = req.body;

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      `INSERT INTO users (username, password_hash, first_name, surname, role)
       VALUES (?, ?, ?, ?, 'faculty')`,
      [username, hash, firstName, surname]
    );

    await auditLog({
      req,
      action: 'create_faculty_account',
      entityType: 'user',
      entityId: result.insertId,
      details: {
        newFacultyUsername: username,
        firstName,
        surname,
        createdBy: req.session.user.username
      }
    });

    res.status(201).json({
      message: 'Faculty account created successfully',
      userId: result.insertId,
      username
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username is already in use.' });
    }
    next(error);
  }
}

async function toggleUserStatus(req, res, next) {
  try {
    const userId = Number(req.params.id);
    const { isActive } = req.body;

    // Prevent deactivating own account
    if (userId === req.session.user.id) {
      return res.status(400).json({ error: 'You cannot deactivate your own administrative account.' });
    }

    await pool.execute(`UPDATE users SET is_active = ? WHERE id = ?`, [isActive, userId]);

    await auditLog({
      req,
      action: isActive ? 'activate_user' : 'deactivate_user',
      entityType: 'user',
      entityId: userId,
      details: { newStatus: isActive }
    });

    res.json({ message: `User status updated to ${isActive ? 'active' : 'inactive'}` });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  createFacultyAccount,
  toggleUserStatus
};

