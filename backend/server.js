require('dotenv').config({ path: '../.env' });
const app = require('./app');
const db = require('./database/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// Database connection is initialized on require
console.log('✅ Database connected');

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
