# Railway Deployment Checklist

## Những thay đổi đã thực hiện để fix deployment

### 1. ✅ Fix Build Issues

**Vấn đề:** `run-p: not found` và `vite: not found`

**Giải pháp:**
- Cập nhật `frontend/package.json`: Thay đổi build script từ `run-p type-check "build-only {@}" --` thành `vite build`
- Cập nhật `nixpacks.toml`: Cài đặt devDependencies cho frontend
- Cập nhật `scripts/build.js`: Tự động cài dependencies trước khi build

### 2. ✅ Fix Health Check

**Vấn đề:** Health check endpoint `/api/config` yêu cầu authentication

**Giải pháp:**
- Thêm endpoint `/health` trong `backend/app.js` (không yêu cầu auth)
- Cập nhật `railway.json`: Thay đổi `healthcheckPath` từ `/api/config` thành `/health`

### 3. ✅ Database Migrations

**Đã thêm:**
- Migration 014: Thêm cột `department_id` vào bảng users
- Auto-run migrations khi server khởi động

## Environment Variables cần thiết trên Railway

```env
# Database (Railway tự động tạo nếu dùng Railway Postgres)
DATABASE_URL=postgresql://...

# hoặc dùng SQLite (mặc định)
# Không cần DATABASE_URL

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# CORS (optional)
CORS_ORIGIN=*

# Port (Railway tự động set)
PORT=3000
```

## Deployment Steps

1. **Push code lên repository**
   ```bash
   git add .
   git commit -m "Fix deployment issues"
   git push
   ```

2. **Railway sẽ tự động:**
   - Detect nixpacks.toml
   - Cài đặt dependencies (root, frontend, backend)
   - Build frontend
   - Run migrations
   - Start server
   - Health check tại `/health`

3. **Kiểm tra logs nếu có lỗi:**
   - Vào Railway Dashboard
   - Click vào service
   - Xem tab "Deploy Logs"

## Health Check Endpoint

```bash
# Test health check
curl https://your-app.railway.app/health

# Response:
{
  "status": "ok",
  "timestamp": "2026-02-19T15:23:59.772Z"
}
```

## Troubleshooting

### Server không khởi động
- Kiểm tra Deploy Logs
- Đảm bảo migrations chạy thành công
- Kiểm tra environment variables

### Health check fail
- Endpoint `/health` phải trả về status 200
- Không yêu cầu authentication
- Server phải khởi động trong vòng 100 giây

### Build fail
- Đảm bảo `nixpacks.toml` cài đúng dependencies
- Kiểm tra `scripts/build.js` có lỗi không
- Frontend dependencies phải được cài với `--include=dev`

## Files đã thay đổi

1. `backend/app.js` - Thêm `/health` endpoint
2. `railway.json` - Đổi health check path
3. `nixpacks.toml` - Cài dependencies cho frontend
4. `scripts/build.js` - Auto install dependencies
5. `frontend/package.json` - Đơn giản hóa build script
6. `backend/database/migrations/014_add_department_to_users.js` - Migration mới
7. `backend/modules/users/user.model.js` - Thêm department_id
8. `backend/middlewares/auth.middleware.js` - Fix user ID parsing

## Next Steps

Sau khi deploy thành công:
1. Truy cập URL Railway cung cấp
2. Đăng nhập với: `admin` / `admin123`
3. Kiểm tra các chức năng
4. Seed dữ liệu nếu cần (chạy manual trên Railway)
