const SetupService = require('./setup.service');
const { successResponse, errorResponse } = require('../../utils/response');

class SetupController {
  static getStatus(req, res, next) {
    try {
      const status = SetupService.getSetupStatus();
      return successResponse(res, status);
    } catch (error) {
      next(error);
    }
  }

  static async createAdmin(req, res, next) {
    try {
      const result = await SetupService.createAdminAccount(req.body);
      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = SetupController;
