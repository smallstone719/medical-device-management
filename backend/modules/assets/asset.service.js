const AssetModel = require('./asset.model');

class AssetService {
  // ─── Lấy danh sách assets ────────────────────────────────────────────
  static getAssets(query) {
    const { rows, total } = AssetModel.findAll(query);
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

  // ─── Chi tiết asset ───────────────────────────────────────────────────
  static getAssetById(id) {
    const asset = AssetModel.findById(id);
    if (!asset) throw { status: 404, message: 'Không tìm thấy tài sản' };
    return asset;
  }

  // ─── Tạo asset mới ───────────────────────────────────────────────────
  static createAsset(payload, created_by = null) {
    // Kiểm tra asset_tag trùng
    if (payload.asset_tag && AssetModel.isAssetTagExists(payload.asset_tag)) {
      throw { status: 409, message: `Mã tài sản "${payload.asset_tag}" đã tồn tại` };
    }

    return AssetModel.create({ ...payload, created_by });
  }

  // ─── Cập nhật asset ───────────────────────────────────────────────────
  static updateAsset(id, payload, updated_by = null) {
    this.getAssetById(id);

    // Kiểm tra asset_tag trùng (nếu có thay đổi)
    if (payload.asset_tag && AssetModel.isAssetTagExists(payload.asset_tag, id)) {
      throw { status: 409, message: `Mã tài sản "${payload.asset_tag}" đã tồn tại` };
    }

    return AssetModel.update(id, { ...payload, updated_by });
  }

  // ─── Xóa asset ────────────────────────────────────────────────────────
  static deleteAsset(id, deleted_by = null) {
    this.getAssetById(id);
    AssetModel.softDelete(id, deleted_by);
  }

  // ─── Lấy assets theo device ───────────────────────────────────────────
  static getAssetsByDevice(device_id) {
    return AssetModel.findByDeviceId(device_id);
  }
}

module.exports = AssetService;
