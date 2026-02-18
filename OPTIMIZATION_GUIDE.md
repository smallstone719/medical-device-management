# Hướng dẫn cài đặt tối ưu Cấp độ 1

## Các thay đổi đã thực hiện:

### 1. ✅ Tối ưu Database Queries
- **statistics.service.js**: Gộp 4 queries riêng lẻ thành 1 query duy nhất sử dụng CASE WHEN
- **statistics.service.js**: Thay đổi NOT IN subquery thành LEFT JOIN (hiệu suất tốt hơn)
- Giảm số lượng database calls từ 4 xuống 1 cho device counts

### 2. ✅ Thêm Database Indexes
- Tạo migration mới: `011_add_deleted_at_indexes.js`
- Thêm indexes cho `deleted_at` trên tất cả bảng chính
- Thêm composite indexes cho query patterns phổ biến:
  - `devices(status, deleted_at)`
  - `devices(department_id, deleted_at)`
  - `inspections(device_id, inspection_date, deleted_at)`

### 3. ✅ Chuyển File Operations sang Async
- **backup.job.js**: Chuyển từ `fs.copyFileSync()` sang `fs.copyFile()` (async)
- **backup.job.js**: Thêm tự động cleanup backups cũ (giữ 7 ngày)
- **cleanup.job.js**: Chuyển từ `fs.readdirSync/statSync/unlinkSync` sang async promises
- **cleanup.job.js**: Xử lý files song song với `Promise.all()`

### 4. ✅ Thêm Rate Limiting
- Tạo middleware mới: `rate-limit.middleware.js`
- Login endpoint: 5 requests/15 phút
- API endpoints: 100 requests/15 phút
- Bảo vệ khỏi brute force attacks

### 5. ✅ Cấu hình CORS đúng cách
- Thêm biến môi trường `CORS_ORIGIN`
- Hỗ trợ credentials
- Dễ dàng restrict origins trong production

### 6. ✅ Thêm Request Size Limits
- JSON payload: giới hạn 10MB
- URL encoded: giới hạn 10MB
- Bảo vệ khỏi memory exhaustion attacks

## Cài đặt:

### Bước 1: Cài đặt dependencies mới
```bash
cd backend
npm install
```

### Bước 2: Chạy migration mới
```bash
npm run migrate
```

### Bước 3: Cập nhật file .env
Thêm vào file `.env`:
```env
# CORS Configuration (production)
CORS_ORIGIN=https://yourdomain.com

# Hoặc để mặc định cho development
CORS_ORIGIN=*
```

### Bước 4: Khởi động lại server
```bash
npm start
```

## Kiểm tra kết quả:

### Test Rate Limiting:
```bash
# Thử login sai 6 lần liên tiếp
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"wrong","password":"wrong"}'
done
```

### Kiểm tra indexes:
```bash
# Vào SQLite console
sqlite3 backend/database/data/app.db

# Xem indexes
.indexes devices
.indexes inspections
```

### Kiểm tra performance:
- Statistics API nên nhanh hơn ~3-4x
- Backup job không còn block server
- Cleanup job xử lý nhiều files nhanh hơn

## Lưu ý:

1. **CORS_ORIGIN**: Nhớ set giá trị cụ thể trong production
2. **Rate limits**: Có thể điều chỉnh trong `rate-limit.middleware.js`
3. **Backup retention**: Mặc định giữ 7 ngày, có thể thay đổi trong `backup.job.js`
4. **Indexes**: Sẽ tự động tạo khi chạy migration

## Kết quả mong đợi:

- ⚡ Statistics API nhanh hơn 3-4 lần
- 🔒 Bảo vệ khỏi brute force attacks
- 💾 Backup không còn block event loop
- 🗂️ Queries với soft delete nhanh hơn đáng kể
- 🛡️ Bảo vệ khỏi CORS và request size attacks
