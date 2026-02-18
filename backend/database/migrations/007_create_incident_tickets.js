const db = require('../db');

const up = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS incident_tickets (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id   INTEGER NOT NULL,
      title       TEXT    NOT NULL,
      description TEXT,
      status      TEXT    NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
      priority    TEXT    NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
      assigned_to INTEGER,
      resolved_at TEXT,
      created_by  INTEGER,
      updated_by  INTEGER,
      deleted_by  INTEGER,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      deleted_at  TEXT,
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (updated_by) REFERENCES users(id),
      FOREIGN KEY (deleted_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_incident_tickets_device_id    ON incident_tickets(device_id);
    CREATE INDEX IF NOT EXISTS idx_incident_tickets_status       ON incident_tickets(status);
    CREATE INDEX IF NOT EXISTS idx_incident_tickets_priority     ON incident_tickets(priority);
    CREATE INDEX IF NOT EXISTS idx_incident_tickets_assigned_to  ON incident_tickets(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_incident_tickets_created_by   ON incident_tickets(created_by);
    CREATE INDEX IF NOT EXISTS idx_incident_tickets_updated_by   ON incident_tickets(updated_by);
    CREATE INDEX IF NOT EXISTS idx_incident_tickets_deleted_by   ON incident_tickets(deleted_by);

    -- Bảng ticket replies
    CREATE TABLE IF NOT EXISTS ticket_replies (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id  INTEGER NOT NULL,
      user_id    INTEGER NOT NULL,
      message    TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (ticket_id) REFERENCES incident_tickets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket_id ON ticket_replies(ticket_id);
    CREATE INDEX IF NOT EXISTS idx_ticket_replies_user_id   ON ticket_replies(user_id);
  `);

  console.log('✅ Migration: incident_tickets & ticket_replies tables created');
};

const down = () => {
  db.exec(`
    DROP TABLE IF EXISTS ticket_replies;
    DROP TABLE IF EXISTS incident_tickets;
  `);
  console.log('🗑️  Migration: incident_tickets tables dropped');
};

module.exports = { up, down };
