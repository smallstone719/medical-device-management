const db = require('../../database/db');

class CategoryModel {
  // ─── Lấy tất cả danh mục (có phân trang + search) ───────────────────
  static findAll({ page = 1, limit = 20, search = '' } = {}) {
    const offset = (page - 1) * limit;

    let where = 'WHERE deleted_at IS NULL';
    const params = [];

    if (search) {
      where += ' AND (name LIKE ? OR description LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s);
    }

    const total = db
      .prepare(`SELECT COUNT(*) as count FROM device_categories ${where}`)
      .get(...params).count;

    const rows = db
      .prepare(
        `SELECT
           id, name, description, color, created_at, updated_at,
           (SELECT COUNT(*) FROM devices WHERE category_id = device_categories.id AND deleted_at IS NULL) AS device_count
         FROM device_categories
         ${where}
         ORDER BY name ASC
         LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset);

    return { rows, total };
  }

  // ─── Lấy toàn bộ (không phân trang) dùng cho dropdown ───────────────
  static findAllSimple() {
    return db
      .prepare(
        `SELECT id, name, color
         FROM device_categories
         WHERE deleted_at IS NULL
         ORDER BY name ASC`
      )
      .all();
  }

  // ─── Tìm theo ID ──────────────────────────────────────────────────────
  static findById(id) {
    return db
      .prepare(
        `SELECT id, name, description, color, created_at, updated_at
         FROM device_categories
         WHERE id = ? AND deleted_at IS NULL`
      )
      .get(id);
  }

  // ─── Tìm theo name ────────────────────────────────────────────────────
  static findByName(name) {
    return db
      .prepare('SELECT * FROM device_categories WHERE name = ? AND deleted_at IS NULL')
      .get(name);
  }

  // ─── Tạo mới ─────────────────────────────────────────────────────────
  static create({ name, description, color, created_by }) {
    const stmt = db.prepare(
      `INSERT INTO device_categories (name, description, color, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`
    );
    const result = stmt.run(
      name,
      description || null,
      color || '#0ea5e9',
      created_by || null
    );
    return this.findById(result.lastInsertRowid);
  }

  // ─── Cập nhật ─────────────────────────────────────────────────────────
  static update(id, { name, description, color, updated_by }) {
    const fields = [];
    const params = [];

    if (name        !== undefined) { fields.push('name = ?');        params.push(name); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (color       !== undefined) { fields.push('color = ?');       params.push(color); }

    if (!fields.length) return this.findById(id);

    fields.push("updated_at = datetime('now')");
    if (updated_by !== undefined) {
      fields.push('updated_by = ?');
      params.push(updated_by || null);
    }
    params.push(id);

    db.prepare(`UPDATE device_categories SET ${fields.join(', ')} WHERE id = ?`).run(...params);
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
      `UPDATE device_categories SET ${fields.join(', ')} WHERE id = ?`
    ).run(...params);
  }

  // ─── Kiểm tra name đã tồn tại chưa ───────────────────────────────────
  static isNameExists(name, excludeId = null) {
    let query = 'SELECT id FROM device_categories WHERE name = ? AND deleted_at IS NULL';
    const params = [name];
    if (excludeId) { query += ' AND id != ?'; params.push(excludeId); }
    return !!db.prepare(query).get(...params);
  }

  // ─── Kiểm tra có thiết bị nào sử dụng category này không ─────────────
  static hasDevices(id) {
    return !!db
      .prepare('SELECT id FROM devices WHERE category_id = ? AND deleted_at IS NULL')
      .get(id);
  }
}

module.exports = CategoryModel;
