require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

/**
 * Script to reset all user passwords (including faculty) to a specified password (default: '0829').
 * Usage: node backend/scripts/resetPasswords.js [optional_password]
 */
async function resetAllPasswords(newPassword = '0829') {
  console.log('====================================================');
  console.log(`🔐 Resetting All User Passwords to: "${newPassword}"`);
  console.log('====================================================');

  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'datamininglms',
    waitForConnections: true,
    connectionLimit: 5
  });

  try {
    // 1. Generate bcrypt hash
    console.log('Hashing password with bcrypt (cost factor 12)...');
    const hash = await bcrypt.hash(newPassword, 12);

    // 2. Fetch all users
    const [users] = await pool.execute(`SELECT id, username, first_name, surname, role FROM users ORDER BY role DESC, username ASC`);
    if (users.length === 0) {
      console.log('No users found in database.');
      return;
    }

    console.log(`Found ${users.length} users in database:`);
    for (const u of users) {
      console.log(` - [${u.role.toUpperCase()}] ${u.username} (${u.first_name} ${u.surname})`);
    }

    // 3. Update all passwords
    const [result] = await pool.execute(`UPDATE users SET password_hash = ?`, [hash]);
    console.log(`\nSuccessfully updated ${result.affectedRows} user records!`);

    // 4. Log in audit_logs
    await pool.execute(
      `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details_json, ip_address, request_id)
       VALUES (NULL, 'admin_bulk_password_reset', 'user', 'all', ?, '127.0.0.1', 'script-reset-pwd')`,
      [
        JSON.stringify({
          updatedCount: result.affectedRows,
          targetPassword: '[RESET_TO_REQUESTED_DEFAULT]',
          users: users.map(u => ({ id: u.id, username: u.username, role: u.role }))
        })
      ]
    );

    console.log('Recorded audit log entry for password reset.');
    console.log('====================================================');
    console.log(`✅ All users (including faculty) can now sign in with password: "${newPassword}"`);
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Failed to reset passwords:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Allow CLI execution with optional password argument
if (require.main === module) {
  const customPassword = process.argv[2] || '0829';
  resetAllPasswords(customPassword)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { resetAllPasswords };

