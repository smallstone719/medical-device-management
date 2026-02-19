const SetupService = require('../modules/setup/setup.service');

/**
 * Middleware to check if first-time setup is needed
 * For SPA, we let the frontend handle routing
 * Just add a header to indicate setup status
 */
const checkSetup = (req, res, next) => {
  // Skip API routes and static files
  if (req.path.startsWith('/api/') || 
      req.path.startsWith('/assets/') || 
      req.path.startsWith('/images/') ||
      req.path.startsWith('/uploads/')) {
    return next();
  }
  
  // Add setup status to response header for frontend to check
  res.setHeader('X-Setup-Required', SetupService.isFirstTimeSetup() ? 'true' : 'false');
  
  next();
};

module.exports = { checkSetup };
