# Sidebar Menu - Medical Device Management System

## ✅ Menu đã được cập nhật

Sidebar menu giờ đã được tùy chỉnh cho hệ thống quản lý thiết bị y tế với 4 nhóm chính:

### 1. TỔNG QUAN
- **Dashboard** (`/`) - Trang tổng quan với thống kê

### 2. QUẢN LÝ THIẾT BỊ
- **Thiết bị** (`/devices`) - Danh sách và quản lý thiết bị y tế
- **Danh mục** (`/categories`) - Quản lý danh mục thiết bị
- **Phòng ban** (`/departments`) - Quản lý phòng ban

### 3. KIỂM TRA & SỰ CỐ
- **Kiểm tra định kỳ** (`/inspections`) - Quản lý phiếu kiểm tra
- **Phiếu sự cố** (`/tickets`) - Quản lý sự cố và bảo trì

### 4. BÁO CÁO & CÀI ĐẶT
- **Báo cáo** (submenu)
  - Báo cáo thiết bị (`/reports/devices`)
  - Báo cáo kiểm tra (`/reports/inspections`)
  - Báo cáo sự cố (`/reports/tickets`)
- **Thống kê** (`/statistics`) - Thống kê chi tiết
- **Cài đặt** (submenu)
  - Quản lý người dùng (`/settings/users`)
  - Cấu hình hệ thống (`/settings/system`)
  - Hồ sơ cá nhân (`/profile`)

## 🎨 Icons mới

Đã tạo 6 icons mới cho hệ thống:

1. **DeviceIcon** - Icon thiết bị (smartphone/tablet)
2. **CategoryIcon** - Icon danh mục (grid 4 ô)
3. **DepartmentIcon** - Icon phòng ban (building/home)
4. **InspectionIcon** - Icon kiểm tra (clipboard)
5. **TicketIcon** - Icon sự cố (alert circle)
6. **ReportIcon** - Icon báo cáo (document)

## 📁 Files đã tạo/cập nhật

### Icons mới:
```
frontend/src/icons/
├── DeviceIcon.vue
├── CategoryIcon.vue
├── DepartmentIcon.vue
├── InspectionIcon.vue
├── TicketIcon.vue
├── ReportIcon.vue
└── index.ts (updated)
```

### Components cập nhật:
```
frontend/src/components/layout/
└── AppSidebar.vue (updated)
```

## 🚀 Tính năng

### Responsive
- Desktop: Sidebar có thể expand/collapse
- Mobile: Sidebar dạng drawer
- Hover: Tự động expand khi hover (nếu đang collapsed)

### Active State
- Highlight menu item đang active
- Tự động mở submenu nếu route con đang active
- Smooth transitions

### Submenu
- Click để toggle submenu
- Smooth expand/collapse animation
- Nested items với indent

## 📝 Các trang cần tạo

### Đã có ✅
- `/` - Dashboard
- `/devices` - Device List

### Cần tạo 🚧

#### Quản lý thiết bị
- `/categories` - Category List & Management
- `/departments` - Department List & Management

#### Kiểm tra & Sự cố
- `/inspections` - Inspection List
- `/inspections/create` - Create Inspection
- `/inspections/:id` - Inspection Detail
- `/tickets` - Ticket List
- `/tickets/create` - Create Ticket
- `/tickets/:id` - Ticket Detail

#### Báo cáo
- `/reports/devices` - Device Reports
- `/reports/inspections` - Inspection Reports
- `/reports/tickets` - Ticket Reports
- `/statistics` - Detailed Statistics

#### Cài đặt
- `/settings/users` - User Management
- `/settings/system` - System Configuration
- `/profile` - User Profile

## 🎯 Next Steps

### 1. Tạo các trang còn lại

Ưu tiên:
1. Categories & Departments (CRUD đơn giản)
2. Inspections (quan trọng)
3. Tickets (quan trọng)
4. Reports (export Excel)
5. Settings (admin only)

### 2. Cấu trúc file cho mỗi module

```
frontend/src/views/
├── Categories/
│   ├── CategoryList.vue
│   └── CategoryForm.vue (modal)
├── Departments/
│   ├── DepartmentList.vue
│   └── DepartmentForm.vue (modal)
├── Inspections/
│   ├── InspectionList.vue
│   ├── InspectionCreate.vue
│   └── InspectionDetail.vue
├── Tickets/
│   ├── TicketList.vue
│   ├── TicketCreate.vue
│   └── TicketDetail.vue
├── Reports/
│   ├── DeviceReport.vue
│   ├── InspectionReport.vue
│   └── TicketReport.vue
└── Settings/
    ├── UserManagement.vue
    └── SystemConfig.vue
```

### 3. Services cần tạo

```typescript
// frontend/src/services/
- ticket.service.ts (đã có inspection.service.ts làm mẫu)
- user.service.ts
- report.service.ts
- config.service.ts
```

### 4. Router cần cập nhật

Thêm routes mới vào `frontend/src/router/index.ts`:

```typescript
{
  path: '/categories',
  name: 'Categories',
  component: () => import('../views/Categories/CategoryList.vue'),
  meta: { title: 'Danh mục', requiresAuth: true }
},
// ... và các routes khác
```

## 💡 Tips

### Tái sử dụng components
- DeviceList.vue có thể làm template cho CategoryList, DepartmentList
- Tạo shared components:
  - `DataTable.vue` - Reusable table
  - `FilterBar.vue` - Reusable filter
  - `FormModal.vue` - Reusable modal
  - `ConfirmDialog.vue` - Confirm delete

### Patterns
- Tất cả list pages: filter + pagination + CRUD
- Tất cả form pages: validation + loading states + error handling
- Tất cả detail pages: tabs + actions + history

### API Integration
- Sử dụng services đã có làm mẫu
- Consistent error handling
- Loading states
- Toast notifications

## 🎉 Kết luận

Sidebar menu đã được cập nhật hoàn chỉnh với:
- ✅ 4 nhóm menu phù hợp với hệ thống
- ✅ 6 icons mới
- ✅ Cấu trúc rõ ràng, dễ mở rộng
- ✅ Responsive và user-friendly

Bạn có thể bắt đầu tạo các trang còn lại theo cấu trúc đã định nghĩa!
