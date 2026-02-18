const express = require('express');
const router = express.Router();
const AssetController = require('./asset.controller');
const { createAssetValidator, updateAssetValidator } = require('./asset.validator');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Protected routes
router.use(authenticate);

router.get('/', AssetController.getAssets);
router.get('/device/:deviceId', AssetController.getAssetsByDevice);
router.get('/:id', AssetController.getAssetById);

router.post('/', authorize(['admin', 'inspector']), validate(createAssetValidator), AssetController.createAsset);
router.put('/:id', authorize(['admin', 'inspector']), validate(updateAssetValidator), AssetController.updateAsset);

// Admin only
router.delete('/:id', authorize(['admin']), AssetController.deleteAsset);

module.exports = router;
