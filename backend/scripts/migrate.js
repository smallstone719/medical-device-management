const fs = require('fs');
const path = require('path');
const db = require('../database/db');

const MIGRATIONS_DIR = path.join(__dirname, '../database/migrations');
const MIGRATIONS_TABLE = 'schema_migrations';

// Tạo bảng theo dõi migrations nếu chưa có
function initMigrationsTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      migration_name TEXT NOT NULL UNIQUE,
      executed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// Lấy danh sách migrations đã chạy
function getExecutedMigrations() {
  const rows = db.prepare(`SELECT migration_name FROM ${MIGRATIONS_TABLE}`).all();
  return rows.map(row => row.migration_name);
}

// Đánh dấu migration đã chạy
function markMigrationExecuted(migrationName) {
  db.prepare(`INSERT INTO ${MIGRATIONS_TABLE} (migration_name) VALUES (?)`).run(migrationName);
}

// Chạy migrations
async function runMigrations() {
  console.log('🔄 Starting migrations...\n');
  
  try {
    initMigrationsTable();
    const executedMigrations = getExecutedMigrations();
    
    // Lấy tất cả file migration và sắp xếp theo thứ tự
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.js') && file !== 'README.md')
      .sort();
    
    let newMigrationsCount = 0;
    
    for (const file of migrationFiles) {
      const migrationName = file.replace('.js', '');
      
      // Skip nếu đã chạy rồi
      if (executedMigrations.includes(migrationName)) {
        console.log(`⏭️  Skipping ${migrationName} (already executed)`);
        continue;
      }
      
      try {
        console.log(`▶️  Running ${migrationName}...`);
        const migration = require(path.join(MIGRATIONS_DIR, file));
        
        // Chạy migration trong transaction
        db.transaction(() => {
          migration.up();
          markMigrationExecuted(migrationName);
        })();
        
        console.log(`✅ Completed ${migrationName}\n`);
        newMigrationsCount++;
      } catch (error) {
        console.error(`❌ Error running ${migrationName}:`, error.message);
        throw error;
      }
    }
    
    if (newMigrationsCount === 0) {
      console.log('✨ No new migrations to run. Database is up to date!');
    } else {
      console.log(`\n✅ Successfully ran ${newMigrationsCount} migration(s)`);
    }
    
    return { success: true, count: newMigrationsCount };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Rollback migration cuối cùng
function rollbackLastMigration() {
  console.log('🔄 Rolling back last migration...\n');
  
  initMigrationsTable();
  
  const lastMigration = db.prepare(`
    SELECT migration_name 
    FROM ${MIGRATIONS_TABLE} 
    ORDER BY id DESC 
    LIMIT 1
  `).get();
  
  if (!lastMigration) {
    console.log('ℹ️  No migrations to rollback');
    return;
  }
  
  try {
    const migrationFile = `${lastMigration.migration_name}.js`;
    const migration = require(path.join(MIGRATIONS_DIR, migrationFile));
    
    console.log(`▶️  Rolling back ${lastMigration.migration_name}...`);
    
    db.transaction(() => {
      migration.down();
      db.prepare(`DELETE FROM ${MIGRATIONS_TABLE} WHERE migration_name = ?`)
        .run(lastMigration.migration_name);
    })();
    
    console.log(`✅ Rolled back ${lastMigration.migration_name}`);
  } catch (error) {
    console.error(`❌ Error rolling back:`, error.message);
    throw error;
  }
}

// Hiển thị trạng thái migrations
function showMigrationStatus() {
  initMigrationsTable();
  
  const executedMigrations = getExecutedMigrations();
  const allMigrations = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.js') && file !== 'README.md')
    .map(file => file.replace('.js', ''))
    .sort();
  
  console.log('\n📊 Migration Status:\n');
  console.log('Migration Name'.padEnd(50), 'Status');
  console.log('='.repeat(70));
  
  for (const migration of allMigrations) {
    const status = executedMigrations.includes(migration) ? '✅ Executed' : '⏳ Pending';
    console.log(migration.padEnd(50), status);
  }
  
  console.log('\n');
  console.log(`Total: ${allMigrations.length} migrations`);
  console.log(`Executed: ${executedMigrations.length}`);
  console.log(`Pending: ${allMigrations.length - executedMigrations.length}`);
}

module.exports = {
  runMigrations,
  rollbackLastMigration,
  showMigrationStatus
};
