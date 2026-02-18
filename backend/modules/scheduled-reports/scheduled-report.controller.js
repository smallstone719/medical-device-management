const ScheduledReportService = require('./scheduled-report.service');
const { success, paginated } = require('../../utils/response');

class ScheduledReportController {
  // GET /api/scheduled-reports
  static async getScheduledReports(req, res, next) {
    try {
      const result = ScheduledReportService.getScheduledReports(req.query);
      res.json(paginated(result.data, result.pagination));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/scheduled-reports/:id
  static async getScheduledReportById(req, res, next) {
    try {
      const report = ScheduledReportService.getScheduledReportById(req.params.id);
      res.json(success(report));
    } catch (err) {
      next(err);
    }
  }

  // POST /api/scheduled-reports
  static async createScheduledReport(req, res, next) {
    try {
      const created_by = req.user?.id;
      const report = ScheduledReportService.createScheduledReport(req.body, created_by);
      res.status(201).json(success(report, 'Tạo báo cáo định kỳ thành công'));
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/scheduled-reports/:id
  static async updateScheduledReport(req, res, next) {
    try {
      const updated_by = req.user?.id;
      const report = ScheduledReportService.updateScheduledReport(req.params.id, req.body, updated_by);
      res.json(success(report, 'Cập nhật báo cáo định kỳ thành công'));
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/scheduled-reports/:id
  static async deleteScheduledReport(req, res, next) {
    try {
      const deleted_by = req.user?.id;
      ScheduledReportService.deleteScheduledReport(req.params.id, deleted_by);
      res.json(success(null, 'Xóa báo cáo định kỳ thành công'));
    } catch (err) {
      next(err);
    }
  }

  // POST /api/scheduled-reports/:id/toggle
  static async toggleActive(req, res, next) {
    try {
      const updated_by = req.user?.id;
      const report = ScheduledReportService.toggleActive(req.params.id, updated_by);
      const msg = report.is_active ? 'Đã kích hoạt báo cáo' : 'Đã vô hiệu hóa báo cáo';
      res.json(success(report, msg));
    } catch (err) {
      next(err);
    }
  }

  // POST /api/scheduled-reports/:id/test
  static async testScheduledReport(req, res, next) {
    try {
      const result = await ScheduledReportService.testScheduledReport(req.params.id);
      res.json(success(result, 'Đã gửi báo cáo thử nghiệm'));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ScheduledReportController;
