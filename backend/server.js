require('dotenv').config({ path: '../.env' });
const app = require('./app');
const logger = require('./utils/logger');
const { initCronJobs } = require('./config/cron');

const PORT = process.env.PORT || 3000;

// Database connection is initialized on require
console.log('✅ Database connected');

// Initialize cron jobs
initCronJobs();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
