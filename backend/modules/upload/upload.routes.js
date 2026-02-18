const express = require('express');
const router = express.Router();
const controller = require('./upload.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const upload = require('../../config/multer');

router.use(authenticate);

router.post('/image', upload.single('image'), controller.uploadImage);

module.exports = router;
