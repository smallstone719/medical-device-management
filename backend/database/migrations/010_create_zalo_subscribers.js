const db = require('../db');

const up = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS zalo_subscribers (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id       TEXT    NOT NULL UNIQUE,
      display_name  TEXT,
      department_id INTEGER,
      subscribed_at TEXT    NOT NULL DEFAULT (datetime('now')),
      created_by    INTEGER,
      updated_by    INTEGER,
      deleted_by    INTEGER,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      deleted_at    TEXT,
      FOREIGN KEY (department_id) REFERENCES departments(id),
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (updated_by) REFERENCES users(id),
      FOREIGN KEY (deleted_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_zalo_subscribers_chat_id       ON zalo_subscribers(chat_id);
    CREATE INDEX IF NOT EXISTS idx_zalo_subscribers_department_id ON zalo_subscribers(department_id);
    CREATE INDEX IF NOT EXISTS idx_zalo_subscribers_created_by    ON zalo_subscribers(created_by);
    CREATE INDEX IF NOT EXISTS idx_zalo_subscribers_updated_by    ON zalo_subscribers(updated_by);
    CREATE INDEX IF NOT EXISTS idx_zalo_subscribers_deleted_by    ON zalo_subscribers(deleted_by);
  `);

  console.log('✅ Migration: zalo_subscribers table created');
};

const down = () => {
  db.exec('DROP TABLE IF EXISTS zalo_subscribers');
  console.log('🗑️  Migration: zalo_subscribers table dropped');
};

module.exports = { up, down };
