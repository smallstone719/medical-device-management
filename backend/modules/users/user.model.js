const db = require('../../database/db');

class UserModel {
  // ─── Tìm tất cả users (có phân trang) ───────────────────────────────
  static findAll({ page = 1, limit = 20, search = '', role = '' } = {}) {
    const offset = (page - 1) * limit;
    let where = 'WHERE u.deleted_at IS NULL';
    const params = [];

    if (search) {
      where += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR u.username LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    if (role) {
      where += ' AND u.role = ?';
      params.push(role);
    }

    const total = db.prepare(`
      SELECT COUNT(*) as count FROM users u ${where}
    `).get(...params).count;

    const rows = db.prepare(`
      SELECT u.id, u.username, u.full_name, u.email, u.role,
             u.avatar, u.is_active, u.created_at, u.updated_at,
             uc.username as created_by_username,
             uu.username as updated_by_username
      FROM users u
      LEFT JOIN users uc ON u.created_by = uc.id
      LEFT JOIN users uu ON u.updated_by = uu.id
      ${where}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return { rows, total };
  }

  // ─── Tìm theo ID ─────────────────────────────────────────────────────
  static findById(id) {
    return db.prepare(`
      SELECT u.id, u.username, u.full_name, u.email, u.role,
             u.avatar, u.is_active, u.created_at, u.updated_at,
             uc.username as created_by_username,
             uu.username as updated_by_username
      FROM users u
      LEFT JOIN users uc ON u.created_by = uc.id
      LEFT JOIN users uu ON u.updated_by = uu.id
      WHERE u.id = ? AND u.deleted_at IS NULL
    `).get(id);
  }

  // ─── Tìm theo username (dùng cho login) ──────────────────────────────
  static findByUsername(username) {
    return db.prepare(`
      SELECT * FROM users 
      WHERE username = ? AND deleted_at IS NULL
    `).get(username);
  }

  // ─── Tìm theo email ───────────────────────────────────────────────────
  static findByEmail(email) {
    return db.prepare(`
      SELECT * FROM users 
      WHERE email = ? AND deleted_at IS NULL
    `).get(email);
  }

  // ─── Tạo mới ─────────────────────────────────────────────────────────
  static create({ username, full_name, email, password_hash, role = 'user', created_by = null }) {
    const stmt = db.prepare(`
      INSERT INTO users (username, full_name, email, password_hash, role, created_by, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `);

    const result = stmt.run(username, full_name, email, password_hash, role, created_by);
    return this.findById(result.lastInsertRowid);
  }

  // ─── Cập nhật thông tin ───────────────────────────────────────────────
  static update(id, { full_name, email, role, is_active, avatar, updated_by }) {
    const fields = [];
    const params = [];

    if (full_name !== undefined) { fields.push('full_name = ?'); params.push(full_name); }
    if (email     !== undefined) { fields.push('email = ?');     params.push(email); }
    if (role      !== undefined) { fields.push('role = ?');      params.push(role); }
    if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active ? 1 : 0); }
    if (avatar    !== undefined) { fields.push('avatar = ?');    params.push(avatar); }

    if (!fields.length) return this.findById(id);

    // Luôn cập nhật updated_by và updated_at
    if (updated_by !== undefined) {
      fields.push('updated_by = ?');
      params.push(updated_by);
    }
    fields.push("updated_at = datetime('now')");
    params.push(id);

    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.findById(id);
  }

  // ─── Đổi mật khẩu ────────────────────────────────────────────────────
  static updatePassword(id, password_hash, updated_by = null) {
    const fields = ['password_hash = ?', "updated_at = datetime('now')"];
    const params = [password_hash];

    if (updated_by !== undefined) {
      fields.push('updated_by = ?');
      params.push(updated_by);
    }
    params.push(id);

    db.prepare(`
      UPDATE users SET ${fields.join(', ')} WHERE id = ?
    `).run(...params);
  }

  // ─── Xóa mềm (soft delete) ───────────────────────────────────────────
  static softDelete(id, deleted_by = null) {
    const fields = ["deleted_at = datetime('now')", "updated_at = datetime('now')"];
    const params = [];

    if (deleted_by !== undefined) {
      fields.push('deleted_by = ?');
      params.push(deleted_by);
    }
    params.push(id);

    db.prepare(`
      UPDATE users SET ${fields.join(', ')} WHERE id = ?
    `).run(...params);
  }

  // ─── Kiểm tra trùng username/email ───────────────────────────────────
  static isExists({ username, email, excludeId = null }) {
    let query = 'SELECT id FROM users WHERE (username = ? OR email = ?) AND deleted_at IS NULL';
    const params = [username, email];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    return !!db.prepare(query).get(...params);
  }
}

module.exports = UserModel;
