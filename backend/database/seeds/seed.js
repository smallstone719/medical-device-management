const bcrypt = require('bcryptjs');

/**
 * Main seed function - tạo dữ liệu cơ bản và demo cho hệ thống
 * @param {Database} db - Better-sqlite3 database instance
 */
async function seed(db) {
  try {
    console.log('🌱 Bắt đầu seed database...\n');

    // ============================================
    // 1. XÓA DỮ LIỆU CŨ (nếu cần reset)
    // ============================================
    console.log('🗑️  Xóa dữ liệu demo cũ...');
    try { db.prepare('DELETE FROM ticket_replies').run(); } catch(e) {}
    try { db.prepare('DELETE FROM incident_tickets').run(); } catch(e) {}
    try { db.prepare('DELETE FROM inspections').run(); } catch(e) {}
    try { db.prepare('DELETE FROM devices').run(); } catch(e) {}
    try { db.prepare('DELETE FROM device_categories').run(); } catch(e) {}
    try { db.prepare('DELETE FROM departments').run(); } catch(e) {}
    try { db.prepare("DELETE FROM users WHERE username IN ('admin', 'demo', 'tech', 'viewer')").run(); } catch(e) {}

    // ============================================
    // 2. TẠO ADMIN USER
    // ============================================
    console.log('👤 Tạo admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const insertUser = db.prepare(`
      INSERT INTO users (username, password_hash, email, full_name, role, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    const adminResult = insertUser.run('admin', hashedPassword, 'admin@example.com', 'Administrator', 'admin');
    const adminId = adminResult.lastInsertRowid;
    console.log(`  ✅ Admin user created (ID: ${adminId})`);

    // ============================================
    // 3. TẠO DEPARTMENTS (Y TẾ)
    // ============================================
    console.log('\n🏥 Tạo khoa phòng...');
    const departments = [
      { code: 'CDHA', name: 'Chẩn đoán hình ảnh', description: 'Khoa Chẩn đoán hình ảnh' },
      { code: 'HSCC', name: 'Hồi sức tích cực', description: 'Khoa Hồi sức tích cực - Chống độc' },
      { code: 'CC', name: 'Cấp cứu', description: 'Khoa Cấp cứu' },
      { code: 'PM', name: 'Phòng mổ', description: 'Khu vực phẫu thuật' },
      { code: 'XQN', name: 'X-quang Nha', description: 'Khu vực chụp X-quang nha khoa' }
    ];

    const insertDept = db.prepare(`
      INSERT INTO departments (code, name, description, is_active, created_by)
      VALUES (?, ?, ?, 1, ?)
    `);

    const depMap = new Map();
    departments.forEach(dep => {
      const result = insertDept.run(dep.code, dep.name, dep.description, adminId);
      depMap.set(dep.name, result.lastInsertRowid);
      console.log(`  ✅ ${dep.name}`);
    });

    // ============================================
    // 4. TẠO DEVICE CATEGORIES
    // ============================================
    console.log('\n🏷️  Tạo loại thiết bị...');
    const categories = [
      { name: 'X-quang', description: 'Máy X-quang các loại', color: '#0ea5e9' },
      { name: 'CT Scanner', description: 'Máy chụp cắt lớp vi tính', color: '#8b5cf6' },
      { name: 'MRI', description: 'Máy cộng hưởng từ', color: '#ec4899' },
      { name: 'Siêu âm', description: 'Máy siêu âm các loại', color: '#10b981' },
      { name: 'Nội soi', description: 'Hệ thống nội soi', color: '#f59e0b' }
    ];

    const insertCat = db.prepare(`
      INSERT INTO device_categories (name, description, color, created_by)
      VALUES (?, ?, ?, ?)
    `);

    const catMap = new Map();
    categories.forEach(cat => {
      const result = insertCat.run(cat.name, cat.description, cat.color, adminId);
      catMap.set(cat.name, result.lastInsertRowid);
      console.log(`  ✅ ${cat.name}`);
    });

    // ============================================
    // 5. TẠO DEMO USERS
    // ============================================
    console.log('\n👥 Tạo demo users...');
    const demoDepId = depMap.get('Chẩn đoán hình ảnh');

    const demoUsers = [
      { username: 'demo', password: 'demo', fullName: 'Demo User', role: 'inspector' },
      { username: 'tech', password: '123456', fullName: 'Kỹ thuật viên', role: 'technician' },
      { username: 'viewer', password: '123456', fullName: 'Quan sát viên', role: 'viewer' }
    ];

    const userIds = { admin: adminId };
    for (const user of demoUsers) {
      const hash = await bcrypt.hash(user.password, 10);
      const result = insertUser.run(
        user.username,
        hash,
        `${user.username}@example.com`,
        user.fullName,
        user.role
      );
      userIds[user.username] = result.lastInsertRowid;
      console.log(`  ✅ ${user.username} (${user.role})`);
    }

    // ============================================
    // 6. TẠO DEVICES
    // ============================================
    console.log('\n📱 Tạo thiết bị...');
    const devices = [
      {
        name: 'Máy X-quang DR',
        model: 'DRX-Evolution',
        serial_number: 'XR2024001',
        manufacturer: 'Carestream',
        location: 'Phòng X-quang số 1',
        department: 'Chẩn đoán hình ảnh',
        category: 'X-quang',
        status: 'active'
      },
      {
        name: 'Máy CT Scanner 64 lát',
        model: 'Aquilion Prime SP',
        serial_number: 'CT2024002',
        manufacturer: 'Canon Medical',
        location: 'Phòng CT',
        department: 'Chẩn đoán hình ảnh',
        category: 'CT Scanner',
        status: 'active'
      },
      {
        name: 'Máy MRI 1.5T',
        model: 'Vantage Orian',
        serial_number: 'MR2024003',
        manufacturer: 'Canon Medical',
        location: 'Phòng MRI',
        department: 'Chẩn đoán hình ảnh',
        category: 'MRI',
        status: 'active'
      },
      {
        name: 'Máy siêu âm tổng quát',
        model: 'LOGIQ E10',
        serial_number: 'US2024004',
        manufacturer: 'GE Healthcare',
        location: 'Phòng siêu âm số 1',
        department: 'Chẩn đoán hình ảnh',
        category: 'Siêu âm',
        status: 'active'
      },
      {
        name: 'Máy siêu âm tim',
        model: 'Vivid E95',
        serial_number: 'US2024005',
        manufacturer: 'GE Healthcare',
        location: 'Phòng siêu âm tim mạch',
        department: 'Chẩn đoán hình ảnh',
        category: 'Siêu âm',
        status: 'active'
      },
      {
        name: 'Máy C-Arm di động',
        model: 'Cios Spin',
        serial_number: 'CA2024006',
        manufacturer: 'Siemens Healthineers',
        location: 'Phòng mổ',
        department: 'Phòng mổ',
        category: 'X-quang',
        status: 'maintenance'
      },
      {
        name: 'Máy X-quang di động',
        model: 'Mobilett Elara Max',
        serial_number: 'XR2024007',
        manufacturer: 'Siemens Healthineers',
        location: 'Khoa ICU',
        department: 'Hồi sức tích cực',
        category: 'X-quang',
        status: 'active'
      },
      {
        name: 'Máy nội soi tiêu hóa',
        model: 'Evis X1',
        serial_number: 'NS2024008',
        manufacturer: 'Olympus',
        location: 'Phòng nội soi',
        department: 'Chẩn đoán hình ảnh',
        category: 'Nội soi',
        status: 'active'
      },
      {
        name: 'Máy chụp nhũ ảnh Mammography',
        model: 'Senographe Pristina',
        serial_number: 'MM2024009',
        manufacturer: 'GE Healthcare',
        location: 'Phòng nhũ ảnh',
        department: 'Chẩn đoán hình ảnh',
        category: 'X-quang',
        status: 'active'
      },
      {
        name: 'Máy X-quang Panorama nha khoa',
        model: 'ORTHOPANTOMOGRAPH OP 3D',
        serial_number: 'XR2024010',
        manufacturer: 'KaVo Kerr',
        location: 'Phòng X-quang nha',
        department: 'X-quang Nha',
        category: 'X-quang',
        status: 'inactive'
      }
    ];

    const insertDevice = db.prepare(`
      INSERT INTO devices (name, model, serial_number, manufacturer, location, department_id, category_id, status, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'))
    `);

    const deviceIds = [];
    devices.forEach(device => {
      const depId = depMap.get(device.department);
      const catId = catMap.get(device.category);
      const daysAgo = Math.floor(Math.random() * 60) + 30; // 30-90 ngày trước
      
      const result = insertDevice.run(
        device.name,
        device.model,
        device.serial_number,
        device.manufacturer,
        device.location,
        depId,
        catId,
        device.status,
        adminId,
        daysAgo
      );
      deviceIds.push(result.lastInsertRowid);
      console.log(`  ✅ ${device.name}`);
    });

    // ============================================
    // 7. TẠO INSPECTIONS
    // ============================================
    console.log('\n📋 Tạo lịch sử kiểm tra...');
    const inspectors = [
      'Nguyễn Văn An',
      'Trần Thị Bình',
      'Lê Văn Cường',
      'Phạm Thị Dung',
      'Hoàng Văn Em'
    ];
    const statuses = ['good', 'good', 'good', 'good', 'issue', 'critical'];

    const insertInspection = db.prepare(`
      INSERT INTO inspections (device_id, inspector_name, user_id, status, notes, inspection_date, created_by)
      VALUES (?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days', '+' || ? || ' hours'), ?)
    `);

    let inspectionCount = 0;
    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
      const inspectionsPerDay = Math.floor(Math.random() * 6) + 3; // 3-8 per day
      
      for (let i = 0; i < inspectionsPerDay; i++) {
        const deviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)];
        const inspector = inspectors[Math.floor(Math.random() * inspectors.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const hour = Math.floor(Math.random() * 10) + 7; // 7-17h
        const userId = Math.random() > 0.5 ? userIds.demo : null;
        
        let notes = '';
        if (status === 'good') {
          notes = ['Thiết bị hoạt động bình thường', 'Đã kiểm tra, OK', 'Không có vấn đề', ''][Math.floor(Math.random() * 4)];
        } else if (status === 'issue') {
          notes = ['Cần vệ sinh bộ lọc', 'Màn hình hiển thị mờ', 'Tiếng ồn bất thường nhẹ'][Math.floor(Math.random() * 3)];
        } else {
          notes = ['Máy không khởi động được', 'Lỗi hệ thống, cần sửa chữa'][Math.floor(Math.random() * 2)];
        }
        
        insertInspection.run(deviceId, inspector, userId, status, notes, daysAgo, hour, adminId);
        inspectionCount++;
      }
    }
    console.log(`  ✅ Đã tạo ${inspectionCount} lần kiểm tra`);

    // ============================================
    // 8. TẠO TICKETS
    // ============================================
    console.log('\n🎫 Tạo sự cố (Tickets)...');
    const ticketSamples = [
      { title: 'Máy báo lỗi E04', desc: 'Máy báo lỗi E04 khi khởi động, cần kiểm tra gấp', priority: 'high', status: 'open' },
      { title: 'Hỏng bàn phím', desc: 'Phím Enter bị liệt', priority: 'low', status: 'in_progress' },
      { title: 'Màn hình chập chờn', desc: 'Màn hình thỉnh thoảng bị tắt', priority: 'medium', status: 'resolved' },
      { title: 'Cần bảo dưỡng định kỳ', desc: 'Đến hạn bảo dưỡng 6 tháng', priority: 'medium', status: 'open' }
    ];

    const insertTicket = db.prepare(`
      INSERT INTO incident_tickets (device_id, title, description, status, priority, created_by, assigned_to, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'))
    `);

    let ticketCount = 0;
    for (let i = 0; i < 10; i++) {
      const deviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)];
      const sample = ticketSamples[Math.floor(Math.random() * ticketSamples.length)];
      const daysAgo = Math.floor(Math.random() * 20);
      const assignedTo = sample.status !== 'open' ? userIds.tech : null;
      
      insertTicket.run(deviceId, sample.title, sample.desc, sample.status, sample.priority, userIds.demo, assignedTo, daysAgo);
      ticketCount++;
    }
    console.log(`  ✅ Đã tạo ${ticketCount} sự cố`);

    // ============================================
    // 9. SUMMARY
    // ============================================
    const deviceCount = db.prepare('SELECT COUNT(*) as count FROM devices').get().count;
    const totalInspections = db.prepare('SELECT COUNT(*) as count FROM inspections').get().count;
    const totalTickets = db.prepare('SELECT COUNT(*) as count FROM incident_tickets').get().count;

    console.log('\n📊 Tổng kết:');
    console.log(`  - Khoa phòng: ${departments.length}`);
    console.log(`  - Loại thiết bị: ${categories.length}`);
    console.log(`  - Thiết bị: ${deviceCount}`);
    console.log(`  - Lịch sử kiểm tra: ${totalInspections}`);
    console.log(`  - Sự cố (Tickets): ${totalTickets}`);
    console.log(`  - Users:`);
    console.log(`    • admin / admin123 (Administrator)`);
    console.log(`    • demo / demo (Inspector)`);
    console.log(`    • tech / 123456 (Technician)`);
    console.log(`    • viewer / 123456 (Viewer)`);

    console.log('\n✅ Seed hoàn tất!');
  } catch (err) {
    console.error('❌ Lỗi khi seed database:', err);
    throw err;
  }
}

module.exports = { seed };
