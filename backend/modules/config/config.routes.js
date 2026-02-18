const express = require('express');
const router = express.Router();
const ConfigController = require('./config.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// All config routes require admin authentication
router.use(authenticate);
router.use(authorize(['admin']));

router.get('/', ConfigController.getAll);
router.get('/:key', ConfigController.get);
router.post('/', ConfigController.setMultiple);
router.put('/:key', ConfigController.set);
router.delete('/:key', ConfigController.delete);

module.exports = router;
