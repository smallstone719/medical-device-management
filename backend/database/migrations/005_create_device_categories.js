const db = require('../db');

const up = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS device_categories (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL UNIQUE,
      description TEXT,
      color       TEXT    DEFAULT '#0ea5e9',
      created_by  INTEGER,
      updated_by  INTEGER,
      deleted_by  INTEGER,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      deleted_at  TEXT,
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (updated_by) REFERENCES users(id),
      FOREIGN KEY (deleted_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_device_categories_name       ON device_categories(name);
    CREATE INDEX IF NOT EXISTS idx_device_categories_created_by ON device_categories(created_by);
    CREATE INDEX IF NOT EXISTS idx_device_categories_updated_by ON device_categories(updated_by);
    CREATE INDEX IF NOT EXISTS idx_device_categories_deleted_by ON device_categories(deleted_by);
  `);

  console.log('✅ Migration: device_categories table created');
};

const down = () => {
  db.exec('DROP TABLE IF EXISTS device_categories');
  console.log('🗑️  Migration: device_categories table dropped');
};

module.exports = { up, down };
