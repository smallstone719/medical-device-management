// Validation dùng kiểm tra thủ công (không cần thư viện nặng như Joi/Zod)
// Có thể thay bằng Zod nếu dự án cần validation phức tạp hơn

const createUserSchema = {
  username: {
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Username chỉ chứa chữ, số, dấu gạch dưới (3-50 ký tự)',
  },
  full_name: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100,
    message: 'Họ tên phải từ 2 đến 100 ký tự',
  },
  email: {
    required: true,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email không hợp lệ',
  },
  password: {
    required: true,
    type: 'string',
    minLength: 6,
    maxLength: 100,
    message: 'Mật khẩu phải từ 6 ký tự trở lên',
  },
  role: {
    required: false,
    type: 'string',
    enum: ['admin', 'inspector', 'technician', 'viewer', 'user'],
    message: 'Role không hợp lệ',
  },
};

const updateUserSchema = {
  full_name: {
    required: false,
    type: 'string',
    minLength: 2,
    maxLength: 100,
    message: 'Họ tên phải từ 2 đến 100 ký tự',
  },
  email: {
    required: false,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email không hợp lệ',
  },
  role: {
    required: false,
    type: 'string',
    enum: ['admin', 'inspector', 'technician', 'viewer', 'user'],
    message: 'Role không hợp lệ',
  },
  is_active: {
    required: false,
    type: 'boolean',
    message: 'is_active phải là true hoặc false',
  },
};

const changePasswordSchema = {
  current_password: {
    required: true,
    type: 'string',
    message: 'Vui lòng nhập mật khẩu hiện tại',
  },
  new_password: {
    required: true,
    type: 'string',
    minLength: 6,
    message: 'Mật khẩu mới phải từ 6 ký tự trở lên',
  },
};

module.exports = { createUserSchema, updateUserSchema, changePasswordSchema };
