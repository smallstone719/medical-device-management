const ZaloService = require('./zalo.service');
const { successResponse, errorResponse } = require('../../utils/response');

class ZaloController {
  static async handleWebhook(req, res, next) {
    try {
      console.log("📨 Zalo Webhook received:", JSON.stringify(req.body, null, 2));
      const result = await ZaloService.handleWebhook(req.body);
      return successResponse(res, { result });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static subscribe(req, res, next) {
    try {
      const { chat_id } = req.body;
      
      if (!chat_id) {
        return errorResponse(res, 'chat_id is required', 400);
      }
      
      const result = ZaloService.subscribe(chat_id);
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  static getSubscribers(req, res, next) {
    try {
      const result = ZaloService.getSubscribers();
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getStatus(req, res, next) {
    try {
      const status = await ZaloService.getStatus();
      return successResponse(res, status);
    } catch (error) {
      next(error);
    }
  }

  static async updateToken(req, res, next) {
    try {
      const { token } = req.body;
      const result = await ZaloService.updateToken(token);
      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static disconnect(req, res, next) {
    try {
      const result = ZaloService.disconnect();
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ZaloController;
