const db = require('../db');

const up = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS scheduled_reports (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      schedule_type TEXT    NOT NULL CHECK(schedule_type IN ('daily', 'weekly', 'monthly')),
      schedule_time TEXT    NOT NULL,
      schedule_day  INTEGER,
      chat_ids      TEXT,
      report_type   TEXT    DEFAULT 'uninspected',
      is_active     INTEGER NOT NULL DEFAULT 1,
      last_run      TEXT,
      created_by    INTEGER,
      updated_by    INTEGER,
      deleted_by    INTEGER,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      deleted_at    TEXT,
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (updated_by) REFERENCES users(id),
      FOREIGN KEY (deleted_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_scheduled_reports_is_active   ON scheduled_reports(is_active);
    CREATE INDEX IF NOT EXISTS idx_scheduled_reports_created_by  ON scheduled_reports(created_by);
    CREATE INDEX IF NOT EXISTS idx_scheduled_reports_updated_by  ON scheduled_reports(updated_by);
    CREATE INDEX IF NOT EXISTS idx_scheduled_reports_deleted_by  ON scheduled_reports(deleted_by);
  `);

  console.log('✅ Migration: scheduled_reports table created');
};

const down = () => {
  db.exec('DROP TABLE IF EXISTS scheduled_reports');
  console.log('🗑️  Migration: scheduled_reports table dropped');
};

module.exports = { up, down };
