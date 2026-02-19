const DepartmentService = require('./department.service');
const { success, paginated } = require('../../utils/response');

class DepartmentController {
  // GET /api/departments
  static async getDepartments(req, res, next) {
    try {
      console.log('Department query params:', req.query);
      const result = DepartmentService.getDepartments(req.query);
      console.log('Department result:', { total: result.pagination.total, count: result.data.length });
      res.json(paginated(result.data, result.pagination));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/departments/all  — dùng cho dropdown/select
  static async getAllSimple(req, res, next) {
    try {
      const asTree = req.query.tree === 'true';
      const data   = DepartmentService.getAllSimple(asTree);
      res.json(success(data));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/departments/:id
  static async getDepartmentById(req, res, next) {
    try {
      const dept = DepartmentService.getDepartmentById(req.params.id);
      res.json(success(dept));
    } catch (err) {
      next(err);
    }
  }

  // POST /api/departments
  static async createDepartment(req, res, next) {
    try {
      const created_by = req.user?.id;
      const dept = DepartmentService.createDepartment(req.body, created_by);
      res.status(201).json(success(dept, 'Tạo phòng ban thành công'));
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/departments/:id
  static async updateDepartment(req, res, next) {
    try {
      const updated_by = req.user?.id;
      const dept = DepartmentService.updateDepartment(req.params.id, req.body, updated_by);
      res.json(success(dept, 'Cập nhật phòng ban thành công'));
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/departments/:id
  static async deleteDepartment(req, res, next) {
    try {
      const deleted_by = req.user?.id;
      DepartmentService.deleteDepartment(req.params.id, deleted_by);
      res.json(success(null, 'Xóa phòng ban thành công'));
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/departments/:id/toggle-active
  static async toggleActive(req, res, next) {
    try {
      const updated_by = req.user?.id;
      const dept = DepartmentService.toggleActive(req.params.id, updated_by);
      const msg  = dept.is_active ? 'Đã kích hoạt phòng ban' : 'Đã vô hiệu hóa phòng ban';
      res.json(success(dept, msg));
    } catch (err) {
      next(err);
    }
  }

  // POST /api/departments/:id/members  — thêm thành viên
  static async addMember(req, res, next) {
    try {
      const { user_id, is_primary } = req.body;
      const dept = DepartmentService.addMember(req.params.id, user_id, is_primary);
      res.status(201).json(success(dept, 'Thêm thành viên thành công'));
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/departments/:id/members/:userId  — xóa thành viên
  static async removeMember(req, res, next) {
    try {
      DepartmentService.removeMember(req.params.id, req.params.userId);
      res.json(success(null, 'Xóa thành viên khỏi phòng ban thành công'));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DepartmentController;
