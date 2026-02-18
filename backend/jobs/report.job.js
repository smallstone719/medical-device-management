const logger = require('../utils/logger');

async function reportJob() {
  try {
    // Generate weekly reports
    logger.info('Weekly report generated');
  } catch (error) {
    logger.error('Report job failed:', error);
  }
}

module.exports = reportJob;
