# 🚀 Hướng dẫn Deploy lên CloudPanel với PM2

## Tổng quan

Hướng dẫn này giúp bạn deploy ứng dụng **VICAS Device Management** lên server CloudPanel sử dụng PM2 làm process manager.

---

## 📋 Yêu cầu

- CloudPanel đã cài đặt trên server
- Node.js >= 20.0.0 (sử dụng NVM trên CloudPanel)
- Đã tạo site trên CloudPanel (ví dụ: `www.domain.com`)

---

## 📦 Bước 1: Chuẩn bị file deploy

Trên máy local, nén project (không bao gồm `node_modules`, `.git`, `dist-electron`):

### Windows (PowerShell):

```powershell
# Tạo file zip để upload
Compress-Archive -Path .\server.js, .\package.json, .\package-lock.json, .\ecosystem.config.js, .\seed-data.js, .\zalobot.js, .\public -DestinationPath .\deploy.zip -Force
```

### Hoặc dùng Git (khuyến nghị):

```bash
# Clone trực tiếp trên server
git clone <repo-url> .
```

---

## 🖥️ Bước 2: SSH vào server với Site User

```bash
ssh <site-user>@<instance-ip-address>
```

> ⚠️ **Quan trọng**: Đăng nhập bằng **Site User** (không phải root), vì PM2 cần chạy dưới user này.

---

## 📁 Bước 3: Đưa code lên server

```bash
# Di chuyển vào thư mục root của site
cd htdocs/www.domain.com/

# Nếu dùng Git:
git clone <repo-url> .

# Hoặc upload file deploy.zip rồi giải nén:
unzip deploy.zip
```

---

## 📥 Bước 4: Cài đặt dependencies

```bash
cd htdocs/www.domain.com/

# Cài đặt dependencies production only
npm ci --production
```

> Nếu gặp lỗi với `better-sqlite3` hoặc `sharp`, bạn có thể cần cài build tools:
>
> ```bash
> # Nếu cần (hỏi admin/root cài):
> sudo apt-get install build-essential python3
> ```

---

## ⚙️ Bước 5: Cài đặt PM2

```bash
npm install pm2@latest -g
```

---

## ▶️ Bước 6: Khởi động ứng dụng với PM2

```bash
cd htdocs/www.domain.com/

# Cách 1: Sử dụng ecosystem.config.js (khuyến nghị)
pm2 start ecosystem.config.js

# Cách 2: Start trực tiếp
pm2 start npm --name vicas-device-management -- start
```

Kiểm tra ứng dụng đang chạy:

```bash
pm2 status
```

Bạn sẽ thấy output tương tự:

```
┌─────────────────────────────┬────┬─────────┬──────┬───────┬────────┬─────────┬────────┐
│ App name                    │ id │ mode    │ pid  │ status│ restart│ uptime  │ memory │
├─────────────────────────────┼────┼─────────┼──────┼───────┼────────┼─────────┼────────┤
│ vicas-device-management     │ 0  │ fork    │ 1234 │ online│ 0      │ 0s      │ 45.0mb │
└─────────────────────────────┴────┴─────────┴──────┴───────┴────────┴─────────┴────────┘
```

**Status phải là `online`** ✅

---

## 💾 Bước 7: Lưu cấu hình PM2

```bash
pm2 save
```

---

## ⏰ Bước 8: Cấu hình Cron Job (tự động restart sau reboot)

### 8.1. Copy PATH hiện tại:

```bash
echo $PATH
```

Output sẽ giống như:

