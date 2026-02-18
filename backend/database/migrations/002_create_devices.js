const db = require('../db');

const up = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS devices (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      name                  TEXT    NOT NULL,
      model                 TEXT,
      serial_number         TEXT    UNIQUE,
      manufacturer          TEXT,
      location              TEXT,
      department_id         INTEGER,
      category_id           INTEGER,
      purchase_date         TEXT,
      warranty_expiry       TEXT,
      usage_start_date      TEXT,
      next_maintenance_date TEXT,
      last_maintenance_date TEXT,
      status                TEXT    NOT NULL DEFAULT 'active'
                            CHECK(status IN ('active', 'maintenance', 'inactive', 'retired', 'broken')),
      require_auth          INTEGER NOT NULL DEFAULT 0,
      inspection_password   TEXT,
      inspection_frequency  TEXT    DEFAULT 'monthly'
                            CHECK(inspection_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
      qr_code               TEXT,
      image_url             TEXT,
      notes                 TEXT,
      created_by            INTEGER,
      updated_by            INTEGER,
      deleted_by            INTEGER,
      created_at            TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at            TEXT    NOT NULL DEFAULT (datetime('now')),
      deleted_at            TEXT,
      FOREIGN KEY (department_id) REFERENCES departments(id),
      FOREIGN KEY (category_id) REFERENCES device_categories(id),
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (updated_by) REFERENCES users(id),
      FOREIGN KEY (deleted_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_devices_serial_number  ON devices(serial_number);
    CREATE INDEX IF NOT EXISTS idx_devices_status         ON devices(status);
    CREATE INDEX IF NOT EXISTS idx_devices_location       ON devices(location);
    CREATE INDEX IF NOT EXISTS idx_devices_department_id  ON devices(department_id);
    CREATE INDEX IF NOT EXISTS idx_devices_category_id    ON devices(category_id);
    CREATE INDEX IF NOT EXISTS idx_devices_created_by     ON devices(created_by);
    CREATE INDEX IF NOT EXISTS idx_devices_updated_by     ON devices(updated_by);
    CREATE INDEX IF NOT EXISTS idx_devices_deleted_by     ON devices(deleted_by);
  `);

  console.log('✅ Migration: devices table created');
};

const down = () => {
  db.exec('DROP TABLE IF EXISTS devices');
  console.log('🗑️  Migration: devices table dropped');
};

module.exports = { up, down };
