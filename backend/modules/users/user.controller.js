const UserService = require('./user.service');
const { success, paginated } = require('../../utils/response');

class UserController {
  // GET /api/users
  static async getUsers(req, res, next) {
    try {
      const result = UserService.getUsers(req.query);
      res.json(paginated(result.data, result.pagination));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/users/:id
  static async getUserById(req, res, next) {
    try {
      const user = UserService.getUserById(req.params.id);
      res.json(success(user));
    } catch (err) {
      next(err);
    }
  }

  // POST /api/users
  static async createUser(req, res, next) {
    try {
      const user = await UserService.createUser(req.body, req.user.id);
      res.status(201).json(success(user, 'Tạo người dùng thành công'));
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/users/:id
  static async updateUser(req, res, next) {
    try {
      const user = UserService.updateUser(req.params.id, req.body, req.user.id);
      res.json(success(user, 'Cập nhật thành công'));
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/users/:id/password
  static async changePassword(req, res, next) {
    try {
      await UserService.changePassword(req.params.id, req.body);
      res.json(success(null, 'Đổi mật khẩu thành công'));
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/users/:id/avatar
  static async updateAvatar(req, res, next) {
    try {
      if (!req.file) throw { status: 400, message: 'Vui lòng chọn ảnh' };
      const user = UserService.updateAvatar(req.params.id, req.file.path, req.user.id);
      res.json(success(user, 'Cập nhật ảnh đại diện thành công'));
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/users/:id/toggle-active
  static async toggleActive(req, res, next) {
    try {
      const user = UserService.toggleActive(req.params.id, req.user.id);
      const msg = user.is_active ? 'Đã kích hoạt tài khoản' : 'Đã vô hiệu hóa tài khoản';
      res.json(success(user, msg));
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/users/:id
  static async deleteUser(req, res, next) {
    try {
      UserService.deleteUser(req.params.id, req.user.id);
      res.json(success(null, 'Xóa người dùng thành công'));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
