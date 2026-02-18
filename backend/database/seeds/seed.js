const bcrypt = require('bcryptjs');

async function seed(db) {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (username, password_hash, email, full_name, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = insertUser.run('admin', hashedPassword, 'admin@example.com', 'Administrator', 'admin');
  const adminId = result.lastInsertRowid || 1;

  // Create sample departments
  const insertDept = db.prepare(`
    INSERT OR IGNORE INTO departments (code, name, description, is_active, created_by)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertDept.run('IT', 'Phòng Công nghệ thông tin', 'Quản lý hệ thống và phát triển phần mềm', 1, adminId);
  insertDept.run('HR', 'Phòng Nhân sự', 'Quản lý nguồn nhân lực và tuyển dụng', 1, adminId);
  insertDept.run('FIN', 'Phòng Tài chính', 'Quản lý tài chính và kế toán', 1, adminId);
  insertDept.run('OPS', 'Phòng Vận hành', 'Quản lý hoạt động và logistics', 1, adminId);

  console.log('✅ Database seeded');
}

module.exports = { seed };
