const express = require('express');
const router = express.Router();
const ZaloController = require('./zalo.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Public webhook endpoint (no auth required)
router.post('/webhook', ZaloController.handleWebhook);

// Protected routes
router.use(authenticate);

router.post('/subscribe', ZaloController.subscribe);
router.get('/subscribers', ZaloController.getSubscribers);
router.get('/status', ZaloController.getStatus);

// Admin only
router.post('/token', authorize(['admin']), ZaloController.updateToken);
router.post('/disconnect', authorize(['admin']), ZaloController.disconnect);

module.exports = router;
