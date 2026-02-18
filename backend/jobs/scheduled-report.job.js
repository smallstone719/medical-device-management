const db = require('../database/db');
const logger = require('../utils/logger');

/**
 * Generate report based on type - Optimized with SQL filtering
 */
async function generateReport(reportType) {
  const today = new Date().toISOString().split('T')[0];
  let message = '';
  
  if (reportType === 'uninspected') {
    // Optimized: Use SQL to filter devices that need inspection
    const devices = db.prepare(`
      SELECT 
        d.id, 
        d.name, 
        d.location, 
        d.inspection_frequency,
        MAX(i.inspection_date) as last_inspection
      FROM devices d 
      LEFT JOIN inspections i ON d.id = i.device_id AND i.deleted_at IS NULL
      WHERE d.status = 'active' 
        AND d.deleted_at IS NULL
        AND d.inspection_frequency != 'irregular'
      GROUP BY d.id, d.name, d.location, d.inspection_frequency
    `).all();
    
    const uninspected = devices.filter(d => {
      if (!d.last_inspection) return true; // Never inspected
      
      const last = new Date(d.last_inspection);
      const freq = d.inspection_frequency || 'monthly';
      let nextDue = new Date(last);
      
      switch(freq) {
        case 'daily': nextDue.setDate(last.getDate() + 1); break;
        case 'weekly': nextDue.setDate(last.getDate() + 7); break;
        case 'monthly': nextDue.setMonth(last.getMonth() + 1); break;
        case 'quarterly': nextDue.setMonth(last.getMonth() + 3); break;
        case 'yearly': nextDue.setFullYear(last.getFullYear() + 1); break;
        default: nextDue.setMonth(last.getMonth() + 1); // Default monthly
      }
      
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      nextDue.setHours(0, 0, 0, 0);
      
      return nextDue <= todayDate;
    });
    
    if (uninspected.length === 0) {
      message = `✅ BÁO CÁO KIỂM TRA\n📅 ${today}\n\nTất cả thiết bị đến hạn đã được kiểm tra!`;
    } else {
      message = `⚠️ BÁO CÁO THIẾT BỊ CẦN KIỂM TRA\n📅 ${today}\n\nCó ${uninspected.length} thiết bị đến hạn:\n\n`;
      uninspected.slice(0, 20).forEach((d, i) => { // Limit to 20 items
        message += `${i + 1}. ${d.name} (${d.inspection_frequency || 'monthly'})\n   📍 ${d.location || 'N/A'}\n`;
      });
      
      if (uninspected.length > 20) {
        message += `\n... và ${uninspected.length - 20} thiết bị khác`;
      }
    }
  } else if (reportType === 'summary') {
    // Optimized: Single query for all stats
    const stats = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM devices WHERE deleted_at IS NULL) as total,
        (SELECT COUNT(*) FROM devices WHERE status = 'active' AND deleted_at IS NULL) as active,
        (SELECT COUNT(*) FROM inspections WHERE date(inspection_date) = date(?) AND deleted_at IS NULL) as todayInspections,
        (SELECT COUNT(*) FROM inspections WHERE date(inspection_date) = date(?) AND status IN ('issue', 'critical') AND deleted_at IS NULL) as issues
    `).get(today, today);
    
    message = `📊 BÁO CÁO TỔNG HỢP\n📅 ${today}\n\n📱 Tổng thiết bị: ${stats.total}\n✅ Đang hoạt động: ${stats.active}\n📋 Kiểm tra hôm nay: ${stats.todayInspections}\n⚠️ Có vấn đề: ${stats.issues}`;
  }
  
  return message;
}

/**
 * Check and run scheduled reports - Optimized with better time matching
 */
async function checkScheduledReports() {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    const currentDay = now.getDay(); // 0-6
    const currentDate = now.getDate(); // 1-31
    
    // Only get schedules that match current time (optimized query)
    const schedules = db.prepare(`
      SELECT * FROM scheduled_reports 
      WHERE is_active = 1 
        AND deleted_at IS NULL 
        AND schedule_time = ?
    `).all(currentTime);
    
    if (schedules.length === 0) {
      return; // No schedules to run at this time
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    for (const schedule of schedules) {
      let shouldRun = false;
      
      const lastRun = schedule.last_run ? new Date(schedule.last_run) : null;
      
      // Check if already ran today
      if (!lastRun || lastRun.toISOString().split('T')[0] !== today) {
        if (schedule.schedule_type === 'daily') {
          shouldRun = true;
        } else if (schedule.schedule_type === 'weekly' && schedule.schedule_day === currentDay) {
          shouldRun = true;
        } else if (schedule.schedule_type === 'monthly' && schedule.schedule_day === currentDate) {
          shouldRun = true;
        } else if (schedule.schedule_type === 'quarterly') {
          const month = now.getMonth();
          if ([0, 3, 6, 9].includes(month) && currentDate === (schedule.schedule_day || 1)) {
            shouldRun = true;
          }
        }
      }
      
      if (shouldRun) {
        logger.info(`Running scheduled report: ${schedule.name}`);
        
        try {
          const report = await generateReport(schedule.report_type);
          const chatIds = JSON.parse(schedule.chat_ids || '[]');
          
          // Send to Zalo (if ZaloBot is available)
          try {
            const ZaloBot = require('../services/zalobot.service');
            for (const chatId of chatIds) {
              await ZaloBot.sendMessage(chatId, report);
            }
          } catch (err) {
            logger.warn('ZaloBot not available or failed:', err.message);
          }
          
          // Update last run
          db.prepare('UPDATE scheduled_reports SET last_run = ?, updated_at = ? WHERE id = ?')
            .run(now.toISOString(), now.toISOString(), schedule.id);
          
          logger.info(`Scheduled report "${schedule.name}" completed successfully`);
        } catch (error) {
          logger.error(`Failed to run scheduled report "${schedule.name}":`, error);
        }
      }
    }
  } catch (error) {
    logger.error('Scheduled report job failed:', error);
  }
}

module.exports = {
  checkScheduledReports,
  generateReport
};
