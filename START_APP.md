# 🚀 Hướng dẫn chạy ứng dụng

## ✅ Trạng thái hiện tại

- ✅ Backend đang chạy tại: http://localhost:3000
- ✅ Frontend đang chạy tại: http://localhost:5173
- ✅ Không có lỗi TypeScript
- ✅ Dependencies đã được cài đặt

## 📱 Truy cập ứng dụng

### Frontend (Web Interface)
```
http://localhost:5173
```

### Backend API
```
http://localhost:3000/api
```

## 🔐 Đăng nhập

Sử dụng tài khoản mặc định (sau khi chạy seed):

```
Username: admin
Password: admin123
```

## 🛠️ Các lệnh hữu ích

### Backend

```bash
# Start backend
cd backend
npm start

# Run migrations
npm run migrate

# Seed database
npm run seed

# View logs
tail -f backend/logs/app.log
```

### Frontend

```bash
# Start frontend dev server
cd frontend
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## 📊 Các trang đã hoàn thiện

1. **Dashboard** (`/`)
   - Tổng quan thống kê thiết bị
   - Biểu đồ theo danh mục và phòng ban
   - Real-time data

2. **Quản lý thiết bị** (`/devices`)
   - Danh sách thiết bị
   - Tìm kiếm và filter
   - Pagination
   - CRUD operations

3. **Đăng nhập** (`/signin`)
   - Authentication với JWT
   - Auto redirect

## 🔍 Test API

### Test backend health
```bash
curl http://localhost:3000/api/statistics
# Response: {"success":false,"message":"Chưa đăng nhập"}
```

### Test login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test với token
```bash
# Lấy token từ response login, sau đó:
curl http://localhost:3000/api/statistics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🐛 Troubleshooting

### Frontend không kết nối được backend

1. Kiểm tra backend đang chạy:
```bash
curl http://localhost:3000/api/statistics
```

2. Kiểm tra CORS trong backend `.env`:
```env
CORS_ORIGIN=http://localhost:5173
```

3. Kiểm tra frontend `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### Lỗi "Chưa đăng nhập"

Đây là behavior bình thường. Bạn cần:
1. Truy cập http://localhost:5173
2. Đăng nhập với admin/admin123
3. Token sẽ được lưu trong localStorage

### Port đã được sử dụng

**Backend (port 3000):**
```bash
# Tìm process
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)
```

**Frontend (port 5173):**
```bash
# Tìm process
lsof -ti:5173

# Kill process
kill -9 $(lsof -ti:5173)
```

## 📁 Cấu trúc dự án

```
medical-device-management/
├── backend/              # Node.js + Express API
│   ├── modules/         # API modules
│   ├── database/        # SQLite database
│   └── logs/           # Application logs
│
├── frontend/            # Vue 3 + TypeScript
│   ├── src/
│   │   ├── services/   # API services
│   │   ├── views/      # Pages
│   │   ├── components/ # Vue components
│   │   └── router/     # Vue Router
│   └── .env           # Environment config
│
└── docs/               # Documentation
```

## 🎯 Các tính năng chính

### Đã hoàn thiện ✅
- Authentication (JWT)
- Dashboard với thống kê
- Quản lý thiết bị (list, filter, pagination)
- Toast notifications
- Dark mode support
- Responsive design

### Cần phát triển thêm 🚧
- Device detail page
- Device create/edit modal
- Inspection management
- Ticket management
- Reports & Export
- Settings pages
- User management

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/change-password` - Đổi mật khẩu

### Devices
- `GET /api/devices` - Danh sách thiết bị
- `GET /api/devices/:id` - Chi tiết thiết bị
- `POST /api/devices` - Tạo thiết bị
- `PUT /api/devices/:id` - Cập nhật thiết bị
- `DELETE /api/devices/:id` - Xóa thiết bị

### Statistics
- `GET /api/statistics` - Thống kê tổng quan

### Categories & Departments
- `GET /api/categories` - Danh sách danh mục
- `GET /api/departments` - Danh sách phòng ban

## 🎉 Kết luận

Ứng dụng đã sẵn sàng sử dụng! Truy cập http://localhost:5173 để bắt đầu.

Nếu gặp vấn đề, xem thêm:
- `FRONTEND_COMPLETE.md` - Chi tiết frontend
- `frontend/SETUP.md` - Hướng dẫn setup frontend
- `QUICK_START.md` - Hướng dẫn backend
