# Phân quyền hệ thống

## Các vai trò (Roles)

1. **admin** - Quản trị viên hệ thống
   - Toàn quyền truy cập và quản lý
   - Quản lý users, departments, categories
   - Xóa dữ liệu
   - Cấu hình hệ thống

2. **inspector** - Người kiểm tra
   - Xem và tạo thiết bị
   - Thực hiện kiểm tra (inspections)
   - Tạo và xem tickets
   - Xem báo cáo

3. **technician** - Kỹ thuật viên
   - Xem thiết bị và assets
   - Nhận và xử lý tickets
   - Thực hiện kiểm tra
   - Cập nhật trạng thái thiết bị

4. **viewer** - Người xem
   - Chỉ xem dữ liệu
   - Không được tạo, sửa, xóa
   - Xem báo cáo

5. **user** - Người dùng thông thường (deprecated, dùng inspector thay thế)

## Ma trận phân quyền

| Module | GET (List) | GET (Detail) | POST (Create) | PUT (Update) | DELETE |
|--------|-----------|--------------|---------------|--------------|--------|
| **Users** | admin, inspector | admin, inspector | admin | admin | admin |
| **Departments** | all authenticated | all authenticated | admin | admin | admin |
| **Devices** | all authenticated | all authenticated | admin, inspector | admin, inspector, technician | admin |
| **Assets** | all authenticated | all authenticated | admin, inspector | admin, inspector | admin |
| **Categories** | all authenticated | all authenticated | admin | admin | admin |
| **Inspections** | all authenticated | all authenticated | all authenticated | admin, inspector | admin |
| **Tickets** | all authenticated | all authenticated | all authenticated | admin, inspector, technician | admin |
| **Scheduled Reports** | admin | admin | admin | admin | admin |
| **Zalo Subscribers** | admin, inspector | admin, inspector | public (webhook) | admin | admin |

## Chi tiết phân quyền theo module

### Users
- GET /api/users - admin, inspector
- GET /api/users/:id - admin, inspector
- POST /api/users - admin
- PUT /api/users/:id - admin
- DELETE /api/users/:id - admin

### Departments
- GET /api/departments - all authenticated
- GET /api/departments/all - all authenticated (public for dropdown)
- GET /api/departments/:id - all authenticated
- POST /api/departments - admin
- PUT /api/departments/:id - admin
- DELETE /api/departments/:id - admin

### Devices
- GET /api/devices - all authenticated
- GET /api/devices/:id - all authenticated
- GET /api/devices/locations - all authenticated
- POST /api/devices - admin, inspector
- PUT /api/devices/:id - admin, inspector, technician
- DELETE /api/devices/:id - admin

### Assets
- GET /api/assets - all authenticated
- GET /api/assets/:id - all authenticated
- GET /api/assets/device/:deviceId - all authenticated
- POST /api/assets - admin, inspector
- PUT /api/assets/:id - admin, inspector
- DELETE /api/assets/:id - admin

### Categories
- GET /api/categories - all authenticated
- GET /api/categories/all - all authenticated (public for dropdown)
- GET /api/categories/:id - all authenticated
- POST /api/categories - admin
- PUT /api/categories/:id - admin
- DELETE /api/categories/:id - admin

### Inspections
- GET /api/inspections - all authenticated
- GET /api/inspections/:id - all authenticated
- GET /api/inspections/device/:deviceId/latest - all authenticated
- POST /api/inspections - all authenticated
- PUT /api/inspections/:id - admin, inspector
- DELETE /api/inspections/:id - admin

### Tickets
- GET /api/tickets - all authenticated
- GET /api/tickets/:id - all authenticated
- POST /api/tickets - all authenticated
- PUT /api/tickets/:id - admin, inspector, technician
- DELETE /api/tickets/:id - admin
- POST /api/tickets/:id/claim - technician, admin
- GET /api/tickets/:id/replies - all authenticated
- POST /api/tickets/:id/replies - all authenticated

### Scheduled Reports
- GET /api/scheduled-reports - admin
- GET /api/scheduled-reports/:id - admin
- POST /api/scheduled-reports - admin
- PUT /api/scheduled-reports/:id - admin
- DELETE /api/scheduled-reports/:id - admin
- POST /api/scheduled-reports/:id/toggle - admin
- POST /api/scheduled-reports/:id/test - admin

### Zalo Subscribers
- POST /api/zalo-subscribers/subscribe - public (webhook)
- GET /api/zalo-subscribers - admin, inspector
- GET /api/zalo-subscribers/chat-ids - admin, inspector
- GET /api/zalo-subscribers/:id - admin, inspector
- PUT /api/zalo-subscribers/:id - admin
- DELETE /api/zalo-subscribers/:id - admin
