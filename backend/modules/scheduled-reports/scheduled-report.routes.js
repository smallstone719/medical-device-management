const express = require('express');
const router = express.Router();
const ScheduledReportController = require('./scheduled-report.controller');
const { createScheduledReportValidator, updateScheduledReportValidator } = require('./scheduled-report.validator');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Protected routes - Admin only
router.use(authenticate);
router.use(authorize(['admin']));

router.get('/', ScheduledReportController.getScheduledReports);
router.get('/:id', ScheduledReportController.getScheduledReportById);
router.post('/', validate(createScheduledReportValidator), ScheduledReportController.createScheduledReport);
router.put('/:id', validate(updateScheduledReportValidator), ScheduledReportController.updateScheduledReport);
router.delete('/:id', ScheduledReportController.deleteScheduledReport);
router.post('/:id/toggle', ScheduledReportController.toggleActive);
router.post('/:id/test', ScheduledReportController.testScheduledReport);

module.exports = router;
