const express = require('express');
const router = express.Router();
const StatisticsController = require('./statistics.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

// Protected routes
router.use(authenticate);

router.get('/', StatisticsController.getStatistics);

module.exports = router;
