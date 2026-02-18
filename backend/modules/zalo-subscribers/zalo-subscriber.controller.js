const ZaloSubscriberService = require('./zalo-subscriber.service');
const { success, paginated } = require('../../utils/response');

class ZaloSubscriberController {
  // GET /api/zalo-subscribers
  static async getZaloSubscribers(req, res, next) {
    try {
      const result = ZaloSubscriberService.getZaloSubscribers(req.query);
      res.json(paginated(result.data, result.pagination));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/zalo-subscribers/chat-ids
  static async getAllActiveChatIds(req, res, next) {
    try {
      const chatIds = ZaloSubscriberService.getAllActiveChatIds();
      res.json(success(chatIds));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/zalo-subscribers/:id
  static async getZaloSubscriberById(req, res, next) {
    try {
      const subscriber = ZaloSubscriberService.getZaloSubscriberById(req.params.id);
      res.json(success(subscriber));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/zalo-subscribers/chat/:chatId
  static async getZaloSubscriberByChatId(req, res, next) {
    try {
      const subscriber = ZaloSubscriberService.getZaloSubscriberByChatId(req.params.chatId);
      res.json(success(subscriber));
    } catch (err) {
      next(err);
    }
  }

  // POST /api/zalo-subscribers
  static async createZaloSubscriber(req, res, next) {
    try {
      const created_by = req.user?.id;
      const subscriber = ZaloSubscriberService.createZaloSubscriber(req.body, created_by);
      res.status(201).json(success(subscriber, 'Đăng ký thành công'));
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/zalo-subscribers/:id
  static async updateZaloSubscriber(req, res, next) {
    try {
      const updated_by = req.user?.id;
      const subscriber = ZaloSubscriberService.updateZaloSubscriber(req.params.id, req.body, updated_by);
      res.json(success(subscriber, 'Cập nhật subscriber thành công'));
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/zalo-subscribers/:id
  static async deleteZaloSubscriber(req, res, next) {
    try {
      const deleted_by = req.user?.id;
      ZaloSubscriberService.deleteZaloSubscriber(req.params.id, deleted_by);
      res.json(success(null, 'Hủy đăng ký thành công'));
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/zalo-subscribers/chat/:chatId
  static async deleteZaloSubscriberByChatId(req, res, next) {
    try {
      const deleted_by = req.user?.id;
      ZaloSubscriberService.deleteZaloSubscriberByChatId(req.params.chatId, deleted_by);
      res.json(success(null, 'Hủy đăng ký thành công'));
    } catch (err) {
      next(err);
    }
  }

  // GET /api/zalo-subscribers/department/:departmentId
  static async getZaloSubscribersByDepartment(req, res, next) {
    try {
      const subscribers = ZaloSubscriberService.getZaloSubscribersByDepartment(req.params.departmentId);
      res.json(success(subscribers));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ZaloSubscriberController;
