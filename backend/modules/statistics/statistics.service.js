const db = require('../../database/db');
const cache = require('../../utils/cache');

class StatisticsService {
  static async getStatistics(filters = {}) {
    const { department_id } = filters;
    
    // Create cache key based on filters
    const cacheKey = `statistics:${department_id || 'all'}`;
    
    // Try to get from cache (5 minutes TTL)
    return cache.getOrSet(cacheKey, () => {
      return this.computeStatistics(filters);
    }, 300); // 5 minutes
  }

  static computeStatistics(filters = {}) {
    const { department_id } = filters;
    const params = department_id ? [department_id] : [];

    // Optimized: Single query for all device counts
    let deviceCountQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
      FROM devices 
      WHERE deleted_at IS NULL
    `;
    
    if (department_id) {
      deviceCountQuery += " AND department_id = ?";
    }
    
    const deviceCounts = db.prepare(deviceCountQuery).get(...params);
    const totalDevices = deviceCounts.total;
    const activeDevices = deviceCounts.active;
    const maintenanceDevices = deviceCounts.maintenance;
    const inactiveDevices = deviceCounts.inactive;

    const today = new Date().toISOString().split("T")[0];

    // Today inspections
    let todayInspectionsQuery = `
      SELECT COUNT(*) as count 
      FROM inspections i 
      JOIN devices d ON i.device_id = d.id 
      WHERE date(i.inspection_date) = date(?)
    `;
    const todayInspectionsParams = [today];
    
    if (department_id) {
      todayInspectionsQuery += " AND d.department_id = ?";
      todayInspectionsParams.push(department_id);
    }
    
    const todayInspections = db.prepare(todayInspectionsQuery).get(...todayInspectionsParams).count;

    // Inspections by day (last 30 days)
    let chartQuery = `
      SELECT date(i.inspection_date) as date, COUNT(*) as count 
      FROM inspections i 
      JOIN devices d ON i.device_id = d.id 
      WHERE date(i.inspection_date) >= date('now', '-30 days')
    `;
    
    if (department_id) {
      chartQuery += " AND d.department_id = ?";
    }
    
    chartQuery += " GROUP BY date(i.inspection_date) ORDER BY date";
    const inspectionsByDay = db.prepare(chartQuery).all(...params);

    // Inspections by status
    let statusQuery = `
      SELECT i.status, COUNT(*) as count 
      FROM inspections i 
      JOIN devices d ON i.device_id = d.id
    `;
    
    if (department_id) {
      statusQuery += " WHERE d.department_id = ?";
    }
    
    statusQuery += " GROUP BY i.status";
    const inspectionsByStatus = db.prepare(statusQuery).all(...params);

    // Devices not inspected today - Optimized with LEFT JOIN instead of NOT IN
    let notInspectedQuery = `
      SELECT d.* 
      FROM devices d 
      LEFT JOIN inspections i ON d.id = i.device_id 
        AND date(i.inspection_date) = date(?)
        AND i.deleted_at IS NULL
      WHERE d.status = 'active' 
        AND d.deleted_at IS NULL
        AND i.id IS NULL
    `;
    
    const notInspectedParams = [today];
    
    if (department_id) {
      notInspectedQuery += " AND d.department_id = ?";
      notInspectedParams.push(department_id);
    }
    
    notInspectedQuery += " ORDER BY d.name";
    
    const devicesNotInspectedToday = db.prepare(notInspectedQuery).all(...notInspectedParams);

    // Recent inspections
    let recentQuery = `
      SELECT i.*, d.name as device_name, d.location 
      FROM inspections i 
      JOIN devices d ON i.device_id = d.id
    `;
    
    if (department_id) {
      recentQuery += " WHERE d.department_id = ?";
    }
    
    recentQuery += " ORDER BY i.inspection_date DESC LIMIT 10";
    const recentInspections = db.prepare(recentQuery).all(...params);

    return {
      devices: {
        total: totalDevices,
        active: activeDevices,
        maintenance: maintenanceDevices,
        inactive: inactiveDevices
      },
      inspections: {
        today: todayInspections,
        byDay: inspectionsByDay,
        byStatus: inspectionsByStatus
      },
      devicesNotInspectedToday,
      recentInspections
    };
  }
  // ─── Invalidate cache when data changes ──────────────────────────────
  static invalidateCache(department_id = null) {
    const cache = require('../../utils/cache');
    
    if (department_id) {
      cache.delete(`statistics:${department_id}`);
    } else {
      // Invalidate all statistics cache
      cache.delete('statistics:all');
    }
  }
}

module.exports = StatisticsService;
