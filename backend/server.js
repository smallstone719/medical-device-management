require('dotenv').config({ path: '../.env' });
const app = require('./app');
const logger = require('./utils/logger');
const { initCronJobs } = require('./config/cron');
const { runMigrations } = require('./scripts/migrate');

const PORT = process.env.PORT || 3000;

// Database connection is initialized on require
console.log('✅ Database connected');

// Run migrations automatically on startup
(async () => {
  try {
    console.log('🔄 Running database migrations...');
    await runMigrations();
    console.log('✅ Migrations completed');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    // Don't exit - let the app start even if migrations fail
    // This prevents deployment failures
  }
})();

// Initialize cron jobs
initCronJobs();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
