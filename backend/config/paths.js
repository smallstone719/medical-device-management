const path = require('path');

// Use Railway volume if available, otherwise use local path
const VOLUME_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.VOLUME_MOUNT_PATH;

const DATA_DIR = VOLUME_PATH 
  ? path.join(VOLUME_PATH, 'database')
  : path.join(__dirname, '../database/data');

const STORAGE_DIR = VOLUME_PATH
  ? path.join(VOLUME_PATH, 'storage')
  : path.join(__dirname, '../storage');

const LOGS_DIR = VOLUME_PATH
  ? path.join(VOLUME_PATH, 'logs')
  : path.join(__dirname, '../logs');

const BACKUP_DIR = VOLUME_PATH
  ? path.join(VOLUME_PATH, 'backups')
  : path.join(__dirname, '../backups');

console.log('📁 Storage paths:');
console.log('  - Volume:', VOLUME_PATH || 'Not configured (using local)');
console.log('  - Database:', DATA_DIR);
console.log('  - Storage:', STORAGE_DIR);
console.log('  - Logs:', LOGS_DIR);

module.exports = {
  DATA_DIR,
  STORAGE_DIR,
  LOGS_DIR,
  BACKUP_DIR,
  VOLUME_PATH
};
