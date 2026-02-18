const ZaloSubscriberModel = require('./zalo-subscriber.model');

class ZaloSubscriberService {
  // ─── Lấy danh sách subscribers ───────────────────────────────────────
  static getZaloSubscribers(query) {
    const { rows, total } = ZaloSubscriberModel.findAll(query);
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

  // ─── Chi tiết subscriber ──────────────────────────────────────────────
  static getZaloSubscriberById(id) {
    const subscriber = ZaloSubscriberModel.findById(id);
    if (!subscriber) throw { status: 404, message: 'Không tìm thấy subscriber' };
    return subscriber;
  }

  // ─── Tìm theo chat_id ─────────────────────────────────────────────────
  static getZaloSubscriberByChatId(chat_id) {
    const subscriber = ZaloSubscriberModel.findByChatId(chat_id);
    if (!subscriber) throw { status: 404, message: 'Không tìm thấy subscriber' };
    return subscriber;
  }

  // ─── Tạo subscriber mới (subscribe) ───────────────────────────────────
  static createZaloSubscriber(payload, created_by = null) {
    // Kiểm tra chat_id đã tồn tại chưa
    if (ZaloSubscriberModel.isChatIdExists(payload.chat_id)) {
      throw { status: 409, message: `Chat ID "${payload.chat_id}" đã đăng ký` };
    }

    return ZaloSubscriberModel.create({ ...payload, created_by });
  }

  // ─── Cập nhật subscriber ──────────────────────────────────────────────
  static updateZaloSubscriber(id, payload, updated_by = null) {
    this.getZaloSubscriberById(id);
    return ZaloSubscriberModel.update(id, { ...payload, updated_by });
  }

  // ─── Xóa subscriber (unsubscribe) ─────────────────────────────────────
  static deleteZaloSubscriber(id, deleted_by = null) {
    this.getZaloSubscriberById(id);
    ZaloSubscriberModel.softDelete(id, deleted_by);
  }

  // ─── Xóa theo chat_id ─────────────────────────────────────────────────
  static deleteZaloSubscriberByChatId(chat_id, deleted_by = null) {
    const subscriber = this.getZaloSubscriberByChatId(chat_id);
    ZaloSubscriberModel.softDelete(subscriber.id, deleted_by);
  }

  // ─── Lấy tất cả chat_ids active ──────────────────────────────────────
  static getAllActiveChatIds() {
    return ZaloSubscriberModel.findAllActiveChatIds();
  }

  // ─── Lấy subscribers theo department ─────────────────────────────────
  static getZaloSubscribersByDepartment(department_id) {
    return ZaloSubscriberModel.findByDepartmentId(department_id);
  }
}

module.exports = ZaloSubscriberService;
