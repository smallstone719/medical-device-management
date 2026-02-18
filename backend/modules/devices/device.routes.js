const express = require('express');
const router = express.Router();
const DeviceController = require('./device.controller');
const { createDeviceValidator, updateDeviceValidator } = require('./device.validator');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Protected routes
router.use(authenticate);

router.get('/', DeviceController.getDevices);
router.get('/locations', DeviceController.getLocations);
router.get('/:id', DeviceController.getDeviceById);

router.post('/', authorize(['admin', 'inspector']), validate(createDeviceValidator), DeviceController.createDevice);
router.put('/:id', authorize(['admin', 'inspector', 'technician']), validate(updateDeviceValidator), DeviceController.updateDevice);

// Admin only
router.delete('/:id', authorize(['admin']), DeviceController.deleteDevice);

module.exports = router;
