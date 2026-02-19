# Hướng Dẫn Deploy lên Railway.com

## Tổng Quan

Ứng dụng này đã được cấu hình sẵn để tự động chạy migrations khi deploy lên Railway. Bạn không cần thực hiện thêm bất kỳ bước nào để chạy migrations.

## Cách Hoạt Động

### Quy Trình Deploy Tự Động

```
┌─────────────────────────────────────────────────────────────┐
│  1. Push Code to GitHub                                     │
│     git push origin main                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Railway Detects Changes                                 │
│     - Pull latest code                                      │
│     - Install dependencies (npm install)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Railway Runs: npm start                                 │
│     → node backend/server.js                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  4. server.js Khởi Động                                     │
│     ┌─────────────────────────────────────────────┐         │
│     │ (async () => {                              │         │
│     │   await runMigrations(); // ← TỰ ĐỘNG!     │         │
│     │ })();                                       │         │
│     └─────────────────────────────────────────────┘         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Migrations Chạy Tự Động                                 │
│     ✅ Check bảng schema_migrations                         │
│     ✅ Chỉ chạy migrations mới chưa thực hiện               │
│     ✅ Skip migrations đã chạy rồi                          │
│     ✅ Lưu lại migrations đã chạy                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Server Sẵn Sàng! 🚀                                     │
│     ✅ Database đã được cập nhật                            │
│     ✅ API endpoints hoạt động                              │
│     ✅ Ứng dụng sẵn sàng phục vụ                            │
└─────────────────────────────────────────────────────────────┘
```

### Migrations Tự Động

File `backend/server.js` đã được cấu hình để:
1. Tự động chạy migrations khi server khởi động
2. Không crash nếu migration fail (chỉ log lỗi)
3. Tiếp tục start server sau khi migrations hoàn tất

```javascript
// Trong backend/server.js
(async () => {
  try {
    console.log('🔄 Running database migrations...');
    await runMigrations();
    console.log('✅ Migrations completed');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    // Server vẫn start ngay cả khi migration fail
  }
})();
```

## Các Bước Deploy

### 1. Chuẩn Bị Repository

```bash
# Đảm bảo code đã được commit
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Tạo Project trên Railway

1. Đăng nhập vào [Railway.app](https://railway.app)
2. Click "New Project"
3. Chọn "Deploy from GitHub repo"
4. Chọn repository của bạn

### 3. Cấu Hình Environment Variables

Trong Railway Dashboard, thêm các biến môi trường:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.com
```

### 4. Cấu Hình Database Persistence (QUAN TRỌNG!)

SQLite cần persistent storage để lưu database:

1. Trong Railway Dashboard, vào tab "Settings"
2. Scroll xuống "Volumes"
3. Click "Add Volume"
4. Cấu hình:
   - **Mount Path**: `/app/backend/database/data`
   - **Size**: 1GB (hoặc tùy nhu cầu)

### 5. Deploy

Railway sẽ tự động:
1. Pull code từ GitHub
2. Cài đặt dependencies (`npm install`)
3. Chạy `npm start`
4. Server khởi động và tự động chạy migrations
5. Ứng dụng sẵn sàng!

## Kiểm Tra Deployment

### Xem Logs

1. Vào Railway Dashboard
2. Click vào service của bạn
3. Xem tab "Deployments" → Click vào deployment mới nhất
4. Xem logs để kiểm tra migrations:

```
🔄 Running database migrations...
🔄 Starting migrations...

⏭️  Skipping 001_create_users (already executed)
⏭️  Skipping 002_create_devices (already executed)
...
▶️  Running 012_alter_users_add_phone_zalo...
✅ Completed 012_alter_users_add_phone_zalo

✅ Successfully ran 2 migration(s)
✅ Migrations completed
🚀 Server running on http://localhost:3000
```

### Test API

```bash
# Thay YOUR_RAILWAY_URL bằng URL thực tế
curl https://YOUR_RAILWAY_URL/api/health
```

## Migrations Trên Railway

