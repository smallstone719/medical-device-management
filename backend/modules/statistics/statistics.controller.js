const StatisticsService = require('./statistics.service');
const { successResponse } = require('../../utils/response');

class StatisticsController {
  static async getStatistics(req, res, next) {
    try {
      const { department_id } = req.query;
      const stats = await StatisticsService.getStatistics({ department_id });
      return successResponse(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StatisticsController;
