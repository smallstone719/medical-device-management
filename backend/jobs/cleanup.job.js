const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

async function cleanupJob() {
  try {
    const tempPath = path.join(__dirname, '../storage/temp');
    const files = fs.readdirSync(tempPath);
    
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    files.forEach(file => {
      const filePath = path.join(tempPath, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        logger.info(`Deleted temp file: ${file}`);
      }
    });
  } catch (error) {
    logger.error('Cleanup job failed:', error);
  }
}

module.exports = cleanupJob;
