const express = require('express');
const cors = require('cors');
const path = require('path');
const { checkSetup } = require('./middlewares/setup.middleware');
const { apiLimiter } = require('./middlewares/rate-limit.middleware');
const loggerMiddleware = require('./middlewares/logger.middleware');

const app = express();

// CORS configuration - restrict to specific origins in production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Add request size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(loggerMiddleware);

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'storage')));

// Check setup status and redirect if needed
app.use(checkSetup);

// Routes
// Setup routes (public - no auth required)
app.use('/api/setup', require('./modules/setup/setup.routes'));

// Auth routes
app.use('/api/auth', require('./modules/auth/auth.routes'));

// Core resource routes
app.use('/api/users', require('./modules/users/user.routes'));
app.use('/api/devices', require('./modules/devices/device.routes'));
app.use('/api/categories', require('./modules/categories/category.routes'));
app.use('/api/departments', require('./modules/departments/department.routes'));
app.use('/api/inspections', require('./modules/inspections/inspection.routes'));
app.use('/api/tickets', require('./modules/tickets/ticket.routes'));

// Scheduled reports
app.use('/api/schedules', require('./modules/scheduled-reports/scheduled-report.routes'));

// Zalo integration
app.use('/api/zalo', require('./modules/zalo/zalo.routes'));
app.use('/api/zalo-subscribers', require('./modules/zalo-subscribers/zalo-subscriber.routes'));

// Utility routes
app.use('/api/qrcode', require('./modules/qrcode/qrcode.routes'));
app.use('/api/export', require('./modules/export/export.routes'));
app.use('/api/upload', require('./modules/upload/upload.routes'));

// System routes
app.use('/api/config', require('./modules/config/config.routes'));
app.use('/api/statistics', require('./modules/statistics/statistics.routes'));
app.use('/api/tunnel', require('./modules/tunnel/tunnel.routes'));

// Error handling
app.use(require('./middlewares/error.middleware'));

module.exports = app;
