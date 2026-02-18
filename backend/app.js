const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'storage')));

// Routes
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/users', require('./modules/users/user.routes'));
app.use('/api/devices', require('./modules/devices/device.routes'));
app.use('/api/assets', require('./modules/assets/asset.routes'));
app.use('/api/qrcode', require('./modules/qrcode/qrcode.routes'));
app.use('/api/export', require('./modules/export/export.routes'));
app.use('/api/upload', require('./modules/upload/upload.routes'));

// Error handling
app.use(require('./middlewares/error.middleware'));

module.exports = app;
