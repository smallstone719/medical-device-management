const DeviceService = require('./device.service');
const { success, paginated } = require('../../utils/response');

class DeviceController {
  // GET /api/devices
  static async getDevices(req, res, next) {
    try {
      const result = DeviceService.getDevices(req.query);
      res.json(paginated(result.data, result.pagination));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/devices/:id
  static async getDeviceById(req, res, next) {
    try {
      const device = DeviceService.getDeviceById(req.params.id);
      res.json(success(device));
    } catch (err) {
      next(err);
    }
  }

  // POST /api/devices
  static async createDevice(req, res, next) {
    try {
      const created_by = req.user?.id;
      const device = DeviceService.createDevice(req.body, created_by);
      res.status(201).json(success(device, 'Tạo thiết bị thành công'));
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/devices/:id
  static async updateDevice(req, res, next) {
    try {
      const updated_by = req.user?.id;
      const device = DeviceService.updateDevice(req.params.id, req.body, updated_by);
      res.json(success(device, 'Cập nhật thiết bị thành công'));
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/devices/:id
  static async deleteDevice(req, res, next) {
    try {
      const deleted_by = req.user?.id;
      DeviceService.deleteDevice(req.params.id, deleted_by);
      res.json(success(null, 'Xóa thiết bị thành công'));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/devices/locations
  static async getLocations(req, res, next) {
    try {
      const locations = DeviceService.getLocations();
      res.json(success(locations));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DeviceController;
