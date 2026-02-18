const CategoryModel = require('./category.model');

class CategoryService {
  // ─── Lấy danh sách danh mục ──────────────────────────────────────────
  static getCategories(query) {
    const { rows, total } = CategoryModel.findAll(query);
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

  // ─── Lấy tất cả dùng cho dropdown ─────────────────────────────────────
  static getAllSimple() {
    return CategoryModel.findAllSimple();
  }

  // ─── Chi tiết danh mục ───────────────────────────────────────────────
  static getCategoryById(id) {
    const category = CategoryModel.findById(id);
    if (!category) throw { status: 404, message: 'Không tìm thấy danh mục' };
    return category;
  }

  // ─── Tạo danh mục mới ────────────────────────────────────────────────
  static createCategory({ name, description, color }, created_by = null) {
    // Kiểm tra name trùng
    if (CategoryModel.isNameExists(name)) {
      throw { status: 409, message: `Tên danh mục "${name}" đã tồn tại` };
    }

    return CategoryModel.create({ name, description, color, created_by });
  }

  // ─── Cập nhật danh mục ───────────────────────────────────────────────
  static updateCategory(id, payload, updated_by = null) {
    this.getCategoryById(id);

    // Kiểm tra name trùng (nếu có thay đổi)
    if (payload.name && CategoryModel.isNameExists(payload.name, id)) {
      throw { status: 409, message: `Tên danh mục "${payload.name}" đã tồn tại` };
    }

    return CategoryModel.update(id, { ...payload, updated_by });
  }

  // ─── Xóa danh mục ────────────────────────────────────────────────────
  static deleteCategory(id, deleted_by = null) {
    this.getCategoryById(id);

    // Không cho xóa nếu còn thiết bị sử dụng
    if (CategoryModel.hasDevices(id)) {
      throw { status: 400, message: 'Không thể xóa danh mục còn có thiết bị sử dụng' };
    }

    CategoryModel.softDelete(id, deleted_by);
  }
}

module.exports = CategoryService;
