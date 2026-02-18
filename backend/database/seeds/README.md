# Database Seeding

Thư mục này chứa file seed để tạo dữ liệu mẫu cho database.

## File

- `seed.js` - File seed duy nhất, chứa tất cả logic tạo dữ liệu

## Cách sử dụng

### 1. Seed tự động (khi chạy migrations)

File `seed.js` sẽ được gọi tự động khi bạn chạy migrations:

```bash
npm run migrate
```

### 2. Seed thủ công

Chạy script seed riêng:

```bash
node backend/scripts/seed.js
```

## Dữ liệu được tạo

### Users
- Admin: `admin` / `admin123` (Administrator)
- Demo: `demo` / `demo` (Inspector)
- Tech: `tech` / `123456` (Technician)
- Viewer: `viewer` / `123456` (Viewer)

### Departments (5 khoa phòng y tế)
- Chẩn đoán hình ảnh
- Hồi sức tích cực
- Cấp cứu
- Phòng mổ
- X-quang Nha

### Device Categories (5 loại)
- X-quang
- CT Scanner
- MRI
- Siêu âm
- Nội soi

### Devices (10 thiết bị y tế)
- Máy X-quang DR, CT Scanner, MRI, Siêu âm, C-Arm, Nội soi, v.v.

### Inspections
- Lịch sử kiểm tra 30 ngày gần nhất (3-8 lần/ngày)
- Trạng thái: good, issue, critical

### Tickets (10 sự cố mẫu)
- Các sự cố với priority và status khác nhau

## Lưu ý

- File seed sẽ XÓA dữ liệu demo cũ trước khi tạo mới
- Passwords được hash bằng bcrypt
- Database path: `backend/database/data/app.db`
- Seed function là async (sử dụng await cho bcrypt)
