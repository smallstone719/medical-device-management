const db = require('../../database/db');

class ConfigModel {
  static getAll() {
    return db.prepare('SELECT key, value FROM system_config').all();
  }

  static getByKey(key) {
    return db.prepare('SELECT value FROM system_config WHERE key = ?').get(key);
  }

  static set(key, value, userId = null) {
    const existing = this.getByKey(key);
    
    if (existing) {
      return db.prepare(`
        UPDATE system_config 
        SET value = ?, updated_by = ?, updated_at = datetime('now')
        WHERE key = ?
      `).run(value, userId, key);
    } else {
      return db.prepare(`
        INSERT INTO system_config (key, value, created_by, updated_by)
        VALUES (?, ?, ?, ?)
      `).run(key, value, userId, userId);
    }
  }

  static setMultiple(entries, userId = null) {
    const transaction = db.transaction((items) => {
      for (const { key, value } of items) {
        this.set(key, value, userId);
      }
    });
    
    return transaction(entries);
  }

  static delete(key) {
    return db.prepare('DELETE FROM system_config WHERE key = ?').run(key);
  }

  static getAllAsObject() {
    const configs = this.getAll();
    const result = {};
    configs.forEach(c => result[c.key] = c.value);
    return result;
  }
}

module.exports = ConfigModel;
