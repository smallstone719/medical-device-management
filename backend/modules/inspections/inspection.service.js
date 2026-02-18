const InspectionModel = require('./inspection.model');

class InspectionService {
  // ─── Lấy danh sách kiểm tra ──────────────────────────────────────────
  static getInspections(query) {
    const { rows, total } = InspectionModel.findAll(query);
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

  // ─── Chi tiết kiểm tra ───────────────────────────────────────────────
  static getInspectionById(id) {
    const inspection = InspectionModel.findById(id);
    if (!inspection) throw { status: 404, message: 'Không tìm thấy bản kiểm tra' };
    
    // Parse images JSON if exists
    if (inspection.images) {
      try {
        inspection.images = JSON.parse(inspection.images);
      } catch (e) {
        inspection.images = [];
      }
    }
    
    return inspection;
  }

  // ─── Tạo kiểm tra mới ────────────────────────────────────────────────
  static createInspection(payload, created_by = null) {
    return InspectionModel.create({ ...payload, created_by });
  }

  // ─── Cập nhật kiểm tra ───────────────────────────────────────────────
  static updateInspection(id, payload, updated_by = null) {
    this.getInspectionById(id);
    return InspectionModel.update(id, { ...payload, updated_by });
  }

  // ─── Xóa kiểm tra ────────────────────────────────────────────────────
  static deleteInspection(id, deleted_by = null) {
    this.getInspectionById(id);
    InspectionModel.softDelete(id, deleted_by);
  }

  // ─── Lấy kiểm tra gần nhất của thiết bị ──────────────────────────────
  static getLatestByDevice(device_id) {
    return InspectionModel.findLatestByDevice(device_id);
  }
}

module.exports = InspectionService;
