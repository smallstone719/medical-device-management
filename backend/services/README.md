# Backend Services

Thư mục này chứa các service modules độc lập cho backend.

## Files

### zalobot.service.js
Service tích hợp Zalo Bot để gửi thông báo tự động.

**Chức năng:**
- Gửi thông báo kiểm tra thiết bị qua Zalo
- Quản lý subscribers (lưu trong database)
- Xử lý webhook và polling từ Zalo Bot API
- Hỗ trợ gửi text và images

**Sử dụng:**
```javascript
const ZaloBot = require('./backend/services/zalobot.service');

// Initialize with database
ZaloBot.init(db);

// Send notification
await ZaloBot.sendInspectionNotification(inspection, device);

// Test connection
const botInfo = await ZaloBot.testConnection();

// Manage subscribers
ZaloBot.addNotificationChatId(chatId, displayName);
ZaloBot.removeNotificationChatId(chatId);
const subscribers = ZaloBot.getNotificationChatIds();
```

**API Methods:**
- `init(db)` - Khởi tạo với database connection
- `sendMessage(chatId, text)` - Gửi tin nhắn text
- `sendInspectionNotification(inspection, device)` - Gửi thông báo kiểm tra
- `testConnection()` - Kiểm tra kết nối bot
- `addNotificationChatId(chatId, displayName)` - Thêm subscriber
- `removeNotificationChatId(chatId)` - Xóa subscriber
- `getNotificationChatIds()` - Lấy danh sách subscribers
- `handleWebhook(body)` - Xử lý webhook
- `startPolling(intervalMs)` - Bắt đầu polling
- `stopPolling()` - Dừng polling
- `setToken(token)` - Cập nhật token
- `disconnect()` - Ngắt kết nối bot

**Dependencies:**
- axios - HTTP client
- better-sqlite3 - Database

**Database Tables:**
- `system_config` - Lưu zalo_token
- `zalo_subscribers` - Lưu danh sách subscribers (deprecated, giờ dùng users.zalo_user_id)
- `users` - Lưu zalo_user_id cho từng user

**Environment:**
Token được lưu trong database (`system_config.zalo_token`), không dùng env vars.

## Lưu ý

- Service này được khởi tạo trong `server.js`
- Thông báo chỉ gửi đến admins và inspectors/technicians cùng department
- Images được gửi kèm nếu có trong inspection
