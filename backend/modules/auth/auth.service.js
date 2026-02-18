const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../users/user.model');

const SALT_ROUNDS = 10;

async function login(username, password) {
  const user = UserModel.findByUsername(username);

  if (!user) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
  }

  if (!user.is_active) {
    throw new Error('Tài khoản đã bị vô hiệu hóa');
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return { 
    token, 
    user: { 
      id: user.id, 
      username: user.username, 
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    } 
  };
}

async function register(userData, createdBy = null) {
  const { username, full_name, email, password, role } = userData;

  // Kiểm tra trùng
  if (UserModel.isExists({ username, email })) {
    throw { status: 409, message: 'Username hoặc email đã tồn tại' };
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = UserModel.create({
    username,
    password_hash,
    email,
    full_name,
    role: role || 'user',
    created_by: createdBy
  });

  return { id: user.id };
}

module.exports = { login, register };
