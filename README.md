# Medical Device Management System

Hệ thống quản lý thiết bị y tế với Electron, Vue 3, và Node.js.

## 📚 Tài Liệu

**[DOCS_INDEX.md](./DOCS_INDEX.md)** - Danh mục đầy đủ tất cả tài liệu

**Quick Links**:
- [Railway Quick Start](./RAILWAY_QUICKSTART.md) - Deploy trong 5 phút ⚡
- [Migration Cheat Sheet](./MIGRATION_CHEATSHEET.md) - Commands thường dùng 🎯
- [Railway Checklist](./.railway-checklist.md) - Checklist deploy ✅

## Cấu trúc dự án

- `electron/` - Electron Desktop App
- `backend/` - Node.js + Express API Server
- `frontend/` - Vue 3 SPA
- `scripts/` - Build và migration scripts

## Cài đặt

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd frontend && npm install
```

## Chạy dự án

```bash
# Copy .env.example to .env
cp .env.example .env

# Run migrations
npm run migrate

# Seed database
npm run seed

# Run development
npm run dev
```

## Build

```bash
npm run build
```

## Deploy lên Railway ⚡

**Quick Start**: [RAILWAY_QUICKSTART.md](./RAILWAY_QUICKSTART.md) - Deploy trong 5 phút!

**Chi tiết**: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) - Hướng dẫn đầy đủ

**TL;DR**: Migrations tự động chạy khi deploy. Chỉ cần:
1. Push code lên GitHub
2. Connect với Railway
3. Cấu hình Volume: `/app/backend/database/data`
4. Thêm Environment Variables
5. Deploy! 🚀

**Tài liệu**:
- [Quick Start](./RAILWAY_QUICKSTART.md) - Deploy nhanh 5 phút
- [Deployment Guide](./RAILWAY_DEPLOYMENT.md) - Hướng dẫn chi tiết
- [Checklist](./.railway-checklist.md) - Checklist từng bước
- [Migration Summary](./MIGRATION_SUMMARY.md) - Tóm tắt migrations
- [Migration Details](./backend/database/migrations/README.md) - Chi tiết migrations

## Tính năng

- Quản lý thiết bị y tế
- Quản lý tài sản
- Tạo mã QR
- Xuất báo cáo Excel
- Upload và xử lý ảnh
- Xác thực JWT
- Backup tự động
- Migrations tự động
