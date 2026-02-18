const bcrypt = require('bcryptjs');
const db = require('../../database/db');
const ConfigModel = require('../config/config.model');
const { seed } = require('../../database/seeds/seed');

class SetupService {
  static isFirstTimeSetup() {
    const admin = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
    return !admin;
  }

  static async createAdminAccount(data) {
    const { full_name, username, password, email, subdomain, import_demo_data, domain_type, custom_domain } = data;

    if (!full_name || !username || !password) {
      throw new Error('Vui lòng điền đầy đủ thông tin');
    }

    if (password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }

    // Check if already setup
    if (!this.isFirstTimeSetup()) {
      throw new Error('Hệ thống đã được cài đặt');
    }

    try {
      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create admin user
      const result = db.prepare(`
        INSERT INTO users (username, password_hash, email, full_name, role, is_active)
        VALUES (?, ?, ?, ?, 'admin', 1)
      `).run(username, password_hash, email || null, full_name);

      const adminId = result.lastInsertRowid;

      // Save domain type
      const domainTypeValue = domain_type || 'nport';
      ConfigModel.set('domain_type', domainTypeValue, adminId);

      // Save subdomain if provided
      if (subdomain) {
        ConfigModel.set('tunnel_subdomain', subdomain, adminId);
      }

      let expectedTunnelUrl;

      if (domainTypeValue === 'custom' && custom_domain) {
        // Custom domain mode
        ConfigModel.set('custom_domain', custom_domain, adminId);
        expectedTunnelUrl = custom_domain.startsWith('http') ? custom_domain : `https://${custom_domain}`;
        ConfigModel.set('domain_url', expectedTunnelUrl, adminId);
      } else {
        // Nport mode
        const savedSubdomain = subdomain || this.generateSubdomain();
        if (!subdomain) {
          ConfigModel.set('tunnel_subdomain', savedSubdomain, adminId);
        }
        expectedTunnelUrl = `https://${savedSubdomain}.nport.link`;
        ConfigModel.set('domain_url', expectedTunnelUrl, adminId);
      }

      // Import demo data if requested
      if (import_demo_data) {
        console.log('📥 Importing demo data...');
        await seed(db);
      }

      return {
        success: true,
        message: 'Cài đặt thành công',
        tunnelUrl: expectedTunnelUrl,
        subdomain: subdomain || ConfigModel.getByKey('tunnel_subdomain')?.value,
        domainType: domainTypeValue
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static generateSubdomain() {
    return 'vicas-' + Math.floor(100000 + Math.random() * 900000);
  }

  static getSetupStatus() {
    return {
      needsSetup: this.isFirstTimeSetup()
    };
  }
}

module.exports = SetupService;
