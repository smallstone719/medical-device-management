const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const logger = require('../utils/logger');

async function backupJob() {
  try {
    const dbPath = path.join(__dirname, '../database/data/app.db');
    const backupPath = path.join(__dirname, '../database/data/backups');
    
    // Create backup directory if not exists
    if (!fsSync.existsSync(backupPath)) {
      await fs.mkdir(backupPath, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupFile = path.join(backupPath, `backup-${timestamp}.db`);
    
    // Use async copyFile instead of sync
    await fs.copyFile(dbPath, backupFile);
    logger.info(`Database backup created: ${backupFile}`);
    
    // Cleanup old backups (keep last 7 days)
    await cleanupOldBackups(backupPath, 7);
  } catch (error) {
    logger.error('Backup job failed:', error);
  }
}

async function cleanupOldBackups(backupPath, daysToKeep) {
  try {
    const files = await fs.readdir(backupPath);
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000;
    
    for (const file of files) {
      if (!file.startsWith('backup-')) continue;
      
      const filePath = path.join(backupPath, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        await fs.unlink(filePath);
        logger.info(`Deleted old backup: ${file}`);
      }
    }
  } catch (error) {
    logger.error('Cleanup old backups failed:', error);
  }
}

module.exports = backupJob;
