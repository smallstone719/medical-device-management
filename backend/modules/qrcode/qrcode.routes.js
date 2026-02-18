const express = require('express');
const router = express.Router();
const controller = require('./qrcode.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.use(authenticate);

router.post('/generate', controller.generate);

module.exports = router;
