const db = require('../../database/db');

class InspectionModel {
  // ─── Lấy tất cả kiểm tra (có phân trang + filter) ───────────────────
  static findAll({ page = 1, limit = 20, device_id = '', user_id = '', status = '', start_date = '', end_date = '' } = {}) {
    const offset = (page - 1) * limit;

    let where = 'WHERE i.deleted_at IS NULL';
    const params = [];

    if (device_id) {
      where += ' AND i.device_id = ?';
      params.push(device_id);
    }

    if (user_id) {
      where += ' AND i.user_id = ?';
      params.push(user_id);
    }

    if (status) {
      where += ' AND i.status = ?';
      params.push(status);
    }

    if (start_date) {
      where += ' AND date(i.inspection_date) >= date(?)';
      params.push(start_date);
    }

    if (end_date) {
      where += ' AND date(i.inspection_date) <= date(?)';
      params.push(end_date);
    }

    const total = db
      .prepare(`SELECT COUNT(*) as count FROM inspections i ${where}`)
      .get(...params).count;

    const rows = db
      .prepare(
        `SELECT
           i.id, i.device_id, i.inspector_name, i.user_id, i.inspection_date,
           i.status, i.notes, i.issues, i.images, i.created_at, i.updated_at,
           d.name AS device_name,
           d.location AS device_location,
           u.full_name AS user_name
         FROM inspections i
         LEFT JOIN devices d ON d.id = i.device_id AND d.deleted_at IS NULL
         LEFT JOIN users u ON u.id = i.user_id AND u.deleted_at IS NULL
         ${where}
         ORDER BY i.inspection_date DESC
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
           i.id, i.device_id, i.inspector_name, i.user_id, i.inspection_date,
           i.status, i.notes, i.issues, i.images, i.created_at, i.updated_at,
           d.name AS device_name,
           d.location AS device_location,
           u.full_name AS user_name
         FROM inspections i
         LEFT JOIN devices d ON d.id = i.device_id AND d.deleted_at IS NULL
         LEFT JOIN users u ON u.id = i.user_id AND u.deleted_at IS NULL
         WHERE i.id = ? AND i.deleted_at IS NULL`
      )
      .get(id);
  }

  // ─── Tạo mới ─────────────────────────────────────────────────────────
  static create({ device_id, inspector_name, user_id, status, notes, issues, images, inspection_date, created_by }) {
    const stmt = db.prepare(
      `INSERT INTO inspections (device_id, inspector_name, user_id, status, notes, issues, images, inspection_date, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    );
    const result = stmt.run(
      device_id,
      inspector_name,
      user_id || null,
      status,
      notes || null,
      issues || null,
      images ? JSON.stringify(images) : null,
      inspection_date || new Date().toISOString(),
      created_by || null
    );
    return this.findById(result.lastInsertRowid);
  }

  // ─── Cập nhật ─────────────────────────────────────────────────────────
  static update(id, { status, notes, issues, images, updated_by }) {
    const fields = [];
    const params = [];

    if (status !== undefined) { fields.push('status = ?'); params.push(status); }
    if (notes  !== undefined) { fields.push('notes = ?');  params.push(notes); }
    if (issues !== undefined) { fields.push('issues = ?'); params.push(issues); }
    if (images !== undefined) { fields.push('images = ?'); params.push(images ? JSON.stringify(images) : null); }

    if (!fields.length) return this.findById(id);

    fields.push("updated_at = datetime('now')");
    if (updated_by !== undefined) {
      fields.push('updated_by = ?');
      params.push(updated_by || null);
    }
    params.push(id);

    db.prepare(`UPDATE inspections SET ${fields.join(', ')} WHERE id = ?`).run(...params);
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
      `UPDATE inspections SET ${fields.join(', ')} WHERE id = ?`
    ).run(...params);
  }

  // ─── Lấy kiểm tra gần nhất của thiết bị ──────────────────────────────
  static findLatestByDevice(device_id) {
    return db
      .prepare(
        `SELECT * FROM inspections
         WHERE device_id = ? AND deleted_at IS NULL
         ORDER BY inspection_date DESC
         LIMIT 1`
      )
      .get(device_id);
  }
}

module.exports = InspectionModel;
