const logger = require('../utils/logger');
const crypto = require('crypto');

function loggerMiddleware(req, res, next) {
  const start = Date.now();
  
  // Generate request ID for tracking
  req.id = crypto.randomBytes(8).toString('hex');
  
  // Log request
  logger.info(`[${req.id}] --> ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'error' : 'info';
    
    logger[level](`[${req.id}] <-- ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id
    });
  });

  next();
}

module.exports = loggerMiddleware;
