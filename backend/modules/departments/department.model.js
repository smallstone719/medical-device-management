const db = require('../../database/db');

class DepartmentModel {
  // ─── Lấy tất cả phòng ban (có phân trang + search) ───────────────────
  static findAll({ page = 1, limit = 20, search = '', is_active = '' } = {}) {
    const offset = (page - 1) * limit;

    let where = 'WHERE d.deleted_at IS NULL';
    const params = [];

    if (search) {
      where += ' AND (d.name LIKE ? OR d.code LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s);
    }

    if (is_active !== '') {
      where += ' AND d.is_active = ?';
      params.push(Number(is_active));
    }

    const total = db
      .prepare(`SELECT COUNT(*) as count FROM departments d ${where}`)
      .get(...params).count;

    const rows = db
      .prepare(
        `SELECT
           d.id, d.code, d.name, d.description, d.is_active,
           d.parent_id, d.created_at, d.updated_at,
           p.name   AS parent_name,
           u.id     AS manager_id,
           u.full_name AS manager_name,
           u.avatar    AS manager_avatar,
           (SELECT COUNT(*) FROM user_departments ud WHERE ud.department_id = d.id) AS member_count
         FROM departments d
         LEFT JOIN departments p ON p.id = d.parent_id AND p.deleted_at IS NULL
         LEFT JOIN users      u ON u.id = d.manager_id AND u.deleted_at IS NULL
         ${where}
         ORDER BY d.parent_id ASC NULLS FIRST, d.name ASC
         LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset);

    return { rows, total };
  }

  // ─── Lấy toàn bộ (không phân trang) dùng cho dropdown ───────────────
  static findAllSimple() {
    return db
      .prepare(
        `SELECT id, code, name, parent_id
         FROM departments
         WHERE deleted_at IS NULL AND is_active = 1
         ORDER BY name ASC`
      )
      .all();
  }

  // ─── Tìm theo ID (kèm danh sách thành viên) ──────────────────────────
  static findById(id) {
    const dept = db
      .prepare(
        `SELECT
           d.id, d.code, d.name, d.description, d.is_active,
           d.parent_id, d.created_at, d.updated_at,
           p.name   AS parent_name,
           u.id     AS manager_id,
           u.full_name AS manager_name,
           u.avatar    AS manager_avatar
         FROM departments d
         LEFT JOIN departments p ON p.id = d.parent_id AND p.deleted_at IS NULL
         LEFT JOIN users      u ON u.id = d.manager_id AND u.deleted_at IS NULL
         WHERE d.id = ? AND d.deleted_at IS NULL`
      )
      .get(id);

    if (!dept) return null;

    // Lấy danh sách thành viên
    dept.members = db
      .prepare(
        `SELECT u.id, u.full_name, u.email, u.avatar, u.role, ud.is_primary
         FROM user_departments ud
         JOIN users u ON u.id = ud.user_id AND u.deleted_at IS NULL
         WHERE ud.department_id = ?
         ORDER BY ud.is_primary DESC, u.full_name ASC`
      )
      .all(id);

    return dept;
  }

  // ─── Tìm theo code ────────────────────────────────────────────────────
  static findByCode(code) {
    return db
      .prepare('SELECT * FROM departments WHERE code = ? AND deleted_at IS NULL')
      .get(code);
  }

  // ─── Tạo mới ─────────────────────────────────────────────────────────
  static create({ code, name, description, manager_id, parent_id, created_by }) {
    const stmt = db.prepare(
      `INSERT INTO departments (code, name, description, manager_id, parent_id, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    );
    const result = stmt.run(
      code,
      name,
      description || null,
      manager_id || null,
      parent_id  || null,
      created_by || null
    );
    return this.findById(result.lastInsertRowid);
  }

  // ─── Cập nhật ─────────────────────────────────────────────────────────
  static update(id, { name, description, manager_id, parent_id, is_active, updated_by }) {
    const fields = [];
    const params = [];

    if (name        !== undefined) { fields.push('name = ?');        params.push(name); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (manager_id  !== undefined) { fields.push('manager_id = ?');  params.push(manager_id || null); }
    if (parent_id   !== undefined) { fields.push('parent_id = ?');   params.push(parent_id  || null); }
    if (is_active   !== undefined) { fields.push('is_active = ?');   params.push(is_active ? 1 : 0); }

    if (!fields.length) return this.findById(id);

    fields.push("updated_at = datetime('now')");
    if (updated_by !== undefined) {
      fields.push('updated_by = ?');
      params.push(updated_by || null);
    }
    params.push(id);

    db.prepare(`UPDATE departments SET ${fields.join(', ')} WHERE id = ?`).run(...params);
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
      `UPDATE departments SET ${fields.join(', ')} WHERE id = ?`
    ).run(...params);
  }

  // ─── Kiểm tra code đã tồn tại chưa ───────────────────────────────────
  static isCodeExists(code, excludeId = null) {
    let query = 'SELECT id FROM departments WHERE code = ? AND deleted_at IS NULL';
    const params = [code];
    if (excludeId) { query += ' AND id != ?'; params.push(excludeId); }
    return !!db.prepare(query).get(...params);
  }

  // ─── Kiểm tra có phòng ban con không ─────────────────────────────────
  static hasChildren(id) {
    return !!db
      .prepare('SELECT id FROM departments WHERE parent_id = ? AND deleted_at IS NULL')
      .get(id);
  }

  // ─── Thêm thành viên vào phòng ban ───────────────────────────────────
  static addMember(department_id, user_id, is_primary = 0) {
    db.prepare(
      `INSERT OR REPLACE INTO user_departments (user_id, department_id, is_primary, joined_at)
       VALUES (?, ?, ?, datetime('now'))`
    ).run(user_id, department_id, is_primary ? 1 : 0);
  }

  // ─── Xóa thành viên khỏi phòng ban ───────────────────────────────────
  static removeMember(department_id, user_id) {
    db.prepare(
      'DELETE FROM user_departments WHERE department_id = ? AND user_id = ?'
    ).run(department_id, user_id);
  }

  // ─── Lấy danh sách phòng ban của 1 user ──────────────────────────────
  static findByUserId(user_id) {
    return db
      .prepare(
        `SELECT d.id, d.code, d.name, ud.is_primary
         FROM user_departments ud
         JOIN departments d ON d.id = ud.department_id AND d.deleted_at IS NULL
         WHERE ud.user_id = ?
         ORDER BY ud.is_primary DESC, d.name ASC`
      )
      .all(user_id);
  }
}

module.exports = DepartmentModel;