```
/home/site-user/.nvm/versions/node/v20.x.x/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

### 8.2. Mở crontab:

```bash
crontab -e
```

### 8.3. Thêm 2 dòng sau vào cuối file:

```cron
PATH=/home/site-user/.nvm/versions/node/v20.x.x/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
@reboot pm2 resurrect &> /dev/null
```

> ⚠️ Thay thế `/home/site-user/.nvm/versions/node/v20.x.x/bin:...` bằng output thực tế từ lệnh `echo $PATH`

### 8.4. Lưu và thoát:

- Nếu dùng nano: `Ctrl + X` → `Y` → `Enter`
- Nếu dùng vi: `:wq` → `Enter`

---

## 🌐 Bước 9: Cấu hình Reverse Proxy trên CloudPanel

Trên giao diện **CloudPanel**, vào site của bạn:

1. Vào **Settings** → **Vhost**
2. Chỉnh sửa cấu hình Nginx để proxy đến ứng dụng Node.js:

```nginx
server {
    listen 80;
    listen [::]:80;
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name www.domain.com;

    # SSL certificates (CloudPanel tự quản lý)
    {{ssl_certificate_key}}
    {{ssl_certificate}}

    # Proxy đến ứng dụng Node.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Upload files
    client_max_body_size 10M;
}
```

> **Lưu ý**: CloudPanel có thể sử dụng template Vhost riêng. Hãy kiểm tra và chỉnh sửa phù hợp. Đặc biệt phần `{{ssl_certificate_key}}` và `{{ssl_certificate}}` là biến của CloudPanel.

---

## ✅ Bước 10: Kiểm tra và xác nhận

### 10.1. Kiểm tra PM2:

```bash
pm2 status
```

### 10.2. Kiểm tra logs:

```bash
pm2 logs vicas-device-management
```

### 10.3. Kiểm tra website:

Mở trình duyệt và truy cập `https://www.domain.com`

### 10.4. Reboot server và kiểm tra lại:

```bash
# Sau khi reboot
pm2 status
```

Status phải là `online`.

---

## 🔧 Các lệnh PM2 hữu ích

| Lệnh                                  | Mô tả                          |
| ------------------------------------- | ------------------------------ |
| `pm2 status`                          | Xem trạng thái ứng dụng        |
| `pm2 logs`                            | Xem logs realtime              |
| `pm2 logs --lines 100`                | Xem 100 dòng log gần nhất      |
| `pm2 restart vicas-device-management` | Restart ứng dụng               |
| `pm2 stop vicas-device-management`    | Dừng ứng dụng                  |
| `pm2 delete vicas-device-management`  | Xóa ứng dụng khỏi PM2          |
| `pm2 monit`                           | Monitor realtime (CPU, Memory) |
| `pm2 reload vicas-device-management`  | Reload không downtime          |
| `pm2 save`                            | Lưu cấu hình hiện tại          |

---

## 🔄 Cập nhật code

Khi cần update code mới:

```bash
cd htdocs/www.domain.com/

# Pull code mới (nếu dùng Git)
git pull

# Cài lại dependencies (nếu có thay đổi)
npm ci --production

# Restart ứng dụng
pm2 restart vicas-device-management

# Hoặc reload (không downtime)
pm2 reload vicas-device-management
```

---

## 🐛 Troubleshooting

### Ứng dụng không start được:

```bash
# Xem logs chi tiết
pm2 logs vicas-device-management --lines 200

# Hoặc chạy trực tiếp để debug
node server.js
```

### Port đã bị chiếm:

```bash
# Kiểm tra port 3000
lsof -i :3000

# Đổi port trong ecosystem.config.js hoặc dùng biến môi trường
PORT=3001 pm2 start ecosystem.config.js
```

### Lỗi với better-sqlite3:

```bash
# Rebuild native modules
npm rebuild better-sqlite3
```

### Lỗi với sharp:

```bash
# Rebuild sharp
npm rebuild sharp
```

### PM2 không tự start sau reboot:

```bash
# Kiểm tra crontab
crontab -l

# Đảm bảo PATH đúng và pm2 resurrect được cấu hình
echo $PATH
which pm2
```

---

## 📝 Lưu ý quan trọng

1. **Domain URL**: Sau khi deploy, vào **Settings** (Cài đặt) trong ứng dụng để cập nhật Domain URL thành domain thực tế (ví dụ: `https://www.domain.com`) để QR Code và Zalo Bot hoạt động đúng.

2. **Data directory**: Database SQLite và uploads được lưu trong thư mục `data/` bên trong project. **Hãy backup thường xuyên**.

3. **Tunnel/Nport**: Trên production với domain riêng, bạn không cần tunnel nport. Hãy chọn **"Tên miền tùy chọn"** trong setup và nhập domain thực tế.

4. **HTTPS**: CloudPanel hỗ trợ Let's Encrypt SSL tự động. Hãy bật SSL cho site của bạn.

5. **Firewall**: Đảm bảo port 80 và 443 được mở trên firewall server.
