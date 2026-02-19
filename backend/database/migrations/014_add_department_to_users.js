const db = require('../db');

const up = () => {
  console.log('▶️  Adding department_id column to users table...');
  
  // Kiểm tra xem cột đã tồn tại chưa
  const columns = db.prepare("PRAGMA table_info(users)").all();
  const hasDepartmentId = columns.some(col => col.name === 'department_id');
  
  if (!hasDepartmentId) {
    db.exec(`
      ALTER TABLE users ADD COLUMN department_id INTEGER;
      CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
    `);
    console.log('✅ Migration: Added department_id to users table');
  } else {
    console.log('ℹ️  department_id column already exists');
  }
};

const down = () => {
  console.log('⚠️  Note: SQLite does not support DROP COLUMN');
  console.log('ℹ️  To remove department_id, you would need to recreate the table');
};

module.exports = { up, down };
