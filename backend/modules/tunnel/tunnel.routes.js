const express = require('express');
const router = express.Router();
const TunnelController = require('./tunnel.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

// Protected routes
router.use(authenticate);

router.get('/info', TunnelController.getInfo);

module.exports = router;
