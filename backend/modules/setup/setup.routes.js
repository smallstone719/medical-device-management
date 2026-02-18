const express = require('express');
const router = express.Router();
const SetupController = require('./setup.controller');

// Public routes - no authentication required for setup
router.get('/status', SetupController.getStatus);
router.post('/admin', SetupController.createAdmin);

module.exports = router;
