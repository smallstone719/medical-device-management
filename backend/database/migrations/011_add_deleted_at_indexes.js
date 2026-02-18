const db = require('../db');

const up = () => {
  db.exec(`
    -- Add indexes for deleted_at columns to optimize soft delete queries
    CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_devices_deleted_at ON devices(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_inspections_deleted_at ON inspections(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_incident_tickets_deleted_at ON incident_tickets(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_device_categories_deleted_at ON device_categories(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_departments_deleted_at ON departments(deleted_at);
    
    -- Add composite indexes for common query patterns
    CREATE INDEX IF NOT EXISTS idx_devices_status_deleted ON devices(status, deleted_at);
    CREATE INDEX IF NOT EXISTS idx_devices_dept_deleted ON devices(department_id, deleted_at);
    CREATE INDEX IF NOT EXISTS idx_inspections_device_date ON inspections(device_id, inspection_date, deleted_at);
  `);

  console.log('✅ Migration: deleted_at indexes added');
};

const down = () => {
  db.exec(`
    DROP INDEX IF EXISTS idx_users_deleted_at;
    DROP INDEX IF EXISTS idx_devices_deleted_at;
    DROP INDEX IF EXISTS idx_inspections_deleted_at;
    DROP INDEX IF EXISTS idx_incident_tickets_deleted_at;
    DROP INDEX IF EXISTS idx_device_categories_deleted_at;
    DROP INDEX IF EXISTS idx_departments_deleted_at;
    DROP INDEX IF EXISTS idx_devices_status_deleted;
    DROP INDEX IF EXISTS idx_devices_dept_deleted;
    DROP INDEX IF EXISTS idx_inspections_device_date;
  `);
  console.log('🗑️  Migration: deleted_at indexes dropped');
};

module.exports = { up, down };
