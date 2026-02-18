const db = require('../db');

const up = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS assets (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id   INTEGER,
      asset_tag   TEXT    UNIQUE,
      description TEXT,
      condition   TEXT    CHECK(condition IN ('excellent', 'good', 'fair', 'poor')),
      notes       TEXT,
      created_by  INTEGER,
      updated_by  INTEGER,
      deleted_by  INTEGER,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      deleted_at  TEXT,
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (updated_by) REFERENCES users(id),
      FOREIGN KEY (deleted_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_assets_device_id  ON assets(device_id);
    CREATE INDEX IF NOT EXISTS idx_assets_asset_tag  ON assets(asset_tag);
    CREATE INDEX IF NOT EXISTS idx_assets_condition  ON assets(condition);
    CREATE INDEX IF NOT EXISTS idx_assets_created_by ON assets(created_by);
    CREATE INDEX IF NOT EXISTS idx_assets_updated_by ON assets(updated_by);
    CREATE INDEX IF NOT EXISTS idx_assets_deleted_by ON assets(deleted_by);
  `);

  console.log('✅ Migration: assets table created');
};

const down = () => {
  db.exec('DROP TABLE IF EXISTS assets');
  console.log('🗑️  Migration: assets table dropped');
};

module.exports = { up, down };
