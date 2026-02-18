const db = require('../db');

const up = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_config (
      key        TEXT PRIMARY KEY,
      value      TEXT,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (updated_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_system_config_created_by ON system_config(created_by);
    CREATE INDEX IF NOT EXISTS idx_system_config_updated_by ON system_config(updated_by);
  `);

  console.log('✅ Migration: system_config table created');
};

const down = () => {
  db.exec('DROP TABLE IF EXISTS system_config');
  console.log('🗑️  Migration: system_config table dropped');
};

module.exports = { up, down };
