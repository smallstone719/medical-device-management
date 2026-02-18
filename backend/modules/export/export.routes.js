const express = require('express');
const router = express.Router();
const controller = require('./export.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.use(authenticate);

router.get('/devices', controller.exportDevices);
router.get('/assets', controller.exportAssets);

module.exports = router;
