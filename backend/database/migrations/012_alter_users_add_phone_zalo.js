const db = require('../db');

const up = () => {
  try {
    // Kiểm tra xem cột phone_number đã tồn tại chưa
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasPhoneNumber = tableInfo.some(col => col.name === 'phone_number');
    const hasZaloId = tableInfo.some(col => col.name === 'zalo_id');
    
    // Thêm cột phone_number nếu chưa có
    if (!hasPhoneNumber) {
      db.exec(`ALTER TABLE users ADD COLUMN phone_number TEXT;`);
      console.log('✅ Added phone_number column to users table');
    } else {
      console.log('ℹ️  phone_number column already exists');
    }
    
    // Thêm cột zalo_id nếu chưa có
    if (!hasZaloId) {
      db.exec(`ALTER TABLE users ADD COLUMN zalo_id TEXT;`);
      console.log('✅ Added zalo_id column to users table');
    } else {
      console.log('ℹ️  zalo_id column already exists');
    }
    
    // Tạo index cho các cột mới
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
      CREATE INDEX IF NOT EXISTS idx_users_zalo_id ON users(zalo_id);
    `);
    
    console.log('✅ Migration: Added phone_number and zalo_id to users table');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  }
};

const down = () => {
  // SQLite không hỗ trợ DROP COLUMN trực tiếp
  // Để rollback, cần tạo lại bảng mà không có các cột này
  console.log('⚠️  Warning: SQLite does not support DROP COLUMN.');
  console.log('⚠️  To rollback, you need to manually recreate the table without these columns.');
  console.log('⚠️  This will require backing up data first.');
};

module.exports = { up, down };
