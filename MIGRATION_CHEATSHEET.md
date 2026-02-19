# Migration Cheat Sheet 📝

## Commands

```bash
# Xem trạng thái
node scripts/run-migrations.js status

# Chạy migrations
node scripts/run-migrations.js up

# Rollback
node scripts/run-migrations.js down
```

## Railway Deploy

```bash
git push origin main  # Migrations tự động chạy! ✅
```

## Tạo Migration Mới

```javascript
// backend/database/migrations/014_your_migration.js
const db = require('../db');

const up = () => {
  db.exec(`ALTER TABLE users ADD COLUMN new_field TEXT;`);
};

const down = () => {
  // Rollback logic
};

module.exports = { up, down };
```

## Kiểm Tra An Toàn

```javascript
// Kiểm tra cột đã tồn tại chưa
const columns = db.prepare(`PRAGMA table_info(users)`).all();
const hasColumn = columns.some(col => col.name === 'new_field');

if (!hasColumn) {
  db.exec(`ALTER TABLE users ADD COLUMN new_field TEXT;`);
}
```

## Docs

- [Quick Start](./RAILWAY_QUICKSTART.md)
- [Full Guide](./RAILWAY_DEPLOYMENT.md)
- [Checklist](./.railway-checklist.md)
