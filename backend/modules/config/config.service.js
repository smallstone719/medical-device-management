const ConfigModel = require('./config.model');

class ConfigService {
  static getAll() {
    return ConfigModel.getAllAsObject();
  }

  static get(key) {
    const config = ConfigModel.getByKey(key);
    return config ? config.value : null;
  }

  static set(key, value, userId = null) {
    ConfigModel.set(key, value, userId);
    return { success: true };
  }

  static setMultiple(entries, userId = null) {
    if (!Array.isArray(entries)) {
      throw new Error('Entries must be an array');
    }

    ConfigModel.setMultiple(entries, userId);
    return { success: true };
  }

  static delete(key) {
    ConfigModel.delete(key);
    return { success: true };
  }
}

module.exports = ConfigService;
