const backupJob = require('./backup.job');
const cleanupJob = require('./cleanup.job');
const reportJob = require('./report.job');

module.exports = {
  backupJob,
  cleanupJob,
  reportJob
};
