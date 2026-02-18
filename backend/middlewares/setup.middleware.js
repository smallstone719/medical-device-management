const SetupService = require('../modules/setup/setup.service');

/**
 * Middleware to check if first-time setup is needed
 * Redirects to setup page if no admin user exists
 */
const checkSetup = (req, res, next) => {
  // Skip API routes and static files
  if (req.path.startsWith('/api/') || 
      req.path.startsWith('/css/') || 
      req.path.startsWith('/js/') || 
      req.path.startsWith('/images/') ||
      req.path.startsWith('/uploads/') ||
      req.path === '/setup.html') {
    return next();
  }
  
  // If first-time setup and not on setup page, redirect
  if (SetupService.isFirstTimeSetup() && req.path !== '/setup.html') {
    return res.redirect('/setup.html');
  }
  
  next();
};

module.exports = { checkSetup };
