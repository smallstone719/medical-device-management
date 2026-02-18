const express = require('express');
const router = express.Router();
const controller = require('./auth.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { loginLimiter } = require('../../middlewares/rate-limit.middleware');

// Apply rate limiting to login endpoint
router.post('/login', loginLimiter, controller.login);

// Register có thể dùng với hoặc không có auth
// Nếu có auth (admin), sẽ lưu created_by
router.post('/register', (req, res, next) => {
  // Try to authenticate, but don't fail if no token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
}, controller.register);

module.exports = router;
