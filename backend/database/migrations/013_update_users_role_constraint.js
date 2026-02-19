const db = require('../db');

const up = () => {
  try {
    console.log('⚠️  Note: SQLite does not support modifying CHECK constraints directly.');
    console.log('ℹ️  The role constraint will be enforced at application level.');
    console.log('ℹ️  Valid roles: admin, inspector, technician, viewer');
    console.log('ℹ️  Default role: viewer');
    
    // Cập nhật các role cũ nếu có (ví dụ: 'manager' -> 'inspector')
    const result = db.prepare(`
      UPDATE users 
      SET role = 'inspector' 
      WHERE role = 'manager'
    `).run();
    
    if (result.changes > 0) {
      console.log(`✅ Updated ${result.changes} user(s) from 'manager' to 'inspector' role`);
    }
    
    // Cập nhật các role không hợp lệ thành 'viewer'
    const invalidRoles = db.prepare(`
      UPDATE users 
      SET role = 'viewer' 
      WHERE role NOT IN ('admin', 'inspector', 'technician', 'viewer')
    `).run();
    
    if (invalidRoles.changes > 0) {
      console.log(`✅ Updated ${invalidRoles.changes} user(s) with invalid roles to 'viewer'`);
    }
    
    console.log('✅ Migration: Updated user roles');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  }
};

const down = () => {
  console.log('⚠️  Rollback: Cannot revert role changes automatically');
};

module.exports = { up, down };
