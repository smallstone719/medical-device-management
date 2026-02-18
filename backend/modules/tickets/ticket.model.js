const db = require('../../database/db');

class TicketModel {
  // ─── Lấy tất cả tickets (có phân trang + filter) ────────────────────
  static findAll({ page = 1, limit = 20, status = '', priority = '', assigned_to = '', device_id = '' } = {}) {
    const offset = (page - 1) * limit;

    let where = 'WHERE t.deleted_at IS NULL';
    const params = [];

    if (status) {
      where += ' AND t.status = ?';
      params.push(status);
    }

    if (priority) {
      where += ' AND t.priority = ?';
      params.push(priority);
    }

    if (assigned_to) {
      where += ' AND t.assigned_to = ?';
      params.push(assigned_to);
    }

    if (device_id) {
      where += ' AND t.device_id = ?';
      params.push(device_id);
    }

    const total = db
      .prepare(`SELECT COUNT(*) as count FROM incident_tickets t ${where}`)
      .get(...params).count;

    const rows = db
      .prepare(
        `SELECT
           t.id, t.device_id, t.title, t.description, t.status, t.priority,
           t.assigned_to, t.resolved_at, t.created_at, t.updated_at,
           d.name AS device_name,
           d.location AS device_location,
           u1.full_name AS created_by_name,
           u2.full_name AS assigned_to_name
         FROM incident_tickets t
         LEFT JOIN devices d ON d.id = t.device_id AND d.deleted_at IS NULL
         LEFT JOIN users u1 ON u1.id = t.created_by AND u1.deleted_at IS NULL
         LEFT JOIN users u2 ON u2.id = t.assigned_to AND u2.deleted_at IS NULL
         ${where}
         ORDER BY t.created_at DESC
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
           t.id, t.device_id, t.title, t.description, t.status, t.priority,
           t.assigned_to, t.resolved_at, t.created_at, t.updated_at,
           d.name AS device_name,
           d.location AS device_location,
           u1.full_name AS created_by_name,
           u2.full_name AS assigned_to_name
         FROM incident_tickets t
         LEFT JOIN devices d ON d.id = t.device_id AND d.deleted_at IS NULL
         LEFT JOIN users u1 ON u1.id = t.created_by AND u1.deleted_at IS NULL
         LEFT JOIN users u2 ON u2.id = t.assigned_to AND u2.deleted_at IS NULL
         WHERE t.id = ? AND t.deleted_at IS NULL`
      )
      .get(id);
  }

  // ─── Tạo mới ─────────────────────────────────────────────────────────
  static create({ device_id, title, description, priority, assigned_to, created_by }) {
    const stmt = db.prepare(
      `INSERT INTO incident_tickets (device_id, title, description, priority, assigned_to, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    );
    const result = stmt.run(
      device_id,
      title,
      description || null,
      priority || 'medium',
      assigned_to || null,
      created_by || null
    );
    return this.findById(result.lastInsertRowid);
  }

  // ─── Cập nhật ─────────────────────────────────────────────────────────
  static update(id, { title, description, status, priority, assigned_to, updated_by }) {
    const fields = [];
    const params = [];

    if (title       !== undefined) { fields.push('title = ?');       params.push(title); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (status      !== undefined) { 
      fields.push('status = ?'); 
      params.push(status);
      // Nếu status là resolved hoặc closed, set resolved_at
      if (status === 'resolved' || status === 'closed') {
        fields.push("resolved_at = COALESCE(resolved_at, datetime('now'))");
      }
    }
    if (priority    !== undefined) { fields.push('priority = ?');    params.push(priority); }
    if (assigned_to !== undefined) { fields.push('assigned_to = ?'); params.push(assigned_to || null); }

    if (!fields.length) return this.findById(id);

    fields.push("updated_at = datetime('now')");
    if (updated_by !== undefined) {
      fields.push('updated_by = ?');
      params.push(updated_by || null);
    }
    params.push(id);

    db.prepare(`UPDATE incident_tickets SET ${fields.join(', ')} WHERE id = ?`).run(...params);
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
      `UPDATE incident_tickets SET ${fields.join(', ')} WHERE id = ?`
    ).run(...params);
  }

  // ─── Claim ticket ─────────────────────────────────────────────────────
  static claim(id, user_id) {
    db.prepare(
      `UPDATE incident_tickets 
       SET assigned_to = ?, status = 'in_progress', updated_at = datetime('now')
       WHERE id = ?`
    ).run(user_id, id);
    return this.findById(id);
  }

  // ─── Lấy replies của ticket ───────────────────────────────────────────
  static findReplies(ticket_id) {
    return db
      .prepare(
        `SELECT
           r.id, r.ticket_id, r.user_id, r.message, r.created_at,
           u.full_name AS user_name,
           u.role AS user_role
         FROM ticket_replies r
         LEFT JOIN users u ON u.id = r.user_id AND u.deleted_at IS NULL
         WHERE r.ticket_id = ?
         ORDER BY r.created_at ASC`
      )
      .all(ticket_id);
  }

  // ─── Tạo reply mới ────────────────────────────────────────────────────
  static createReply(ticket_id, user_id, message) {
    const stmt = db.prepare(
      `INSERT INTO ticket_replies (ticket_id, user_id, message, created_at)
       VALUES (?, ?, ?, datetime('now'))`
    );
    const result = stmt.run(ticket_id, user_id, message);
    
    return db
      .prepare(
        `SELECT
           r.id, r.ticket_id, r.user_id, r.message, r.created_at,
           u.full_name AS user_name,
           u.role AS user_role
         FROM ticket_replies r
         LEFT JOIN users u ON u.id = r.user_id
         WHERE r.id = ?`
      )
      .get(result.lastInsertRowid);
  }
}

module.exports = TicketModel;
