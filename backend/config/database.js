const path = require('path');

module.exports = {
  dbPath: process.env.DB_PATH || path.join(__dirname, '../database/data/app.db'),
  options: {
    verbose: process.env.NODE_ENV === 'development' ? console.log : null
  }
};
