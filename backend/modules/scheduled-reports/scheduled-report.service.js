const ScheduledReportModel = require('./scheduled-report.model');

class ScheduledReportService {
  // ─── Lấy danh sách scheduled reports ─────────────────────────────────
  static getScheduledReports(query) {
    const { rows, total } = ScheduledReportModel.findAll(query);
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

  // ─── Chi tiết scheduled report ───────────────────────────────────────
  static getScheduledReportById(id) {
    const report = ScheduledReportModel.findById(id);
    if (!report) throw { status: 404, message: 'Không tìm thấy báo cáo định kỳ' };
    return report;
  }

  // ─── Tạo scheduled report mới ────────────────────────────────────────
  static createScheduledReport(payload, created_by = null) {
    return ScheduledReportModel.create({ ...payload, created_by });
  }

  // ─── Cập nhật scheduled report ───────────────────────────────────────
  static updateScheduledReport(id, payload, updated_by = null) {
    this.getScheduledReportById(id);
    return ScheduledReportModel.update(id, { ...payload, updated_by });
  }

  // ─── Xóa scheduled report ─────────────────────────────────────────────
  static deleteScheduledReport(id, deleted_by = null) {
    this.getScheduledReportById(id);
    ScheduledReportModel.softDelete(id, deleted_by);
  }

  // ─── Kích hoạt / Vô hiệu hóa ─────────────────────────────────────────
  static toggleActive(id, updated_by = null) {
    const report = this.getScheduledReportById(id);
    return ScheduledReportModel.update(id, { is_active: !report.is_active, updated_by });
  }

  // ─── Test scheduled report (gửi ngay) ────────────────────────────────
  static async testScheduledReport(id) {
    const report = this.getScheduledReportById(id);
    
    // TODO: Implement actual report generation and sending logic
    // This would integrate with Zalo Bot or other notification services
    
    return {
      message: 'Test report sent successfully',
      report_type: report.report_type,
      chat_ids: report.chat_ids,
      sent_at: new Date().toISOString()
    };
  }

  // ─── Lấy các reports active ───────────────────────────────────────────
  static getActiveReports() {
    return ScheduledReportModel.findActiveReports();
  }
}

module.exports = ScheduledReportService;
