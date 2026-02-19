const bcrypt = require('bcryptjs');
const UserModel = require('./user.model');

const SALT_ROUNDS = 10;

class UserService {
  // ─── Lấy danh sách users ──────────────────────────────────────────────
  static getUsers(query) {
    const { rows, total } = UserModel.findAll(query);
    const { page = 1, limit = 20 } = query;

    return {
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Lấy chi tiết một user ────────────────────────────────────────────
  static getUserById(id) {
    const user = UserModel.findById(id);
    if (!user) throw { status: 404, message: 'Không tìm thấy người dùng' };
    return user;
  }

  // ─── Tạo user mới ─────────────────────────────────────────────────────
  static async createUser(data, created_by) {
    const { username, full_name, email, phone_number, zalo_id, password, role, department_id } = data;

    // Kiểm tra trùng
    if (UserModel.isExists({ username, email })) {
      throw { status: 409, message: 'Username hoặc email đã tồn tại' };
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = UserModel.create({ 
      username, 
      full_name, 
      email,
      phone_number,
      zalo_id,
      password_hash, 
      role,
      department_id,
      created_by 
    });

    return user;
  }

  // ─── Cập nhật user ────────────────────────────────────────────────────
  static updateUser(id, payload, updated_by) {
    // Đảm bảo user tồn tại
    this.getUserById(id);

    // Kiểm tra trùng email nếu có thay đổi
    if (payload.email) {
      if (UserModel.isExists({ username: '', email: payload.email, excludeId: id })) {
        throw { status: 409, message: 'Email đã được sử dụng' };
      }
    }

    return UserModel.update(id, { ...payload, updated_by });
  }

  // ─── Đổi mật khẩu ─────────────────────────────────────────────────────
  static async changePassword(id, { current_password, new_password }) {
    // Lấy user với password_hash
    const user = require('../../database/db')
      .prepare('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL')
      .get(id);

    if (!user) throw { status: 404, message: 'Không tìm thấy người dùng' };

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) throw { status: 400, message: 'Mật khẩu hiện tại không đúng' };

    const password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);
    UserModel.updatePassword(id, password_hash);
  }

  // ─── Cập nhật avatar ──────────────────────────────────────────────────
  static updateAvatar(id, avatarPath, updated_by) {
    this.getUserById(id);
    return UserModel.update(id, { avatar: avatarPath, updated_by });
  }

  // ─── Kích hoạt / Vô hiệu hóa ──────────────────────────────────────────
  static toggleActive(id, updated_by) {
    const user = this.getUserById(id);
    return UserModel.update(id, { is_active: !user.is_active, updated_by });
  }

  // ─── Xóa user ─────────────────────────────────────────────────────────
  static deleteUser(id, deleted_by) {
    this.getUserById(id);
    UserModel.softDelete(id, deleted_by);
  }
}

module.exports = UserService;
