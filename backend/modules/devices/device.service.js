const DeviceModel = require('./device.model');
const StatisticsService = require('../statistics/statistics.service');

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

    const device = DeviceModel.create({ ...payload, created_by });
    
    // Invalidate statistics cache
    StatisticsService.invalidateCache(payload.department_id);
    
    return device;
  }

  // ─── Cập nhật thiết bị ───────────────────────────────────────────────
  static updateDevice(id, payload, updated_by = null) {
    const device = this.getDeviceById(id);

    // Kiểm tra serial number trùng (nếu có thay đổi)
    if (payload.serial_number && DeviceModel.isSerialNumberExists(payload.serial_number, id)) {
      throw { status: 409, message: `Số serial "${payload.serial_number}" đã tồn tại` };
    }

    const updated = DeviceModel.update(id, { ...payload, updated_by });
    
    // Invalidate cache for both old and new department
    StatisticsService.invalidateCache(device.department_id);
    if (payload.department_id && payload.department_id !== device.department_id) {
      StatisticsService.invalidateCache(payload.department_id);
    }
    
    return updated;
  }

  // ─── Xóa thiết bị ────────────────────────────────────────────────────
  static deleteDevice(id, deleted_by = null) {
    const device = this.getDeviceById(id);
    DeviceModel.softDelete(id, deleted_by);
    
    // Invalidate statistics cache
    StatisticsService.invalidateCache(device.department_id);
  }

  // ─── Lấy danh sách locations ─────────────────────────────────────────
  static getLocations() {
    return DeviceModel.getLocations();
  }
}

module.exports = DeviceService;
