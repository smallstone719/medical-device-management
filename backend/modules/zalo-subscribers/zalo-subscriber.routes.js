const express = require('express');
const router = express.Router();
const ZaloSubscriberController = require('./zalo-subscriber.controller');
const { createZaloSubscriberValidator, updateZaloSubscriberValidator } = require('./zalo-subscriber.validator');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Public route for subscription (webhook from Zalo)
router.post('/subscribe', validate(createZaloSubscriberValidator), ZaloSubscriberController.createZaloSubscriber);

// Protected routes
router.use(authenticate);

router.get('/', authorize(['admin', 'inspector']), ZaloSubscriberController.getZaloSubscribers);
router.get('/chat-ids', authorize(['admin', 'inspector']), ZaloSubscriberController.getAllActiveChatIds);
router.get('/department/:departmentId', authorize(['admin', 'inspector']), ZaloSubscriberController.getZaloSubscribersByDepartment);
router.get('/chat/:chatId', authorize(['admin', 'inspector']), ZaloSubscriberController.getZaloSubscriberByChatId);
router.get('/:id', authorize(['admin', 'inspector']), ZaloSubscriberController.getZaloSubscriberById);

// Admin only
router.put('/:id', authorize(['admin']), validate(updateZaloSubscriberValidator), ZaloSubscriberController.updateZaloSubscriber);
router.delete('/:id', authorize(['admin']), ZaloSubscriberController.deleteZaloSubscriber);
router.delete('/chat/:chatId', authorize(['admin']), ZaloSubscriberController.deleteZaloSubscriberByChatId);

module.exports = router;