### Migrations Tự Động Chạy Khi Nào?

Migrations tự động chạy mỗi khi:
- Deploy lần đầu
- Redeploy (restart service)
- Scale up/down
- Bất kỳ khi nào server restart

### Migrations Đã Chạy Sẽ Không Chạy Lại

Hệ thống migration tracking đảm bảo:
- Mỗi migration chỉ chạy 1 lần
- Migrations đã chạy được lưu trong bảng `schema_migrations`
- Chỉ migrations mới chưa chạy mới được thực thi

### Thêm Migration Mới

Khi bạn thêm migration mới:

1. Tạo file migration trong `backend/database/migrations/`
2. Commit và push code
3. Railway tự động deploy
4. Migration mới sẽ tự động chạy khi server restart

```bash
# Ví dụ: Thêm migration mới
cd backend/database/migrations
# Tạo file 014_add_new_feature.js
git add .
git commit -m "Add migration 014"
git push origin main
# Railway tự động deploy và chạy migration 014
```

## Chạy Migration Thủ Công (Nếu Cần)

### Mở Railway Shell

1. Vào Railway Dashboard
2. Click vào service
3. Click tab "Settings"
4. Scroll xuống "Service Settings"
5. Click "Open Shell" hoặc sử dụng Railway CLI

### Chạy Lệnh Migration

```bash
# Xem trạng thái migrations
cd backend
node scripts/run-migrations.js status

# Chạy migrations chưa thực hiện
node scripts/run-migrations.js up

# Rollback migration cuối cùng
node scripts/run-migrations.js down
```

## Troubleshooting

### Migration Fail

Nếu migration fail, kiểm tra logs:

```bash
# Trong Railway logs, tìm:
❌ Migration failed: [error message]
```

**Giải pháp**:
1. Server vẫn chạy bình thường (không crash)
2. Sửa lỗi trong migration file
3. Push code mới
4. Railway tự động redeploy và chạy lại migration

### Database Bị Mất Sau Restart

**Nguyên nhân**: Chưa cấu hình Volume

**Giải pháp**:
1. Thêm Volume như hướng dẫn ở bước 4
2. Mount path: `/app/backend/database/data`
3. Redeploy service

### Migration Chạy Nhiều Lần

**Không thể xảy ra** vì:
- Mỗi migration được track trong bảng `schema_migrations`
- Migrations đã chạy sẽ bị skip tự động
- Chỉ migrations mới chưa chạy mới được thực thi

## Best Practices

### 1. Backup Database Trước Khi Deploy

```bash
# Download database từ Railway
railway run bash
cd backend/database/data
# Copy file app.db về local
```

### 2. Test Migrations Locally Trước

```bash
# Test trên local trước khi deploy
cd backend
node scripts/run-migrations.js status
node scripts/run-migrations.js up
```

### 3. Viết Migration An Toàn

- Luôn kiểm tra xem cột/bảng đã tồn tại chưa
- Không xóa dữ liệu cũ
- Sử dụng transaction
- Có thể rollback được (nếu có thể)

### 4. Monitor Logs

- Luôn kiểm tra logs sau mỗi deployment
- Đảm bảo migrations chạy thành công
- Kiểm tra không có lỗi

## Railway CLI (Tùy Chọn)

### Cài Đặt

```bash
npm install -g @railway/cli
```

### Đăng Nhập

```bash
railway login
```

### Deploy Từ CLI

```bash
railway up
```

### Xem Logs

```bash
railway logs
```

### Chạy Commands

```bash
railway run node backend/scripts/run-migrations.js status
```

## Kết Luận

Với cấu hình hiện tại:
- ✅ Migrations tự động chạy khi deploy
- ✅ Không cần thêm bước thủ công
- ✅ An toàn, không làm mất dữ liệu
- ✅ Có thể rollback nếu cần
- ✅ Dễ dàng thêm migrations mới

Chỉ cần push code lên GitHub, Railway sẽ lo phần còn lại! 🚀
