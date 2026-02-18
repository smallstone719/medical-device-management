const ConfigModel = require('../config/config.model');
const db = require('../../database/db');

// This will be initialized with ZaloBot instance from server.js
let zaloBotInstance = null;

class ZaloService {
  static setZaloBotInstance(instance) {
    zaloBotInstance = instance;
  }

  static async handleWebhook(data) {
    if (!zaloBotInstance) {
      throw new Error('ZaloBot not initialized');
    }
    return await zaloBotInstance.handleWebhook(data);
  }

  static subscribe(chatId) {
    if (!zaloBotInstance) {
      throw new Error('ZaloBot not initialized');
    }
    zaloBotInstance.addNotificationChatId(chatId);
    return { success: true, message: `Đã đăng ký ${chatId} nhận thông báo` };
  }

  static getSubscribers() {
    if (!zaloBotInstance) {
      return { subscribers: [] };
    }
    return { subscribers: zaloBotInstance.getNotificationChatIds() };
  }

  static async getStatus() {
    if (!zaloBotInstance) {
      return { connected: false, bot: null, subscribers: [], tokenMasked: null };
    }

    const botInfo = await zaloBotInstance.testConnection();
    return {
      connected: !!botInfo,
      bot: botInfo,
      subscribers: zaloBotInstance.getNotificationChatIds(),
      tokenMasked: zaloBotInstance.getTokenMasked()
    };
  }

  static async updateToken(token) {
    if (!token) {
      throw new Error('Token is required');
    }

    // Save to database
    ConfigModel.set('zalo_token', token);

    // Update in memory
    if (zaloBotInstance) {
      zaloBotInstance.setToken(token);
    }

    // Test connection
    const botInfo = zaloBotInstance ? await zaloBotInstance.testConnection() : null;
    
    if (botInfo) {
      return {
        success: true,
        message: 'Token updated successfully',
        bot: botInfo
      };
    } else {
      return {
        success: false,
        message: 'Token saved but connection failed. Please check the token.'
      };
    }
  }

  static disconnect() {
    // Remove token from database
    ConfigModel.delete('zalo_token');

    // Disconnect bot
    if (zaloBotInstance) {
      zaloBotInstance.disconnect();
    }

    return { success: true, message: 'Bot disconnected' };
  }
}

module.exports = ZaloService;
