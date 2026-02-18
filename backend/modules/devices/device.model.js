const db = require('../../database/db');

class DeviceModel {
  // ─── Lấy tất cả thiết bị (có phân trang + filter) ───────────────────
  static findAll({ page = 1, limit = 20, search = '', status = '', category_id = '', department_id = '', location = '' } = {}) {
    const offset = (page - 1) * limit;

    let where = 'WHERE d.deleted_at IS NULL';
    const params = [];

    if (search) {
      where += ' AND (d.name LIKE ? OR d.model LIKE ? OR d.serial_number LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    if (status) {
      where += ' AND d.status = ?';
      params.push(status);
    }

    if (category_id) {
      where += ' AND d.category_id = ?';
      params.push(category_id);
    }

    if (department_id) {
      where += ' AND d.department_id = ?';
      params.push(department_id);
    }

    if (location) {
      where += ' AND d.location LIKE ?';
      params.push(`%${location}%`);
    }

    const total = db
      .prepare(`SELECT COUNT(*) as count FROM devices d ${where}`)
      .get(...params).count;

    const rows = db
      .prepare(
        `SELECT
           d.*,
           c.name AS category_name,
           c.color AS category_color,
           dept.name AS department_name
         FROM devices d
         LEFT JOIN device_categories c ON c.id = d.category_id AND c.deleted_at IS NULL
         LEFT JOIN departments dept ON dept.id = d.department_id AND dept.deleted_at IS NULL
         ${where}
         ORDER BY d.created_at DESC
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
           d.*,
           c.name AS category_name,
           c.color AS category_color,
           dept.name AS department_name
         FROM devices d
         LEFT JOIN device_categories c ON c.id = d.category_id AND c.deleted_at IS NULL
         LEFT JOIN departments dept ON dept.id = d.department_id AND dept.deleted_at IS NULL
         WHERE d.id = ? AND d.deleted_at IS NULL`
      )
      .get(id);
  }

  // ─── Tìm theo serial number ───────────────────────────────────────────
  static findBySerialNumber(serial_number) {
    return db
      .prepare('SELECT * FROM devices WHERE serial_number = ? AND deleted_at IS NULL')
      .get(serial_number);
  }

  // ─── Tạo mới ─────────────────────────────────────────────────────────
  static create(data) {
    const stmt = db.prepare(
      `INSERT INTO devices (
        name, model, serial_number, manufacturer, location, department_id, category_id,
        purchase_date, warranty_expiry, usage_start_date, next_maintenance_date, last_maintenance_date,
        status, require_auth, inspection_password, inspection_frequency, qr_code, image_url, notes,
        created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    );
    
    const result = stmt.run(
      data.name,
      data.model || null,
      data.serial_number || null,
      data.manufacturer || null,
      data.location || null,
      data.department_id || null,
      data.category_id || null,
      data.purchase_date || null,
      data.warranty_expiry || null,
      data.usage_start_date || null,
      data.next_maintenance_date || null,
      data.last_maintenance_date || null,
      data.status || 'active',
      data.require_auth ? 1 : 0,
      data.inspection_password || null,
      data.inspection_frequency || 'monthly',
      data.qr_code || null,
      data.image_url || null,
      data.notes || null,
      data.created_by || null
    );
    
    return this.findById(result.lastInsertRowid);
  }

  // ─── Cập nhật ─────────────────────────────────────────────────────────
  static update(id, data) {
    const fields = [];
    const params = [];

    if (data.name                  !== undefined) { fields.push('name = ?');                  params.push(data.name); }
    if (data.model                 !== undefined) { fields.push('model = ?');                 params.push(data.model); }
    if (data.serial_number         !== undefined) { fields.push('serial_number = ?');         params.push(data.serial_number); }
    if (data.manufacturer          !== undefined) { fields.push('manufacturer = ?');          params.push(data.manufacturer); }
    if (data.location              !== undefined) { fields.push('location = ?');              params.push(data.location); }
    if (data.department_id         !== undefined) { fields.push('department_id = ?');         params.push(data.department_id || null); }
    if (data.category_id           !== undefined) { fields.push('category_id = ?');           params.push(data.category_id || null); }
    if (data.purchase_date         !== undefined) { fields.push('purchase_date = ?');         params.push(data.purchase_date); }
    if (data.warranty_expiry       !== undefined) { fields.push('warranty_expiry = ?');       params.push(data.warranty_expiry); }
    if (data.usage_start_date      !== undefined) { fields.push('usage_start_date = ?');      params.push(data.usage_start_date); }
    if (data.next_maintenance_date !== undefined) { fields.push('next_maintenance_date = ?'); params.push(data.next_maintenance_date); }
    if (data.last_maintenance_date !== undefined) { fields.push('last_maintenance_date = ?'); params.push(data.last_maintenance_date); }
    if (data.status                !== undefined) { fields.push('status = ?');                params.push(data.status); }
    if (data.require_auth          !== undefined) { fields.push('require_auth = ?');          params.push(data.require_auth ? 1 : 0); }
    if (data.inspection_password   !== undefined) { fields.push('inspection_password = ?');   params.push(data.inspection_password); }
    if (data.inspection_frequency  !== undefined) { fields.push('inspection_frequency = ?');  params.push(data.inspection_frequency); }
    if (data.qr_code               !== undefined) { fields.push('qr_code = ?');               params.push(data.qr_code); }
    if (data.image_url             !== undefined) { fields.push('image_url = ?');             params.push(data.image_url); }
    if (data.notes                 !== undefined) { fields.push('notes = ?');                 params.push(data.notes); }

    if (!fields.length) return this.findById(id);

    fields.push("updated_at = datetime('now')");
    if (data.updated_by !== undefined) {
      fields.push('updated_by = ?');
      params.push(data.updated_by || null);
    }
    params.push(id);

    db.prepare(`UPDATE devices SET ${fields.join(', ')} WHERE id = ?`).run(...params);
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
      `UPDATE devices SET ${fields.join(', ')} WHERE id = ?`
    ).run(...params);
  }

  // ─── Kiểm tra serial number đã tồn tại chưa ──────────────────────────
  static isSerialNumberExists(serial_number, excludeId = null) {
    if (!serial_number) return false;
    let query = 'SELECT id FROM devices WHERE serial_number = ? AND deleted_at IS NULL';
    const params = [serial_number];
    if (excludeId) { query += ' AND id != ?'; params.push(excludeId); }
    return !!db.prepare(query).get(...params);
  }

  // ─── Lấy danh sách locations ─────────────────────────────────────────
  static getLocations() {
    return db
      .prepare(
        `SELECT DISTINCT location
         FROM devices
         WHERE deleted_at IS NULL AND location IS NOT NULL AND location != ''
         ORDER BY location ASC`
      )
      .all()
      .map(row => row.location);
  }
}

module.exports = DeviceModel;
