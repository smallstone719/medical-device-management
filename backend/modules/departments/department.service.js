const DepartmentModel = require('./department.model');
const UserModel       = require('../users/user.model');

class DepartmentService {
  // ─── Lấy danh sách phòng ban ──────────────────────────────────────────
  static getDepartments(query) {
    const { rows, total } = DepartmentModel.findAll(query);
    const { page = 1, limit = 20 } = query;

    return {
      data: rows,
      pagination: {
        page:       Number(page),
        limit:      Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Lấy tất cả (dạng cây hoặc phẳng) dùng cho dropdown ─────────────
  static getAllSimple(asTree = false) {
    const list = DepartmentModel.findAllSimple();
    return asTree ? this._buildTree(list) : list;
  }

  // ─── Chi tiết phòng ban ───────────────────────────────────────────────
  static getDepartmentById(id) {
    const dept = DepartmentModel.findById(id);
    if (!dept) throw { status: 404, message: 'Không tìm thấy phòng ban' };
    return dept;
  }

  // ─── Tạo phòng ban mới ────────────────────────────────────────────────
  static createDepartment({ code, name, description, manager_id, parent_id }, created_by = null) {
    // Kiểm tra code trùng
    if (DepartmentModel.isCodeExists(code)) {
      throw { status: 409, message: `Mã phòng ban "${code}" đã tồn tại` };
    }

    // Kiểm tra manager tồn tại
    if (manager_id) {
      const manager = UserModel.findById(manager_id);
      if (!manager) throw { status: 404, message: 'Không tìm thấy người quản lý' };
    }

    // Kiểm tra parent tồn tại
    if (parent_id) {
      const parent = DepartmentModel.findById(parent_id);
      if (!parent) throw { status: 404, message: 'Không tìm thấy phòng ban cha' };
    }

    return DepartmentModel.create({ code, name, description, manager_id, parent_id, created_by });
  }

  // ─── Cập nhật phòng ban ───────────────────────────────────────────────
  static updateDepartment(id, payload, updated_by = null) {
    this.getDepartmentById(id);

    // Kiểm tra không tự đặt chính nó làm cha
    if (payload.parent_id && Number(payload.parent_id) === Number(id)) {
      throw { status: 400, message: 'Phòng ban không thể là cha của chính nó' };
    }

    // Kiểm tra manager tồn tại
    if (payload.manager_id) {
      const manager = UserModel.findById(payload.manager_id);
      if (!manager) throw { status: 404, message: 'Không tìm thấy người quản lý' };
    }

    return DepartmentModel.update(id, { ...payload, updated_by });
  }

  // ─── Xóa phòng ban ────────────────────────────────────────────────────
  static deleteDepartment(id, deleted_by = null) {
    this.getDepartmentById(id);

    // Không cho xóa nếu còn phòng ban con
    if (DepartmentModel.hasChildren(id)) {
      throw { status: 400, message: 'Không thể xóa phòng ban còn có phòng ban con' };
    }

    DepartmentModel.softDelete(id, deleted_by);
  }

  // ─── Kích hoạt / Vô hiệu hóa ─────────────────────────────────────────
  static toggleActive(id, updated_by = null) {
    const dept = this.getDepartmentById(id);
    return DepartmentModel.update(id, { is_active: !dept.is_active, updated_by });
  }

  // ─── Thêm thành viên ─────────────────────────────────────────────────
  static addMember(department_id, user_id, is_primary = false) {
    this.getDepartmentById(department_id);

    const user = UserModel.findById(user_id);
    if (!user) throw { status: 404, message: 'Không tìm thấy người dùng' };

    // Nếu set là phòng ban chính, bỏ flag is_primary ở các phòng ban khác của user
    if (is_primary) {
      const db = require('../../database/db');
      db.prepare(
        'UPDATE user_departments SET is_primary = 0 WHERE user_id = ?'
      ).run(user_id);
    }

    DepartmentModel.addMember(department_id, user_id, is_primary);
    return this.getDepartmentById(department_id);
  }

  // ─── Xóa thành viên ──────────────────────────────────────────────────
  static removeMember(department_id, user_id) {
    this.getDepartmentById(department_id);
    DepartmentModel.removeMember(department_id, user_id);
  }

  // ─── Lấy phòng ban của user ───────────────────────────────────────────
  static getDepartmentsByUser(user_id) {
    return DepartmentModel.findByUserId(user_id);
  }

  // ─── Helper: Chuyển list phẳng thành cây ─────────────────────────────
  static _buildTree(list, parentId = null) {
    return list
      .filter((d) => d.parent_id === parentId)
      .map((d) => ({
        ...d,
        children: this._buildTree(list, d.id),
      }));
  }
}

module.exports = DepartmentService;
