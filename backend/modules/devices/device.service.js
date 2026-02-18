const DeviceModel = require('./device.model');

class DeviceService {
  // ─── Lấy danh sách thiết bị ──────────────────────────────────────────
  static getDevices(query) {
    const { rows, total } = DeviceModel.findAll(query);
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

  // ─── Chi tiết thiết bị ───────────────────────────────────────────────
  static getDeviceById(id) {
    const device = DeviceModel.findById(id);
    if (!device) throw { status: 404, message: 'Không tìm thấy thiết bị' };
    return device;
  }

  // ─── Tạo thiết bị mới ────────────────────────────────────────────────
  static createDevice(payload, created_by = null) {
    // Kiểm tra serial number trùng
    if (payload.serial_number && DeviceModel.isSerialNumberExists(payload.serial_number)) {
      throw { status: 409, message: `Số serial "${payload.serial_number}" đã tồn tại` };
    }

    return DeviceModel.create({ ...payload, created_by });
  }

  // ─── Cập nhật thiết bị ───────────────────────────────────────────────
  static updateDevice(id, payload, updated_by = null) {
    this.getDeviceById(id);

    // Kiểm tra serial number trùng (nếu có thay đổi)
    if (payload.serial_number && DeviceModel.isSerialNumberExists(payload.serial_number, id)) {
      throw { status: 409, message: `Số serial "${payload.serial_number}" đã tồn tại` };
    }

    return DeviceModel.update(id, { ...payload, updated_by });
  }

  // ─── Xóa thiết bị ────────────────────────────────────────────────────
  static deleteDevice(id, deleted_by = null) {
    this.getDeviceById(id);
    DeviceModel.softDelete(id, deleted_by);
  }

  // ─── Lấy danh sách locations ─────────────────────────────────────────
  static getLocations() {
    return DeviceModel.getLocations();
  }
}

module.exports = DeviceService;
