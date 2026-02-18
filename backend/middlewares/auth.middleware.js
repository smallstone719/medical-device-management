const jwt = require('jsonwebtoken');
const db = require('../database/db');

/**
 * Xác thực JWT token từ header Authorization
 * Gắn req.user = { id, username, role } nếu hợp lệ
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra user vẫn còn tồn tại và active trong DB
    const user = db.prepare('SELECT id, username, role, is_active FROM users WHERE id = ? AND deleted_at IS NULL').get(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị vô hiệu hóa' });
    }

    req.user = user;
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Phiên đăng nhập đã hết hạn' : 'Token không hợp lệ';
    return res.status(401).json({ success: false, message });
  }
};

/**
 * Phân quyền theo role
 * Dùng sau authenticate
 * 
 * @example router.get('/', authorize('admin'), handler)
 * @example router.get('/', authorize('admin', 'user'), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện thao tác này',
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
