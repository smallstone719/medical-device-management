const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'app.db');

// Tạo thư mục nếu chưa tồn tại
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Singleton - chỉ tạo 1 kết nối duy nhất trong suốt vòng đời app
const db = new Database(DB_PATH, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : null,
});

// Bật WAL mode để tăng hiệu suất đọc/ghi đồng thời
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
