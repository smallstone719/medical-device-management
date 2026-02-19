const db = require('../db');

const up = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT    NOT NULL UNIQUE,
      full_name     TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      role          TEXT    NOT NULL DEFAULT 'viewer'
                    CHECK(role IN ('admin', 'inspector', 'technician', 'viewer')),
      avatar        TEXT,
      phone_number  TEXT,
      zalo_id       TEXT,
      is_active     INTEGER NOT NULL DEFAULT 1,
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

    CREATE INDEX IF NOT EXISTS idx_users_username   ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email      ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role       ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
    CREATE INDEX IF NOT EXISTS idx_users_zalo_id    ON users(zalo_id);
    CREATE INDEX IF NOT EXISTS idx_users_is_active  ON users(is_active);
    CREATE INDEX IF NOT EXISTS idx_users_created_by ON users(created_by);
    CREATE INDEX IF NOT EXISTS idx_users_updated_by ON users(updated_by);
    CREATE INDEX IF NOT EXISTS idx_users_deleted_by ON users(deleted_by);
  `);

  console.log('✅ Migration: users table created');
};

const down = () => {
  db.exec('DROP TABLE IF EXISTS users');
  console.log('🗑️  Migration: users table dropped');
};

module.exports = { up, down };
