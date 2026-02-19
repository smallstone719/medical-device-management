require('dotenv').config({ path: '../.env' });
const app = require('./app');
const logger = require('./utils/logger');
const { initCronJobs } = require('./config/cron');
const { runMigrations } = require('./scripts/migrate');
const db = require('./database/db');
const { seed } = require('./database/seeds/seed');

const PORT = process.env.PORT || 3000;

// Database connection is initialized on require
console.log('✅ Database connected');

// Run migrations and auto-seed if needed
(async () => {
  try {
    console.log('🔄 Running database migrations...');
    await runMigrations();
    console.log('✅ Migrations completed');

    // Force seed if FORCE_SEED environment variable is set
    if (process.env.FORCE_SEED === 'true') {
      console.log('\n🔄 FORCE_SEED enabled, running seed...');
      await seed(db);
      console.log('✅ Seed completed\n');
      return;
    }

    // Check if database is empty (no users)
    // This handles the case where volume is newly mounted and database is empty
    try {
      const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
      
      if (userCount === 0) {
        console.log('\n📦 Database is empty, running auto-seed...');
        await seed(db);
        console.log('✅ Auto-seed completed\n');
      } else {
        console.log(`ℹ️  Database has ${userCount} user(s), skipping auto-seed`);
      }
    } catch (error) {
      // If users table doesn't exist or query fails, try to seed
      console.log('\n📦 Database needs initialization, running auto-seed...');
      await seed(db);
      console.log('✅ Auto-seed completed\n');
    }
  } catch (error) {
    console.error('❌ Startup error:', error.message);
    // Don't exit - let the app start even if migrations/seed fail
    // This prevents deployment failures
  }
})();

// Initialize cron jobs
initCronJobs();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
