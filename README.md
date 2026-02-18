# Medical Device Management System

Hệ thống quản lý thiết bị y tế với Electron, Vue 3, và Node.js.

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

## Tính năng

- Quản lý thiết bị y tế
- Quản lý tài sản
- Tạo mã QR
- Xuất báo cáo Excel
- Upload và xử lý ảnh
- Xác thực JWT
- Backup tự động
