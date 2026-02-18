const ConfigModel = require('../config/config.model');

// This will be initialized with tunnel info from server.js
let tunnelInfoInstance = null;

class TunnelService {
  static setTunnelInfoInstance(instance) {
    tunnelInfoInstance = instance;
  }

  static getInfo() {
    if (!tunnelInfoInstance) {
      return {
        connected: false,
        url: null,
        subdomain: null
      };
    }

    const savedSubdomain = ConfigModel.getByKey('tunnel_subdomain');
    
    return {
      connected: tunnelInfoInstance.connected,
      url: tunnelInfoInstance.url,
      subdomain: tunnelInfoInstance.subdomain || savedSubdomain?.value
    };
  }

  static generateSubdomain() {
    return 'vicas-' + Math.floor(100000 + Math.random() * 900000);
  }

  static getOrCreateSubdomain() {
    const saved = ConfigModel.getByKey('tunnel_subdomain');
    if (saved && saved.value) return saved.value;

    const newSubdomain = this.generateSubdomain();
    ConfigModel.set('tunnel_subdomain', newSubdomain);
    return newSubdomain;
  }
}

module.exports = TunnelService;
