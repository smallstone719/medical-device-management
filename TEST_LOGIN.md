# Test Login Flow

## ✅ Đã sửa

1. **Auth Service** - Cập nhật để xử lý đúng response structure từ backend
   - Backend trả về: `{ success, message, data: { token, user } }`
   - Service giờ parse đúng `response.data.token` và `response.data.user`

2. **useAuth Composable** - Loại bỏ router dependency
   - Router được xử lý trong component thay vì composable
   - Tránh circular dependency issues

3. **Router Guards** - Thêm console.log để debug
   - Log authentication status
   - Log navigation decisions

4. **Signin Component** - Thêm delay trước khi redirect
   - Cho phép toast message hiển thị
   - Đảm bảo token được lưu vào localStorage

## 🧪 Test Steps

### 1. Mở Browser Console
```
http://localhost:5173/signin
```

### 2. Nhập thông tin đăng nhập
```
Username: admin
Password: admin123
```

### 3. Kiểm tra Console Logs

Bạn sẽ thấy:
```
Attempting login...
Router guard: { to: '/signin', from: '/', isAuthenticated: false, ... }
Login successful: { token: '...', user: {...} }
Redirecting to dashboard...
Router guard: { to: '/', from: '/signin', isAuthenticated: true, ... }
Allowing navigation
```

### 4. Kiểm tra LocalStorage

Mở DevTools > Application > Local Storage > http://localhost:5173

Bạn sẽ thấy:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
user: {"id":5,"username":"admin","full_name":"Administrator",...}
```

### 5. Kiểm tra Dashboard

Sau khi redirect, bạn sẽ thấy:
- Dashboard page với thống kê
- Sidebar với menu
- Header với user info

## 🐛 Nếu vẫn không redirect

### Kiểm tra 1: Backend Response
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq .
```

Expected:
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "...",
    "user": {...}
  }
}
```

### Kiểm tra 2: CORS
```bash
# Check backend .env
cat backend/.env | grep CORS
```

Should be:
```
CORS_ORIGIN=http://localhost:5173
```

Or:
```
CORS_ORIGIN=*
```

### Kiểm tra 3: Frontend API URL
```bash
# Check frontend .env
cat frontend/.env
```

Should be:
```
VITE_API_URL=http://localhost:3000/api
```

### Kiểm tra 4: Browser Console Errors

Mở DevTools > Console và xem có lỗi:
- CORS errors?
- Network errors?
- JavaScript errors?

### Kiểm tra 5: Network Tab

Mở DevTools > Network:
1. Click "Đăng nhập"
2. Xem request đến `/api/auth/login`
3. Check:
   - Status: 200 OK
   - Response: có `token` và `user`
   - Headers: có `Authorization` header

## 🔧 Manual Test

### Test trong Browser Console

```javascript
// 1. Test login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
})
const data = await response.json()
console.log(data)

// 2. Save token
localStorage.setItem('token', data.data.token)
localStorage.setItem('user', JSON.stringify(data.data.user))

// 3. Test authenticated request
const statsResponse = await fetch('http://localhost:3000/api/statistics', {
  headers: { 'Authorization': `Bearer ${data.data.token}` }
})
const stats = await statsResponse.json()
console.log(stats)

// 4. Reload page
location.reload()
```

## ✅ Expected Behavior

1. **Trước khi login**: 
   - Truy cập `/` → redirect to `/signin`
   - localStorage không có token

2. **Sau khi login**:
   - Toast "Đăng nhập thành công!" hiển thị
   - Redirect to `/` (Dashboard)
   - localStorage có token và user
   - Dashboard load statistics từ API

3. **Sau khi reload**:
   - Vẫn ở Dashboard (không redirect to signin)
   - Token vẫn còn trong localStorage
   - API calls có Authorization header

4. **Sau khi logout**:
   - localStorage bị xóa
   - Redirect to `/signin`
   - Không thể access protected routes

## 📝 Notes

- Token có thời hạn 7 ngày (backend config)
- Sau khi token hết hạn, cần login lại
- Router guard check token trong localStorage
- Mỗi API call tự động thêm Authorization header nếu có token
