# Database Migrations

## Giới thiệu

Migration là cách quản lý thay đổi cấu trúc database một cách có tổ chức và an toàn. Mỗi migration là một file JavaScript chứa 2 hàm:
- `up()`: Thực hiện thay đổi (thêm bảng, cột, index, v.v.)
- `down()`: Hoàn tác thay đổi (rollback)

## 🚀 Deploy lên Railway?

Xem hướng dẫn chi tiết: [RAILWAY_DEPLOYMENT.md](../../../RAILWAY_DEPLOYMENT.md)

**TL;DR**: Migrations tự động chạy khi deploy. Không cần làm gì thêm!

## Chạy Migrations

### 1. Xem trạng thái migrations
```bash
cd backend
node scripts/run-migrations.js status
```

### 2. Chạy tất cả migrations chưa thực hiện
```bash
cd backend
node scripts/run-migrations.js up
```

### 3. Rollback migration cuối cùng
```bash
cd backend
node scripts/run-migrations.js down
```

## Migrations Hiện Tại

### 001_create_users.js
- Tạo bảng `users` với các cột cơ bản
- **LƯU Ý**: File này đã được cập nhật để bao gồm `phone_number` và `zalo_id`
- Nếu bảng đã tồn tại, sử dụng migration 012 và 013 để thêm cột mới

### 012_alter_users_add_phone_zalo.js
- **AN TOÀN**: Thêm cột `phone_number` và `zalo_id` vào bảng users đã tồn tại
- **KHÔNG LÀM MẤT DỮ LIỆU**: Chỉ thêm cột mới, không xóa dữ liệu cũ
- Kiểm tra xem cột đã tồn tại chưa trước khi thêm
- Tạo index cho các cột mới

### 013_update_users_role_constraint.js
- **AN TOÀN**: Cập nhật giá trị role cũ sang role mới
- Chuyển `manager` → `inspector`
- Chuyển các role không hợp lệ → `viewer`
- **KHÔNG LÀM MẤT DỮ LIỆU**: Chỉ cập nhật giá trị, không xóa

## Câu Hỏi Thường Gặp

### Q: Migration có làm mất dữ liệu không?
**A**: KHÔNG, nếu migration được viết đúng cách:
- Migration 012 và 013 chỉ THÊM cột mới và CẬP NHẬT giá trị
- Không có lệnh DELETE hoặc DROP
- Dữ liệu cũ được giữ nguyên 100%

### Q: Nếu database đã có dữ liệu, tôi nên làm gì?
**A**: Chạy migrations 012 và 013:
```bash
cd backend
node scripts/run-migrations.js up
```
Script sẽ tự động:
1. Kiểm tra migration nào đã chạy
2. Chỉ chạy migration mới chưa thực hiện
3. Bỏ qua migration đã chạy rồi

### Q: Làm sao biết migration nào đã chạy?
**A**: Xem trạng thái:
```bash
cd backend
node scripts/run-migrations.js status
```

### Q: Nếu migration bị lỗi thì sao?
**A**: 
- Migration chạy trong transaction, nếu lỗi sẽ tự động rollback
- Dữ liệu không bị ảnh hưởng
- Sửa lỗi trong file migration và chạy lại

### Q: Có thể rollback migration không?
**A**: 
- Có thể rollback migration cuối cùng bằng lệnh `down`
- **LƯU Ý**: SQLite không hỗ trợ DROP COLUMN, nên một số rollback cần thực hiện thủ công

## Tạo Migration Mới

### Quy tắc đặt tên
```
<số thứ tự>_<mô tả ngắn gọn>.js
```
Ví dụ: `014_add_user_avatar.js`

### Template
```javascript
const db = require('../db');

const up = () => {
  // Thực hiện thay đổi
  db.exec(`
    ALTER TABLE users ADD COLUMN new_column TEXT;
  `);
  console.log('✅ Migration: Added new_column');
};

const down = () => {
  // Hoàn tác thay đổi (nếu có thể)
  console.log('⚠️  Rollback not supported for this migration');
};

module.exports = { up, down };
```

## Best Practices

1. **Luôn backup database trước khi chạy migration**
2. **Test migration trên database test trước**
3. **Viết migration có thể rollback được (nếu có thể)**
4. **Không sửa migration đã chạy trên production**
5. **Tạo migration mới thay vì sửa migration cũ**
6. **Kiểm tra xem cột/bảng đã tồn tại chưa trước khi tạo**

## Deploy lên Railway.com

### Migrations Tự Động

**TIN TỐT**: Bạn KHÔNG cần làm gì thêm! 🎉

Khi deploy lên Railway, migrations sẽ tự động chạy vì:
1. File `server.js` đã được cấu hình để chạy migrations khi khởi động
2. Railway sẽ chạy lệnh `npm start` → chạy `node server.js`
3. Server tự động chạy `runMigrations()` trước khi start

### Quy Trình Deploy

```
1. Push code lên Git repository
   ↓
2. Railway pull code và cài đặt dependencies
   ↓
3. Railway chạy: npm start
   ↓
4. server.js khởi động
   ↓
5. ✅ Migrations tự động chạy
   ↓
6. ✅ Server start thành công
```

### Kiểm Tra Logs trên Railway

Sau khi deploy, kiểm tra logs để xác nhận migrations đã chạy:

```
🔄 Running database migrations...
🔄 Starting migrations...

⏭️  Skipping 001_create_users (already executed)
⏭️  Skipping 002_create_devices (already executed)
...
▶️  Running 012_alter_users_add_phone_zalo...
✅ Completed 012_alter_users_add_phone_zalo

▶️  Running 013_update_users_role_constraint...
✅ Completed 013_update_users_role_constraint

✅ Successfully ran 2 migration(s)
✅ Migrations completed
🚀 Server running on http://localhost:3000
```

### Lưu Ý Quan Trọng

1. **Database Persistence**: 
   - Railway cần mount volume cho SQLite database
   - Đảm bảo `backend/database/data/` được persist
   - Cấu hình trong Railway settings: Mount path = `/app/backend/database/data`

2. **Environment Variables**:
   - Cấu hình các biến môi trường cần thiết trong Railway
   - `PORT`, `JWT_SECRET`, `NODE_ENV`, v.v.

3. **Migration Safety**:
   - Nếu migration fail, server vẫn start (không crash)
   - Logs sẽ hiển thị lỗi để debug
   - Database không bị ảnh hưởng nhờ transaction

### Chạy Migration Thủ Công (Nếu Cần)

Nếu muốn chạy migration thủ công trên Railway:

1. Mở Railway Shell/Terminal
2. Chạy lệnh:
```bash
cd backend
node scripts/run-migrations.js up
```

### Rollback trên Railway

Nếu cần rollback migration:

1. Mở Railway Shell/Terminal
2. Chạy lệnh:
```bash
cd backend
node scripts/run-migrations.js down
```

## Backup Database

Trước khi chạy migration, nên backup database:
```bash
cp backend/database/data/app.db backend/database/data/app.db.backup
```

Khôi phục nếu cần:
```bash
cp backend/database/data/app.db.backup backend/database/data/app.db
```
