# API Services - Hướng dẫn sử dụng

## Cấu trúc Service

Mỗi service kế thừa từ `api.ts` và cung cấp các phương thức CRUD chuẩn.

## Cách sử dụng đúng

### ✅ ĐÚNG - Pass params trực tiếp

```typescript
class ExampleService {
  async getAll(filters?: any) {
    // Pass filters trực tiếp làm tham số thứ 2
    return api.get<Example[]>('/examples', filters)
  }
}
```

### ❌ SAI - Wrap params trong object

```typescript
class ExampleService {
  async getAll(filters?: any) {
    // SAI - Không wrap trong { params: ... }
    return api.get<Example[]>('/examples', { params: filters })
  }
}
```

## Lý do

Method `api.get()` có signature:
```typescript
get<T>(endpoint: string, params?: Record<string, any>): Promise<T>
```

Nó đã expect `params` là tham số thứ 2, không cần wrap thêm.

## Template Service chuẩn

```typescript
import api from './api'

export interface Example {
  id: number
  name: string
  // ... other fields
}

class ExampleService {
  // GET /api/examples?search=...&page=1&limit=20
  async getAll(filters?: any) {
    return api.get<Example[]>('/examples', filters)
  }

  // GET /api/examples/:id
  async getById(id: number) {
    return api.get<Example>(`/examples/${id}`)
  }

  // POST /api/examples
  async create(data: Partial<Example>) {
    return api.post<Example>('/examples', data)
  }

  // PUT /api/examples/:id
  async update(id: number, data: Partial<Example>) {
    return api.put<Example>(`/examples/${id}`, data)
  }

  // DELETE /api/examples/:id
  async delete(id: number) {
    return api.delete(`/examples/${id}`)
  }
}

export default new ExampleService()
```

## Các service đã được kiểm tra

- ✅ `auth.service.ts` - OK (không có getAll)
- ✅ `category.service.ts` - Fixed
- ✅ `department.service.ts` - Fixed
- ✅ `device.service.ts` - OK (đã đúng từ đầu)
- ✅ `inspection.service.ts` - OK (đã đúng từ đầu)
- ✅ `statistics.service.ts` - OK (đã đúng từ đầu)

## Debug

Nếu backend nhận được `{ params: '[object Object]' }` thay vì query params riêng lẻ, nghĩa là bạn đang wrap sai.

### Kiểm tra backend log:
```javascript
// Backend controller
console.log('Query params:', req.query)
// Đúng: { search: 'test', page: 1, limit: 20 }
// Sai: { params: '[object Object]' }
```

### Kiểm tra frontend log:
```typescript
// Frontend service
console.log('Filters:', filters)
const response = await api.get('/endpoint', filters) // Đúng
const response = await api.get('/endpoint', { params: filters }) // Sai
```
