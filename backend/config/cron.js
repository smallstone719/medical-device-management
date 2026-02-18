const cron = require('node-cron');
const jobs = require('../jobs');

function initCronJobs() {
  // Backup database daily at 2 AM
  cron.schedule('0 2 * * *', jobs.backupJob);

  // Cleanup temp files every hour
  cron.schedule('0 * * * *', jobs.cleanupJob);

  // Generate reports weekly on Monday at 8 AM
  cron.schedule('0 8 * * 1', jobs.reportJob);

  // Check scheduled reports every 5 minutes (optimized from every minute)
  cron.schedule('*/5 * * * *', jobs.checkScheduledReports);

  console.log('✅ Cron jobs initialized');
  console.log('   - Backup: Daily at 2 AM');
  console.log('   - Cleanup: Every hour');
  console.log('   - Reports: Weekly on Monday at 8 AM');
  console.log('   - Scheduled reports: Every 5 minutes');
}

module.exports = { initCronJobs };
