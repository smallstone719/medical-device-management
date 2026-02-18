const TunnelService = require('./tunnel.service');
const { successResponse } = require('../../utils/response');

class TunnelController {
  static getInfo(req, res, next) {
    try {
      const info = TunnelService.getInfo();
      return successResponse(res, info);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TunnelController;
