const cron = require('node-cron');
const jobs = require('../jobs');

function initCronJobs() {
  // Backup database daily at 2 AM
  cron.schedule('0 2 * * *', jobs.backupJob);

  // Cleanup temp files every hour
  cron.schedule('0 * * * *', jobs.cleanupJob);

  // Generate reports weekly on Monday at 8 AM
  cron.schedule('0 8 * * 1', jobs.reportJob);

  console.log('✅ Cron jobs initialized');
}

module.exports = { initCronJobs };
