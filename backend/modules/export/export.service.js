const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs').promises;
const db = require('../../database/db');

async function exportDevices(filters = {}) {
  const { limit = 10000, offset = 0 } = filters; // Default max 10k rows
  
  // Build query with filters and pagination
  let query = 'SELECT * FROM devices WHERE deleted_at IS NULL';
  const params = [];
  
  // Add filters if provided
  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }
  
  if (filters.department_id) {
    query += ' AND department_id = ?';
    params.push(filters.department_id);
  }
  
  if (filters.category_id) {
    query += ' AND category_id = ?';
    params.push(filters.category_id);
  }
  
  // Add pagination
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const devices = db.prepare(query).all(...params);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Devices');

  // Enhanced columns
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Tên thiết bị', key: 'name', width: 30 },
    { header: 'Model', key: 'model', width: 20 },
    { header: 'Số serial', key: 'serial_number', width: 20 },
    { header: 'Nhà sản xuất', key: 'manufacturer', width: 20 },
    { header: 'Vị trí', key: 'location', width: 25 },
    { header: 'Trạng thái', key: 'status', width: 15 },
    { header: 'Ngày mua', key: 'purchase_date', width: 15 },
    { header: 'Hết bảo hành', key: 'warranty_expiry', width: 15 }
  ];

  // Style header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  worksheet.addRows(devices);

  const filename = `devices-${Date.now()}.xlsx`;
  const exportDir = path.join(__dirname, '../../storage/exports');
  
  // Ensure export directory exists
  await fs.mkdir(exportDir, { recursive: true });
  
  const filepath = path.join(exportDir, filename);
  await workbook.xlsx.writeFile(filepath);

  // Schedule file cleanup after 1 hour
  setTimeout(async () => {
    try {
      await fs.unlink(filepath);
    } catch (err) {
      // File might already be deleted
    }
  }, 60 * 60 * 1000);

  return { filepath, filename, count: devices.length };
}

async function exportInspections(filters = {}) {
  const { limit = 10000, offset = 0 } = filters;
  
  let query = `
    SELECT 
      i.*,
      d.name as device_name,
      d.serial_number,
      d.location
    FROM inspections i
    LEFT JOIN devices d ON i.device_id = d.id
    WHERE i.deleted_at IS NULL
  `;
  const params = [];
  
  if (filters.device_id) {
    query += ' AND i.device_id = ?';
    params.push(filters.device_id);
  }
  
  if (filters.status) {
    query += ' AND i.status = ?';
    params.push(filters.status);
  }
  
  if (filters.from_date) {
    query += ' AND date(i.inspection_date) >= date(?)';
    params.push(filters.from_date);
  }
  
  if (filters.to_date) {
    query += ' AND date(i.inspection_date) <= date(?)';
    params.push(filters.to_date);
  }
  
  query += ' ORDER BY i.inspection_date DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const inspections = db.prepare(query).all(...params);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Inspections');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Thiết bị', key: 'device_name', width: 30 },
    { header: 'Số serial', key: 'serial_number', width: 20 },
    { header: 'Vị trí', key: 'location', width: 25 },
    { header: 'Người kiểm tra', key: 'inspector_name', width: 20 },
    { header: 'Ngày kiểm tra', key: 'inspection_date', width: 20 },
    { header: 'Trạng thái', key: 'status', width: 15 },
    { header: 'Ghi chú', key: 'notes', width: 40 }
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  worksheet.addRows(inspections);

  const filename = `inspections-${Date.now()}.xlsx`;
  const exportDir = path.join(__dirname, '../../storage/exports');
  await fs.mkdir(exportDir, { recursive: true });
  
  const filepath = path.join(exportDir, filename);
  await workbook.xlsx.writeFile(filepath);

  // Auto cleanup after 1 hour
  setTimeout(async () => {
    try {
      await fs.unlink(filepath);
    } catch (err) {}
  }, 60 * 60 * 1000);

  return { filepath, filename, count: inspections.length };
}

module.exports = { exportDevices, exportInspections };
