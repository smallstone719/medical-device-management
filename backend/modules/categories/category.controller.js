const CategoryService = require('./category.service');
const { success, paginated } = require('../../utils/response');

class CategoryController {
  // GET /api/categories
  static async getCategories(req, res, next) {
    try {
      const result = CategoryService.getCategories(req.query);
      res.json(paginated(result.data, result.pagination));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/categories/all  — dùng cho dropdown/select
  static async getAllSimple(req, res, next) {
    try {
      const data = CategoryService.getAllSimple();
      res.json(success(data));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/categories/:id
  static async getCategoryById(req, res, next) {
    try {
      const category = CategoryService.getCategoryById(req.params.id);
      res.json(success(category));
    } catch (err) {
      next(err);
    }
  }

  // POST /api/categories
  static async createCategory(req, res, next) {
    try {
      const created_by = req.user?.id;
      const category = CategoryService.createCategory(req.body, created_by);
      res.status(201).json(success(category, 'Tạo danh mục thành công'));
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/categories/:id
  static async updateCategory(req, res, next) {
    try {
      const updated_by = req.user?.id;
      const category = CategoryService.updateCategory(req.params.id, req.body, updated_by);
      res.json(success(category, 'Cập nhật danh mục thành công'));
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/categories/:id
  static async deleteCategory(req, res, next) {
    try {
      const deleted_by = req.user?.id;
      CategoryService.deleteCategory(req.params.id, deleted_by);
      res.json(success(null, 'Xóa danh mục thành công'));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CategoryController;
