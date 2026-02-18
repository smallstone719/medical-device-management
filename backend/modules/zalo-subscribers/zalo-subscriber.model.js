const db = require('../../database/db');

class ZaloSubscriberModel {
  // ─── Lấy tất cả subscribers (có phân trang + filter) ────────────────
  static findAll({ page = 1, limit = 20, department_id = '' } = {}) {
    const offset = (page - 1) * limit;

    let where = 'WHERE s.deleted_at IS NULL';
    const params = [];

    if (department_id) {
      where += ' AND s.department_id = ?';
      params.push(department_id);
    }

    const total = db
      .prepare(`SELECT COUNT(*) as count FROM zalo_subscribers s ${where}`)
      .get(...params).count;

    const rows = db
      .prepare(
        `SELECT
           s.id, s.chat_id, s.display_name, s.department_id, s.subscribed_at,
           s.created_at, s.updated_at,
           d.name AS department_name
         FROM zalo_subscribers s
         LEFT JOIN departments d ON d.id = s.department_id AND d.deleted_at IS NULL
         ${where}
         ORDER BY s.subscribed_at DESC
         LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset);

    return { rows, total };
  }

  // ─── Tìm theo ID ──────────────────────────────────────────────────────
  static findById(id) {
    return db
      .prepare(
        `SELECT
           s.id, s.chat_id, s.display_name, s.department_id, s.subscribed_at,
           s.created_at, s.updated_at,
           d.name AS department_name
         FROM zalo_subscribers s
         LEFT JOIN departments d ON d.id = s.department_id AND d.deleted_at IS NULL
         WHERE s.id = ? AND s.deleted_at IS NULL`
      )
      .get(id);
  }

  // ─── Tìm theo chat_id ─────────────────────────────────────────────────
  static findByChatId(chat_id) {
    return db
      .prepare(
        `SELECT
           s.id, s.chat_id, s.display_name, s.department_id, s.subscribed_at,
           s.created_at, s.updated_at,
           d.name AS department_name
         FROM zalo_subscribers s
         LEFT JOIN departments d ON d.id = s.department_id AND d.deleted_at IS NULL
         WHERE s.chat_id = ? AND s.deleted_at IS NULL`
      )
      .get(chat_id);
  }

  // ─── Tạo mới ─────────────────────────────────────────────────────────
  static create({ chat_id, display_name, department_id, created_by }) {
    const stmt = db.prepare(
      `INSERT INTO zalo_subscribers (chat_id, display_name, department_id, subscribed_at, created_by, created_at, updated_at)
       VALUES (?, ?, ?, datetime('now'), ?, datetime('now'), datetime('now'))`
    );
    const result = stmt.run(
      chat_id,
      display_name || null,
      department_id || null,
      created_by || null
    );
    return this.findById(result.lastInsertRowid);
  }

  // ─── Cập nhật ─────────────────────────────────────────────────────────
  static update(id, { display_name, department_id, updated_by }) {
    const fields = [];
    const params = [];

    if (display_name  !== undefined) { fields.push('display_name = ?');  params.push(display_name); }
    if (department_id !== undefined) { fields.push('department_id = ?'); params.push(department_id || null); }

    if (!fields.length) return this.findById(id);

    fields.push("updated_at = datetime('now')");
    if (updated_by !== undefined) {
      fields.push('updated_by = ?');
      params.push(updated_by || null);
    }
    params.push(id);

    db.prepare(`UPDATE zalo_subscribers SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.findById(id);
  }

  // ─── Xóa mềm ─────────────────────────────────────────────────────────
  static softDelete(id, deleted_by = null) {
    const fields = ["deleted_at = datetime('now')", "updated_at = datetime('now')"];
    const params = [];
    
    if (deleted_by !== undefined) {
      fields.push('deleted_by = ?');
      params.push(deleted_by || null);
    }
    params.push(id);
    
    db.prepare(
      `UPDATE zalo_subscribers SET ${fields.join(', ')} WHERE id = ?`
    ).run(...params);
  }

  // ─── Kiểm tra chat_id đã tồn tại chưa ────────────────────────────────
  static isChatIdExists(chat_id, excludeId = null) {
    let query = 'SELECT id FROM zalo_subscribers WHERE chat_id = ? AND deleted_at IS NULL';
    const params = [chat_id];
    if (excludeId) { query += ' AND id != ?'; params.push(excludeId); }
    return !!db.prepare(query).get(...params);
  }

  // ─── Lấy tất cả chat_ids active ──────────────────────────────────────
  static findAllActiveChatIds() {
    return db
      .prepare(
        `SELECT chat_id FROM zalo_subscribers
         WHERE deleted_at IS NULL
         ORDER BY subscribed_at ASC`
      )
      .all()
      .map(row => row.chat_id);
  }

  // ─── Lấy subscribers theo department ─────────────────────────────────
  static findByDepartmentId(department_id) {
    return db
      .prepare(
        `SELECT * FROM zalo_subscribers
         WHERE department_id = ? AND deleted_at IS NULL
         ORDER BY subscribed_at DESC`
      )
      .all(department_id);
  }
}

module.exports = ZaloSubscriberModel;
