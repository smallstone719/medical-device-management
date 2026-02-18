const db = require('../db');

const up = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      code        TEXT    NOT NULL UNIQUE,
      name        TEXT    NOT NULL,
      description TEXT,
      manager_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
      parent_id   INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      is_active   INTEGER NOT NULL DEFAULT 1,
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

    CREATE INDEX IF NOT EXISTS idx_departments_code       ON departments(code);
    CREATE INDEX IF NOT EXISTS idx_departments_parent_id  ON departments(parent_id);
    CREATE INDEX IF NOT EXISTS idx_departments_manager    ON departments(manager_id);
    CREATE INDEX IF NOT EXISTS idx_departments_created_by ON departments(created_by);
    CREATE INDEX IF NOT EXISTS idx_departments_updated_by ON departments(updated_by);
    CREATE INDEX IF NOT EXISTS idx_departments_deleted_by ON departments(deleted_by);

    -- Bảng liên kết user <-> department (1 user có thể thuộc nhiều phòng ban)
    CREATE TABLE IF NOT EXISTS user_departments (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
      is_primary    INTEGER NOT NULL DEFAULT 0,  -- Phòng ban chính
      joined_at     TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, department_id)
    );

    CREATE INDEX IF NOT EXISTS idx_user_departments_user   ON user_departments(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_departments_dept   ON user_departments(department_id);
  `);

  console.log('✅ Migration: departments & user_departments tables created');
};

const down = () => {
  db.exec(`
    DROP TABLE IF EXISTS user_departments;
    DROP TABLE IF EXISTS departments;
  `);
  console.log('🗑️  Migration: departments tables dropped');
};

module.exports = { up, down };
