const service = require('./auth.service');
const { success, error } = require('../../utils/response');

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const result = await service.login(username, password);
    return res.json(success(result, 'Đăng nhập thành công'));
  } catch (err) {
    return res.status(401).json(error(err.message));
  }
}

async function register(req, res) {
  try {
    // Nếu có user đang đăng nhập (admin tạo user mới), lưu created_by
    const createdBy = req.user ? req.user.id : null;
    const result = await service.register(req.body, createdBy);
    return res.status(201).json(success(result, 'Đăng ký thành công'));
  } catch (err) {
    return res.status(400).json(error(err.message));
  }
}

module.exports = { login, register };
