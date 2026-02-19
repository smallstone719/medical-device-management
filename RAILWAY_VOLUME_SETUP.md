# Railway Volume Setup - Lưu trữ Database & Images

## ⚠️ Vấn đề
Railway xóa tất cả files mỗi lần deploy:
- ❌ Database SQLite bị mất
- ❌ Hình ảnh upload bị mất
- ❌ Logs bị mất

## ✅ Giải pháp: Railway Volume

Code đã được cấu hình sẵn để tự động sử dụng Railway Volume. Bạn chỉ cần tạo volume trên Railway.

### Bước 1: Tạo Volume trên Railway

1. Vào **Railway Dashboard** → Chọn project của bạn
2. Click vào **Service** (app của bạn)
3. Vào tab **"Settings"**
4. Scroll xuống phần **"Volumes"**
5. Click **"New Volume"**
6. Điền thông tin:
   ```
   Mount Path: /data
   Size: 1 GB (hoặc nhiều hơn)
   ```
7. Click **"Add"**

### Bước 2: Kiểm tra biến môi trường (Tự động)

Railway tự động set `RAILWAY_VOLUME_MOUNT_PATH=/data` khi bạn tạo volume.

Kiểm tra trong tab **"Variables"** để xác nhận.

### Bước 3: Deploy lại

Railway sẽ tự động deploy lại với volume mới.

### Bước 4: Seed dữ liệu

✅ **Tự động**: App sẽ tự động seed database nếu phát hiện không có user nào.

Trong logs bạn sẽ thấy:

```
📦 Database is empty, running auto-seed...
🌱 Bắt đầu seed database...
✅ Auto-seed completed
```

**Đăng nhập với:**
- Username: `admin`
- Password: `admin123`

### Bước 5: Nếu seed không chạy tự động

⚠️ Nếu bạn đã deploy trước khi có volume, database cũ có thể còn data nên không auto-seed.

**Cách 1: Force seed bằng biến môi trường (Dễ nhất)**

1. Railway Dashboard → Service → **Variables**
2. Thêm biến: `FORCE_SEED` = `true`
3. **Restart** service (hoặc deploy lại)
4. Xem logs để đảm bảo seed chạy
5. **XÓA** biến `FORCE_SEED` (quan trọng!)
6. Restart lại

**Cách 2: Dùng Railway CLI**

```bash
# Cài Railway CLI nếu chưa có
brew install railway
# hoặc: npm i -g @railway/cli

# Đăng nhập và link project
railway login
railway link

# Chạy seed
railway run node backend/database/seeds/seed.js
```

## 📁 Cấu trúc lưu trữ

Sau khi setup, dữ liệu sẽ được lưu vào volume:

```
/data/
├── database/
│   ├── app.db          # SQLite database
│   ├── app.db-shm      # Shared memory file
│   └── app.db-wal      # Write-ahead log
├── storage/
│   └── temp/           # Uploaded images
├── logs/               # Application logs
└── backups/            # Database backups (future)
```

## ✅ Kiểm tra

### Cách xem logs trên Railway:

1. Vào **Railway Dashboard** (railway.app)
2. Chọn **Project** của bạn
3. Click vào **Service** (app của bạn)
4. Click tab **"Deployments"** 
5. Click vào deployment mới nhất (có dấu ✓ xanh)
6. Click tab **"View Logs"** hoặc **"Deploy Logs"**

Trong logs, bạn sẽ thấy:

```
📁 Storage paths:
  - Volume: /data
  - Database: /data/database
  - Storage: /data/storage
  - Logs: /data/logs
📊 Database path: /data/database/app.db
```

Nếu thấy `Volume: /data` thì volume đã được mount thành công!

## 🔄 Seed dữ liệu ban đầu (Nếu cần)

Nếu database mới chưa có data, chạy seed qua Railway CLI:

```bash
railway run node backend/database/seeds/seed.js
```

Hoặc tạm thời thay đổi Start Command:
1. Railway Dashboard → Service → **"Settings"** → **"Deploy"**
2. Custom Start Command: `node backend/database/seeds/seed.js && npm start`
3. Deploy lại
4. Sau khi seed xong, đổi lại: `npm start`

## 💾 Backup

### Cài đặt Railway CLI (nếu chưa có)

```bash
# macOS/Linux
brew install railway

# hoặc dùng npm
npm i -g @railway/cli

# Đăng nhập
railway login
```

### Xem files trong volume

```bash
# Link project (chạy 1 lần đầu tiên)
railway link

# List files trong /data
railway run ls -la /data

# List files trong database folder
railway run ls -la /data/database

# List files trong storage folder
railway run ls -la /data/storage/temp

# Xem nội dung file
railway run cat /data/database/app.db-wal
```

### Manual backup qua Railway CLI

```bash
# Download database
railway run cat /data/database/app.db > backup.db

# Upload database
railway run "cat > /data/database/app.db" < backup.db

# Download toàn bộ storage folder
railway run tar -czf - /data/storage > storage-backup.tar.gz

# Upload storage folder
railway run "tar -xzf - -C /" < storage-backup.tar.gz
```

### Xóa files cũ (nếu cần)

```bash
# Xóa files cũ hơn 30 ngày trong storage
railway run find /data/storage/temp -type f -mtime +30 -delete

# Xem dung lượng đang dùng
railway run du -sh /data/*
```

### Tự động backup (Future)
Cron job sẽ tự động backup database mỗi ngày vào `/data/backups/`.

## 🚨 Troubleshooting

### Database vẫn bị reset
- Kiểm tra Volume đã được tạo (Settings → Volumes)
- Kiểm tra `RAILWAY_VOLUME_MOUNT_PATH=/data` trong Variables
- Xem logs để đảm bảo path đúng

### Images không hiển thị
- Kiểm tra uploads được lưu vào `/data/storage/temp`
- Kiểm tra static files serving trong logs

### Permission denied
- Railway volume cần vài giây để mount
- Restart service nếu cần

## 📊 Chi phí

Railway Volume:
- 1 GB: ~$5/tháng
- 5 GB: ~$10/tháng  
- 10 GB: ~$15/tháng

Khuyến nghị: Bắt đầu với 1 GB.

## 🎯 Kết quả

- ✅ Database không bị mất khi deploy
- ✅ Images upload được giữ lại
- ✅ Logs được lưu trữ
- ✅ Có thể backup/restore dễ dàng

---

**Lưu ý**: Code đã được cấu hình sẵn trong `backend/config/paths.js` để tự động detect và sử dụng Railway Volume. Bạn không cần thay đổi code.
