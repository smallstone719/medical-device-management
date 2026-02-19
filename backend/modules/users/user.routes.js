const express = require('express');
const router = express.Router();
const UserController = require('./user.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { validateBody } = require('../../middlewares/validate.middleware');
const upload = require('../../config/multer');
const {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
} = require('./user.validator');

// Tất cả routes yêu cầu đăng nhập
router.use(authenticate);

// ─── Danh sách & Chi tiết ─────────────────────────────────────────────
router.get('/',    authorize('admin', 'inspector'),  UserController.getUsers);
router.get('/:id', authorize('admin', 'inspector'),  UserController.getUserById);

// ─── Tạo mới (chỉ admin) ─────────────────────────────────────────────
router.post('/',
  authorize('admin'),
  validateBody(createUserSchema),
  UserController.createUser
);

// ─── Cập nhật thông tin ───────────────────────────────────────────────
router.put('/:id',
  authorize('admin'),
  validateBody(updateUserSchema),
  UserController.updateUser
);

// ─── Đổi mật khẩu (user tự đổi hoặc admin) ──────────────────────────
router.patch('/:id/password',
  authorize('admin', 'inspector', 'technician', 'viewer', 'user'),
  validateBody(changePasswordSchema),
  UserController.changePassword
);

// ─── Cập nhật avatar ─────────────────────────────────────────────────
router.patch('/:id/avatar',
  authorize('admin', 'inspector', 'technician', 'viewer', 'user'),
  upload.single('avatar'),
  UserController.updateAvatar
);

// ─── Kích hoạt / Vô hiệu hóa (chỉ admin) ────────────────────────────
router.patch('/:id/toggle-active', authorize('admin'), UserController.toggleActive);

// ─── Xóa (chỉ admin) ─────────────────────────────────────────────────
router.delete('/:id', authorize('admin'), UserController.deleteUser);

module.exports = router;
