const TicketModel = require('./ticket.model');

class TicketService {
  // ─── Lấy danh sách tickets ───────────────────────────────────────────
  static getTickets(query) {
    const { rows, total } = TicketModel.findAll(query);
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

  // ─── Chi tiết ticket ──────────────────────────────────────────────────
  static getTicketById(id) {
    const ticket = TicketModel.findById(id);
    if (!ticket) throw { status: 404, message: 'Không tìm thấy ticket' };
    return ticket;
  }

  // ─── Tạo ticket mới ───────────────────────────────────────────────────
  static createTicket(payload, created_by = null) {
    return TicketModel.create({ ...payload, created_by });
  }

  // ─── Cập nhật ticket ──────────────────────────────────────────────────
  static updateTicket(id, payload, updated_by = null) {
    this.getTicketById(id);
    return TicketModel.update(id, { ...payload, updated_by });
  }

  // ─── Xóa ticket ───────────────────────────────────────────────────────
  static deleteTicket(id, deleted_by = null) {
    this.getTicketById(id);
    TicketModel.softDelete(id, deleted_by);
  }

  // ─── Claim ticket (kỹ thuật viên nhận xử lý) ─────────────────────────
  static claimTicket(id, user_id) {
    this.getTicketById(id);
    return TicketModel.claim(id, user_id);
  }

  // ─── Lấy replies của ticket ───────────────────────────────────────────
  static getTicketReplies(ticket_id) {
    return TicketModel.findReplies(ticket_id);
  }

  // ─── Tạo reply mới ────────────────────────────────────────────────────
  static createReply(ticket_id, { message }, user_id) {
    this.getTicketById(ticket_id);
    return TicketModel.createReply(ticket_id, user_id, message);
  }
}

module.exports = TicketService;
