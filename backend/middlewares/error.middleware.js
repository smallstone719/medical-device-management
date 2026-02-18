const logger = require('../utils/logger');

function errorMiddleware(err, req, res, next) {
  logger.error(err.message, { stack: err.stack });

  // Custom error với status
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorMiddleware;
