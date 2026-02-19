# Railway Quick Start - 5 Phút Deploy! ⚡

Hướng dẫn nhanh nhất để deploy lên Railway.com

## Bước 1: Chuẩn Bị (30 giây)

```bash
# Đảm bảo code đã commit
git add .
git commit -m "Ready for Railway"
git push origin main
```

## Bước 2: Tạo Project trên Railway (1 phút)

1. Vào [railway.app](https://railway.app)
2. Click **"New Project"**
3. Chọn **"Deploy from GitHub repo"**
4. Chọn repository của bạn
5. Railway bắt đầu deploy tự động

## Bước 3: Cấu Hình Volume (1 phút)

⚠️ **QUAN TRỌNG** - Không làm bước này database sẽ bị mất!

1. Click vào service vừa tạo
2. Vào tab **"Settings"**
3. Scroll xuống **"Volumes"**
4. Click **"Add Volume"**
5. Nhập:
   - **Mount Path**: `/app/backend/database/data`
   - **Size**: `1` GB
6. Click **"Add"**

## Bước 4: Cấu Hình Environment Variables (2 phút)

1. Vào tab **"Variables"**
2. Click **"Add Variable"**
3. Thêm các biến sau:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

4. Click **"Deploy"** để restart với config mới

## Bước 5: Kiểm Tra (1 phút)

1. Vào tab **"Deployments"**
2. Click vào deployment mới nhất
3. Xem logs, tìm dòng:

```
🔄 Running database migrations...
✅ Migrations completed
🚀 Server running on http://localhost:3000
```

4. Copy Railway URL từ dashboard
5. Test API:

```bash
curl https://YOUR_RAILWAY_URL/api/health
```

## ✅ Xong! 

Ứng dụng đã sẵn sàng trên Railway! 🎉

## Migrations Đã Tự Động Chạy

Khi server start, các migrations sau đã tự động chạy:
- ✅ Tạo tất cả bảng cần thiết
- ✅ Thêm cột phone_number và zalo_id
- ✅ Cập nhật role constraints
- ✅ Tạo indexes

## Thêm Migration Mới

Khi cần thêm migration:

```bash
# 1. Tạo file migration mới
cd backend/database/migrations
# Tạo file 014_your_migration.js

# 2. Push code
git add .
git commit -m "Add migration 014"
git push origin main

# 3. Railway tự động deploy và chạy migration mới! ✅
```

## Troubleshooting Nhanh

### Database bị mất sau restart?
→ Chưa cấu hình Volume. Làm lại Bước 3.

### Migration không chạy?
→ Xem logs để kiểm tra lỗi. Server vẫn start bình thường.

### API không hoạt động?
→ Kiểm tra Environment Variables và CORS_ORIGIN.

## Tài Liệu Chi Tiết

- [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) - Hướng dẫn đầy đủ
- [.railway-checklist.md](./.railway-checklist.md) - Checklist chi tiết
- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - Tóm tắt migrations

## Railway CLI (Tùy Chọn)

Nếu muốn deploy từ terminal:

```bash
# Cài đặt
npm install -g @railway/cli

# Đăng nhập
railway login

# Deploy
railway up

# Xem logs
railway logs
```

## Monitoring

Sau khi deploy:
- ✅ Kiểm tra logs trong 5 phút đầu
- ✅ Test các API endpoints chính
- ✅ Monitor memory và CPU usage
- ✅ Backup database định kỳ

## Support

Gặp vấn đề? Kiểm tra:
1. Railway logs (tab Deployments)
2. Environment variables (tab Variables)
3. Volume configuration (tab Settings)
4. [Tài liệu chi tiết](./RAILWAY_DEPLOYMENT.md)

---

**Chúc mừng! Ứng dụng của bạn đã live trên Railway! 🚀**
