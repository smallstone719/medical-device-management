const express = require('express');
const cors = require('cors');
const path = require('path');
const { checkSetup } = require('./middlewares/setup.middleware');
const { apiLimiter } = require('./middlewares/rate-limit.middleware');
const loggerMiddleware = require('./middlewares/logger.middleware');
const { STORAGE_DIR } = require('./config/paths');

const app = express();

// CORS configuration - allow credentials for authentication
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In production, check against allowed origins
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : [origin]; // In development, allow the requesting origin
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now, restrict in production
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Setup-Required']
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Add request size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Request logging
app.use(loggerMiddleware);

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Static files
app.use('/uploads', express.static(STORAGE_DIR));

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

// Serve Vue SPA (must be after API routes)
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling
app.use(require('./middlewares/error.middleware'));

module.exports = app;
