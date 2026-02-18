const db = require('../db');

const up = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS inspections (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id       INTEGER NOT NULL,
      inspector_name  TEXT    NOT NULL,
      user_id         INTEGER,
      inspection_date TEXT    NOT NULL DEFAULT (datetime('now')),
      status          TEXT    NOT NULL CHECK(status IN ('good', 'issue', 'critical')),
      notes           TEXT,
      issues          TEXT,
      images          TEXT,
      created_by      INTEGER,
      updated_by      INTEGER,
      deleted_by      INTEGER,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      deleted_at      TEXT,
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (updated_by) REFERENCES users(id),
      FOREIGN KEY (deleted_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_inspections_device_id        ON inspections(device_id);
    CREATE INDEX IF NOT EXISTS idx_inspections_user_id          ON inspections(user_id);
    CREATE INDEX IF NOT EXISTS idx_inspections_status           ON inspections(status);
    CREATE INDEX IF NOT EXISTS idx_inspections_inspection_date  ON inspections(inspection_date);
    CREATE INDEX IF NOT EXISTS idx_inspections_created_by       ON inspections(created_by);
    CREATE INDEX IF NOT EXISTS idx_inspections_updated_by       ON inspections(updated_by);
    CREATE INDEX IF NOT EXISTS idx_inspections_deleted_by       ON inspections(deleted_by);
  `);

  console.log('✅ Migration: inspections table created');
};

const down = () => {
  db.exec('DROP TABLE IF EXISTS inspections');
  console.log('🗑️  Migration: inspections table dropped');
};

module.exports = { up, down };
