const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

async function backupJob() {
  try {
    const dbPath = path.join(__dirname, '../database/data/app.db');
    const backupPath = path.join(__dirname, '../database/data/backups');
    
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupFile = path.join(backupPath, `backup-${timestamp}.db`);
    
    fs.copyFileSync(dbPath, backupFile);
    logger.info(`Database backup created: ${backupFile}`);
  } catch (error) {
    logger.error('Backup job failed:', error);
  }
}

module.exports = backupJob;
