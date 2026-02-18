# Frontend Setup Guide

## Cấu trúc dự án

```
frontend/
├── src/
│   ├── assets/          # CSS, images, fonts
│   ├── components/      # Vue components
│   │   ├── common/      # Shared components
│   │   ├── layout/      # Layout components
│   │   └── ...
│   ├── composables/     # Vue composables (hooks)
│   ├── icons/           # Icon components
│   ├── router/          # Vue Router config
│   ├── services/        # API services
│   ├── views/           # Page components
│   │   ├── Auth/        # Authentication pages
│   │   ├── Dashboard/   # Dashboard page
│   │   ├── Devices/     # Device management pages
│   │   └── ...
│   ├── App.vue          # Root component
│   └── main.ts          # Entry point
├── .env                 # Environment variables
└── package.json
```

## Cài đặt

### 1. Cài đặt dependencies

```bash
cd frontend
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Chạy development server

```bash
npm run dev
```

Frontend sẽ chạy tại: http://localhost:5173

## Build cho production

```bash
npm run build
```

Files build sẽ được tạo trong thư mục `dist/`

## Các tính năng đã hoàn thiện

### ✅ Authentication
- Đăng nhập với username/password
- JWT token authentication
- Auto redirect khi chưa đăng nhập
- Logout functionality

### ✅ Dashboard
- Tổng quan thống kê thiết bị
- Biểu đồ theo danh mục
- Biểu đồ theo phòng ban
- Real-time data từ backend

### ✅ Quản lý thiết bị
- Danh sách thiết bị với pagination
- Tìm kiếm và filter
- CRUD operations (Create, Read, Update, Delete)
- Upload hình ảnh thiết bị

### ✅ Services Layer
- API service với authentication
- Device service
- Category service
- Department service
- Inspection service
- Statistics service

### ✅ Composables
- useAuth - Authentication logic
- useToast - Toast notifications
- useSidebar - Sidebar state management

### ✅ UI Components
- Toast notifications
- Loading states
- Error handling
- Responsive design
- Dark mode support

## API Integration

### Authentication

```typescript
import { useAuth } from '@/composables/useAuth'

const { login, logout, user, isAuthenticated } = useAuth()

// Login
await login('username', 'password')

// Logout
logout()

// Check auth status
if (isAuthenticated.value) {
  console.log('User:', user.value)
}
```

### Device Management

```typescript
import deviceService from '@/services/device.service'

// Get all devices
const response = await deviceService.getAll({
  search: 'keyword',
  status: 'active',
  page: 1,
  limit: 20
})

// Get device by ID
const device = await deviceService.getById(1)

// Create device
const newDevice = await deviceService.create({
  name: 'Device Name',
  code: 'DEV001',
  category_id: 1,
  department_id: 1,
  status: 'active'
})

// Update device
await deviceService.update(1, { status: 'maintenance' })

// Delete device
await deviceService.delete(1)

// Upload image
await deviceService.uploadImage(1, file)
```

### Toast Notifications

```typescript
import { useToast } from '@/composables/useToast'

const { success, error, warning, info } = useToast()

success('Thao tác thành công!')
error('Có lỗi xảy ra!')
warning('Cảnh báo!')
info('Thông tin')
```

## Các trang cần hoàn thiện thêm

### 1. Device Detail Page
- Xem chi tiết thiết bị
- Lịch sử kiểm tra
- Lịch sử sửa chữa
- QR code

### 2. Inspection Management
- Danh sách kiểm tra
- Tạo phiếu kiểm tra
- Cập nhật kết quả kiểm tra

### 3. Ticket Management
- Danh sách sự cố
- Tạo phiếu sự cố
- Theo dõi xử lý

### 4. Reports
- Báo cáo thiết bị
- Báo cáo kiểm tra
- Export Excel

### 5. Settings
- Quản lý danh mục
- Quản lý phòng ban
- Quản lý người dùng
- Cấu hình hệ thống

## Troubleshooting

### Lỗi kết nối API

Kiểm tra:
1. Backend đã chạy chưa? (http://localhost:3000)
2. VITE_API_URL trong .env đúng chưa?
3. CORS đã được cấu hình trong backend chưa?

### Lỗi authentication

1. Xóa token cũ: `localStorage.clear()`
2. Đăng nhập lại
3. Kiểm tra token expiry trong backend

### Lỗi build

```bash
# Clear cache và reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Tech Stack

- Vue 3 (Composition API)
- TypeScript
- Vue Router 4
- Tailwind CSS 4
- Vite
- ApexCharts (for charts)
- Lucide Icons

## Best Practices

1. Sử dụng TypeScript cho type safety
2. Tách logic ra composables
3. Sử dụng services cho API calls
4. Error handling ở mọi API call
5. Loading states cho UX tốt hơn
6. Responsive design cho mobile
7. Dark mode support

## Next Steps

1. Hoàn thiện các trang còn lại
2. Thêm unit tests
3. Thêm E2E tests
4. Optimize performance
5. Add PWA support
6. Add i18n (đa ngôn ngữ)
