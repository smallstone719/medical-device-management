/**
 * Central export file for modules that need to be accessed from server.js
 * This allows server.js to initialize services like ZaloBot and Tunnel
 */

const ZaloService = require('./zalo/zalo.service');
const TunnelService = require('./tunnel/tunnel.service');
const SetupService = require('./setup/setup.service');

module.exports = {
  ZaloService,
  TunnelService,
  SetupService
};
