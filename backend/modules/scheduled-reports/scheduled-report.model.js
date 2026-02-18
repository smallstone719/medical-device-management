const db = require('../../database/db');

class ScheduledReportModel {
  // ─── Lấy tất cả scheduled reports (có phân trang + filter) ──────────
  static findAll({ page = 1, limit = 20, is_active = '' } = {}) {
    const offset = (page - 1) * limit;

    let where = 'WHERE deleted_at IS NULL';
    const params = [];

    if (is_active !== '') {
      where += ' AND is_active = ?';
      params.push(Number(is_active));
    }

    const total = db
      .prepare(`SELECT COUNT(*) as count FROM scheduled_reports ${where}`)
      .get(...params).count;

    const rows = db
      .prepare(
        `SELECT
           id, name, schedule_type, schedule_time, schedule_day, chat_ids,
           report_type, is_active, last_run, created_at, updated_at
         FROM scheduled_reports
         ${where}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset);

    // Parse chat_ids JSON
    rows.forEach(row => {
      if (row.chat_ids) {
        try {
          row.chat_ids = JSON.parse(row.chat_ids);
        } catch (e) {
          row.chat_ids = [];
        }
      } else {
        row.chat_ids = [];
      }
    });

    return { rows, total };
  }

  // ─── Tìm theo ID ──────────────────────────────────────────────────────
  static findById(id) {
    const report = db
      .prepare(
        `SELECT
           id, name, schedule_type, schedule_time, schedule_day, chat_ids,
           report_type, is_active, last_run, created_at, updated_at
         FROM scheduled_reports
         WHERE id = ? AND deleted_at IS NULL`
      )
      .get(id);

    if (report && report.chat_ids) {
      try {
        report.chat_ids = JSON.parse(report.chat_ids);
      } catch (e) {
        report.chat_ids = [];
      }
    }

    return report;
  }

  // ─── Tạo mới ─────────────────────────────────────────────────────────
  static create({ name, schedule_type, schedule_time, schedule_day, chat_ids, report_type, created_by }) {
    const stmt = db.prepare(
      `INSERT INTO scheduled_reports (name, schedule_type, schedule_time, schedule_day, chat_ids, report_type, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    );
    const result = stmt.run(
      name,
      schedule_type,
      schedule_time,
      schedule_day || null,
      chat_ids ? JSON.stringify(chat_ids) : '[]',
      report_type || 'uninspected',
      created_by || null
    );
    return this.findById(result.lastInsertRowid);
  }

  // ─── Cập nhật ─────────────────────────────────────────────────────────
  static update(id, { name, schedule_type, schedule_time, schedule_day, chat_ids, report_type, is_active, updated_by }) {
    const fields = [];
    const params = [];

    if (name          !== undefined) { fields.push('name = ?');          params.push(name); }
    if (schedule_type !== undefined) { fields.push('schedule_type = ?'); params.push(schedule_type); }
    if (schedule_time !== undefined) { fields.push('schedule_time = ?'); params.push(schedule_time); }
    if (schedule_day  !== undefined) { fields.push('schedule_day = ?');  params.push(schedule_day || null); }
    if (chat_ids      !== undefined) { fields.push('chat_ids = ?');      params.push(JSON.stringify(chat_ids || [])); }
    if (report_type   !== undefined) { fields.push('report_type = ?');   params.push(report_type); }
    if (is_active     !== undefined) { fields.push('is_active = ?');     params.push(is_active ? 1 : 0); }

    if (!fields.length) return this.findById(id);

    fields.push("updated_at = datetime('now')");
    if (updated_by !== undefined) {
      fields.push('updated_by = ?');
      params.push(updated_by || null);
    }
    params.push(id);

    db.prepare(`UPDATE scheduled_reports SET ${fields.join(', ')} WHERE id = ?`).run(...params);
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
      `UPDATE scheduled_reports SET ${fields.join(', ')} WHERE id = ?`
    ).run(...params);
  }

  // ─── Cập nhật last_run ────────────────────────────────────────────────
  static updateLastRun(id) {
    db.prepare(
      `UPDATE scheduled_reports SET last_run = datetime('now') WHERE id = ?`
    ).run(id);
  }

  // ─── Lấy các reports active cần chạy ─────────────────────────────────
  static findActiveReports() {
    return db
      .prepare(
        `SELECT * FROM scheduled_reports
         WHERE is_active = 1 AND deleted_at IS NULL
         ORDER BY created_at ASC`
      )
      .all();
  }
}

module.exports = ScheduledReportModel;
