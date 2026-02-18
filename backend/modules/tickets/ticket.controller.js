const TicketService = require('./ticket.service');
const { success, paginated } = require('../../utils/response');

class TicketController {
  // GET /api/tickets
  static async getTickets(req, res, next) {
    try {
      const result = TicketService.getTickets(req.query);
      res.json(paginated(result.data, result.pagination));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/tickets/:id
  static async getTicketById(req, res, next) {
    try {
      const ticket = TicketService.getTicketById(req.params.id);
      res.json(success(ticket));
    } catch (err) {
      next(err);
    }
  }

  // POST /api/tickets
  static async createTicket(req, res, next) {
    try {
      const created_by = req.user?.id;
      const ticket = TicketService.createTicket(req.body, created_by);
      res.status(201).json(success(ticket, 'Tạo ticket thành công'));
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/tickets/:id
  static async updateTicket(req, res, next) {
    try {
      const updated_by = req.user?.id;
      const ticket = TicketService.updateTicket(req.params.id, req.body, updated_by);
      res.json(success(ticket, 'Cập nhật ticket thành công'));
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/tickets/:id
  static async deleteTicket(req, res, next) {
    try {
      const deleted_by = req.user?.id;
      TicketService.deleteTicket(req.params.id, deleted_by);
      res.json(success(null, 'Xóa ticket thành công'));
    } catch (err) {
      next(err);
    }
  }

  // POST /api/tickets/:id/claim
  static async claimTicket(req, res, next) {
    try {
      const user_id = req.user?.id;
      const ticket = TicketService.claimTicket(req.params.id, user_id);
      res.json(success(ticket, 'Đã nhận xử lý ticket'));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/tickets/:id/replies
  static async getTicketReplies(req, res, next) {
    try {
      const replies = TicketService.getTicketReplies(req.params.id);
      res.json(success(replies));
    } catch (err) {
      next(err);
    }
  }

  // POST /api/tickets/:id/replies
  static async createReply(req, res, next) {
    try {
      const user_id = req.user?.id;
      const reply = TicketService.createReply(req.params.id, req.body, user_id);
      res.status(201).json(success(reply, 'Đã thêm phản hồi'));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TicketController;
