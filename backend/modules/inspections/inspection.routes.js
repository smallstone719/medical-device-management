const express = require('express');
const router = express.Router();
const InspectionController = require('./inspection.controller');
const { createInspectionValidator, updateInspectionValidator } = require('./inspection.validator');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Protected routes
router.use(authenticate);

router.get('/', InspectionController.getInspections);
router.get('/:id', InspectionController.getInspectionById);
router.get('/device/:deviceId/latest', InspectionController.getLatestByDevice);

router.post('/', validate(createInspectionValidator), InspectionController.createInspection);
router.put('/:id', authorize(['admin', 'inspector']), validate(updateInspectionValidator), InspectionController.updateInspection);

// Admin only
router.delete('/:id', authorize(['admin']), InspectionController.deleteInspection);

module.exports = router;
