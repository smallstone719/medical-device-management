const db = require('../../database/db');

class AssetModel {
  // ─── Lấy tất cả assets (có phân trang + filter) ─────────────────────
  static findAll({ page = 1, limit = 20, search = '', device_id = '', condition = '' } = {}) {
    const offset = (page - 1) * limit;

    let where = 'WHERE a.deleted_at IS NULL';
    const params = [];

    if (search) {
      where += ' AND (a.asset_tag LIKE ? OR a.description LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s);
    }

    if (device_id) {
      where += ' AND a.device_id = ?';
      params.push(device_id);
    }

    if (condition) {
      where += ' AND a.condition = ?';
      params.push(condition);
    }

    const total = db
      .prepare(`SELECT COUNT(*) as count FROM assets a ${where}`)
      .get(...params).count;

    const rows = db
      .prepare(
        `SELECT
           a.*,
           d.name AS device_name,
           d.location AS device_location
         FROM assets a
         LEFT JOIN devices d ON d.id = a.device_id AND d.deleted_at IS NULL
         ${where}
         ORDER BY a.created_at DESC
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
           a.*,
           d.name AS device_name,
           d.location AS device_location
         FROM assets a
         LEFT JOIN devices d ON d.id = a.device_id AND d.deleted_at IS NULL
         WHERE a.id = ? AND a.deleted_at IS NULL`
      )
      .get(id);
  }

  // ─── Tìm theo asset_tag ───────────────────────────────────────────────
  static findByAssetTag(asset_tag) {
    return db
      .prepare('SELECT * FROM assets WHERE asset_tag = ? AND deleted_at IS NULL')
      .get(asset_tag);
  }

  // ─── Tạo mới ─────────────────────────────────────────────────────────
  static create({ device_id, asset_tag, description, condition, notes, created_by }) {
    const stmt = db.prepare(
      `INSERT INTO assets (device_id, asset_tag, description, condition, notes, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    );
    const result = stmt.run(
      device_id || null,
      asset_tag || null,
      description || null,
      condition || null,
      notes || null,
      created_by || null
    );
    return this.findById(result.lastInsertRowid);
  }

  // ─── Cập nhật ─────────────────────────────────────────────────────────
  static update(id, { device_id, asset_tag, description, condition, notes, updated_by }) {
    const fields = [];
    const params = [];

    if (device_id   !== undefined) { fields.push('device_id = ?');   params.push(device_id || null); }
    if (asset_tag   !== undefined) { fields.push('asset_tag = ?');   params.push(asset_tag); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (condition   !== undefined) { fields.push('condition = ?');   params.push(condition); }
    if (notes       !== undefined) { fields.push('notes = ?');       params.push(notes); }

    if (!fields.length) return this.findById(id);

    fields.push("updated_at = datetime('now')");
    if (updated_by !== undefined) {
      fields.push('updated_by = ?');
      params.push(updated_by || null);
    }
    params.push(id);

    db.prepare(`UPDATE assets SET ${fields.join(', ')} WHERE id = ?`).run(...params);
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
      `UPDATE assets SET ${fields.join(', ')} WHERE id = ?`
    ).run(...params);
  }

  // ─── Kiểm tra asset_tag đã tồn tại chưa ──────────────────────────────
  static isAssetTagExists(asset_tag, excludeId = null) {
    if (!asset_tag) return false;
    let query = 'SELECT id FROM assets WHERE asset_tag = ? AND deleted_at IS NULL';
    const params = [asset_tag];
    if (excludeId) { query += ' AND id != ?'; params.push(excludeId); }
    return !!db.prepare(query).get(...params);
  }

  // ─── Lấy assets theo device_id ────────────────────────────────────────
  static findByDeviceId(device_id) {
    return db
      .prepare(
        `SELECT * FROM assets
         WHERE device_id = ? AND deleted_at IS NULL
         ORDER BY created_at DESC`
      )
      .all(device_id);
  }
}

module.exports = AssetModel;
