require('dotenv').config();
const db = require('../backend/database/db');
const { seed } = require('../backend/database/seeds/seed');

console.log('🌱 Seeding database...');

seed(db).then(() => {
  console.log('✅ Seeding completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
