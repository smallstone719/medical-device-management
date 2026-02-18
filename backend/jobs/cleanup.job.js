const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

async function cleanupJob() {
  try {
    const tempPath = path.join(__dirname, '../storage/temp');
    const files = await fs.readdir(tempPath);
    
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    // Process files in parallel with Promise.all
    await Promise.all(
      files.map(async (file) => {
        try {
          const filePath = path.join(tempPath, file);
          const stats = await fs.stat(filePath);
          
          if (now - stats.mtimeMs > maxAge) {
            await fs.unlink(filePath);
            logger.info(`Deleted temp file: ${file}`);
          }
        } catch (err) {
          logger.error(`Failed to process file ${file}:`, err);
        }
      })
    );
  } catch (error) {
    logger.error('Cleanup job failed:', error);
  }
}

module.exports = cleanupJob;
