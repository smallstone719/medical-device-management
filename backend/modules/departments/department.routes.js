const express    = require('express');
const router     = express.Router();
const DepartmentController = require('./department.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { validateBody }            = require('../../middlewares/validate.middleware');
const {
  createDepartmentSchema,
  updateDepartmentSchema,
  addMemberSchema,
} = require('./department.validator');

// Tất cả routes yêu cầu đăng nhập
router.use(authenticate);

// ─── Dropdown (không phân trang, dùng cho form select) ───────────────
// GET /api/departments/all?tree=true
router.get('/all', DepartmentController.getAllSimple);

// ─── Danh sách & Chi tiết ─────────────────────────────────────────────
// GET /api/departments?page=1&limit=20&search=&is_active=1
router.get('/',    DepartmentController.getDepartments);
router.get('/:id', DepartmentController.getDepartmentById);

// ─── Tạo mới (chỉ admin) ─────────────────────────────────────────────
router.post(
  '/',
  authorize('admin'),
  validateBody(createDepartmentSchema),
  DepartmentController.createDepartment
);

// ─── Cập nhật (chỉ admin) ─────────────────────────────────────────────
router.put(
  '/:id',
  authorize('admin'),
  validateBody(updateDepartmentSchema),
  DepartmentController.updateDepartment
);

// ─── Kích hoạt / Vô hiệu hóa ─────────────────────────────────────────
router.patch('/:id/toggle-active', authorize('admin'), DepartmentController.toggleActive);

// ─── Xóa ─────────────────────────────────────────────────────────────
router.delete('/:id', authorize('admin'), DepartmentController.deleteDepartment);

// ─── Quản lý thành viên ───────────────────────────────────────────────
// POST   /api/departments/:id/members
router.post(
  '/:id/members',
  authorize('admin'),
  validateBody(addMemberSchema),
  DepartmentController.addMember
);

// DELETE /api/departments/:id/members/:userId
router.delete(
  '/:id/members/:userId',
  authorize('admin'),
  DepartmentController.removeMember
);

module.exports = router;
