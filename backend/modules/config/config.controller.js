const ConfigService = require('./config.service');
const { successResponse, errorResponse } = require('../../utils/response');

class ConfigController {
  static getAll(req, res, next) {
    try {
      const configs = ConfigService.getAll();
      return successResponse(res, configs);
    } catch (error) {
      next(error);
    }
  }

  static get(req, res, next) {
    try {
      const { key } = req.params;
      const value = ConfigService.get(key);
      
      if (value === null) {
        return errorResponse(res, 'Config key not found', 404);
      }
      
      return successResponse(res, { key, value });
    } catch (error) {
      next(error);
    }
  }

  static set(req, res, next) {
    try {
      const { key, value } = req.body;
      const userId = req.user?.id;
      
      ConfigService.set(key, value, userId);
      return successResponse(res, { message: 'Config updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static setMultiple(req, res, next) {
    try {
      const { entries } = req.body;
      const userId = req.user?.id;
      
      if (!entries || !Array.isArray(entries)) {
        return errorResponse(res, 'Invalid config entries', 400);
      }
      
      ConfigService.setMultiple(entries, userId);
      return successResponse(res, { message: 'Configs updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static delete(req, res, next) {
    try {
      const { key } = req.params;
      ConfigService.delete(key);
      return successResponse(res, { message: 'Config deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ConfigController;
