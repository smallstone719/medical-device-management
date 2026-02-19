# Fix Safari & Mobile Browser Issues

## Vấn đề
- ✅ Chrome: Đăng nhập thành công
- ❌ Safari: Load failed
- ❌ Mobile browsers: Load failed

## Nguyên nhân

Safari và mobile browsers có chính sách bảo mật nghiêm ngặt hơn:
1. Yêu cầu `credentials: 'include'` trong fetch requests
2. Không chấp nhận CORS với `origin: '*'` khi dùng credentials
3. Yêu cầu HTTPS cho cross-origin requests với credentials

## Giải pháp đã implement

### 1. ✅ Cập nhật CORS config (backend/app.js)
- Cho phép dynamic origin thay vì wildcard
- Thêm credentials support
- Expose headers cần thiết

### 2. ✅ Cập nhật API service (frontend/src/services/api.ts)
- Thêm `credentials: 'include'` vào tất cả requests
- Thêm `mode: 'cors'` để explicit CORS

### 3. 🔧 Cấu hình Railway Environment Variables

Trên Railway Dashboard, set các biến sau:

#### Backend Service:
```env
# CORS - Allow your Railway frontend URL
CORS_ORIGIN=https://your-app.railway.app

# hoặc nhiều origins (phân cách bằng dấu phẩy)
CORS_ORIGIN=https://your-app.railway.app,https://custom-domain.com
```

#### Frontend Service (nếu deploy riêng):
```env
# API URL - Must use HTTPS
VITE_API_URL=https://your-backend.railway.app/api
```

## Nếu deploy cùng service (SPA + Backend)

Không cần set `VITE_API_URL` vì frontend và backend cùng domain.

Nhưng cần build lại frontend với đúng API URL:

### Option 1: Relative URL (Khuyến nghị)

Sửa `frontend/src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
```

Lợi ích:
- ✅ Không cần CORS
- ✅ Không cần set VITE_API_URL
- ✅ Hoạt động trên mọi domain

### Option 2: Absolute URL

Tạo `frontend/.env.production`:

```env
VITE_API_URL=https://your-app.railway.app/api
```

## Testing

### Test trên Safari Desktop
1. Mở Safari
2. Vào https://your-app.railway.app
3. Thử đăng nhập
4. Mở Console (Cmd+Option+C) để xem lỗi

### Test trên Mobile
1. Mở Safari/Chrome trên iPhone/Android
2. Vào https://your-app.railway.app
3. Thử đăng nhập

### Debug CORS issues

Kiểm tra response headers:

```bash
curl -I -X OPTIONS https://your-app.railway.app/api/auth/login \
  -H "Origin: https://your-app.railway.app" \
  -H "Access-Control-Request-Method: POST"
```

Phải thấy:
```
Access-Control-Allow-Origin: https://your-app.railway.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

## Common Issues

### Issue 1: Mixed Content (HTTP/HTTPS)
**Triệu chứng:** "Mixed content blocked"

**Giải pháp:**
- Đảm bảo cả frontend và backend đều dùng HTTPS
- Railway tự động cung cấp HTTPS

### Issue 2: CORS Preflight Failed
**Triệu chứng:** OPTIONS request failed

**Giải pháp:**
- Kiểm tra CORS config cho phép OPTIONS method
- Đảm bảo `credentials: true` trong CORS config

### Issue 3: Cookie not set
**Triệu chứng:** Token không được lưu

**Giải pháp:**
- App này dùng localStorage, không dùng cookies
- Kiểm tra localStorage có bị block không (Private browsing)

### Issue 4: Network Error
**Triệu chứng:** "Failed to fetch" hoặc "Network request failed"

**Giải pháp:**
- Kiểm tra API URL đúng chưa
- Kiểm tra backend có đang chạy không
- Kiểm tra firewall/network restrictions

## Checklist Deploy

- [ ] Backend CORS_ORIGIN đã set đúng domain
- [ ] Frontend API_URL dùng HTTPS (hoặc relative path)
- [ ] Build lại frontend sau khi thay đổi .env
- [ ] Test trên Chrome
- [ ] Test trên Safari
- [ ] Test trên Mobile (iOS Safari)
- [ ] Test trên Mobile (Android Chrome)

## Recommended: Sử dụng Relative URL

Để tránh CORS issues hoàn toàn, sử dụng relative URL:

**frontend/src/services/api.ts:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
```

**Lợi ích:**
- Frontend và backend cùng domain
- Không cần CORS
- Không cần set environment variables
- Hoạt động trên mọi browsers

**Deploy:**
1. Frontend build vào `frontend/dist`
2. Backend serve static files từ `frontend/dist`
3. Backend serve API tại `/api/*`
4. Tất cả requests đều cùng origin → No CORS issues!

## Verify Fix

Sau khi deploy, test:

```bash
# Test login API
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Should return token
```

Nếu thành công, Safari và mobile browsers sẽ hoạt động!
