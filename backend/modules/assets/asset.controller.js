const AssetService = require('./asset.service');
const { success, paginated } = require('../../utils/response');

class AssetController {
  // GET /api/assets
  static async getAssets(req, res, next) {
    try {
      const result = AssetService.getAssets(req.query);
      res.json(paginated(result.data, result.pagination));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/assets/:id
  static async getAssetById(req, res, next) {
    try {
      const asset = AssetService.getAssetById(req.params.id);
      res.json(success(asset));
    } catch (err) {
      next(err);
    }
  }

  // POST /api/assets
  static async createAsset(req, res, next) {
    try {
      const created_by = req.user?.id;
      const asset = AssetService.createAsset(req.body, created_by);
      res.status(201).json(success(asset, 'Tạo tài sản thành công'));
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/assets/:id
  static async updateAsset(req, res, next) {
    try {
      const updated_by = req.user?.id;
      const asset = AssetService.updateAsset(req.params.id, req.body, updated_by);
      res.json(success(asset, 'Cập nhật tài sản thành công'));
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/assets/:id
  static async deleteAsset(req, res, next) {
    try {
      const deleted_by = req.user?.id;
      AssetService.deleteAsset(req.params.id, deleted_by);
      res.json(success(null, 'Xóa tài sản thành công'));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/assets/device/:deviceId
  static async getAssetsByDevice(req, res, next) {
    try {
      const assets = AssetService.getAssetsByDevice(req.params.deviceId);
      res.json(success(assets));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AssetController;
