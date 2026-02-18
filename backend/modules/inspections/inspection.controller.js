const InspectionService = require('./inspection.service');
const { success, paginated } = require('../../utils/response');

class InspectionController {
  // GET /api/inspections
  static async getInspections(req, res, next) {
    try {
      const result = InspectionService.getInspections(req.query);
      res.json(paginated(result.data, result.pagination));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/inspections/:id
  static async getInspectionById(req, res, next) {
    try {
      const inspection = InspectionService.getInspectionById(req.params.id);
      res.json(success(inspection));
    } catch (err) {
      next(err);
    }
  }

  // POST /api/inspections
  static async createInspection(req, res, next) {
    try {
      const created_by = req.user?.id;
      const inspection = InspectionService.createInspection(req.body, created_by);
      res.status(201).json(success(inspection, 'Tạo bản kiểm tra thành công'));
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/inspections/:id
  static async updateInspection(req, res, next) {
    try {
      const updated_by = req.user?.id;
      const inspection = InspectionService.updateInspection(req.params.id, req.body, updated_by);
      res.json(success(inspection, 'Cập nhật bản kiểm tra thành công'));
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/inspections/:id
  static async deleteInspection(req, res, next) {
    try {
      const deleted_by = req.user?.id;
      InspectionService.deleteInspection(req.params.id, deleted_by);
      res.json(success(null, 'Xóa bản kiểm tra thành công'));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/inspections/device/:deviceId/latest
  static async getLatestByDevice(req, res, next) {
    try {
      const inspection = InspectionService.getLatestByDevice(req.params.deviceId);
      res.json(success(inspection));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = InspectionController;
