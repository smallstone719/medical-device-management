require('dotenv').config();
const db = require('../backend/database/db');
const fs = require('fs');
const path = require('path');

console.log('🔄 Running migrations...');

const migrationsDir = path.join(__dirname, '../backend/database/migrations');
const files = fs.readdirSync(migrationsDir).sort();

files.forEach(file => {
  if (file.endsWith('.js')) {
    console.log(`Running migration: ${file}`);
    const migration = require(path.join(migrationsDir, file));
    migration.up();
  }
});

console.log('✅ All migrations completed');
