const ExcelJS = require('exceljs');
const path = require('path');
const db = require('../../database/db');

async function exportDevices() {
  const devices = db.prepare('SELECT * FROM devices').all();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Devices');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Model', key: 'model', width: 20 },
    { header: 'Serial Number', key: 'serial_number', width: 20 },
    { header: 'Status', key: 'status', width: 15 }
  ];

  worksheet.addRows(devices);

  const filename = `devices-${Date.now()}.xlsx`;
  const filepath = path.join(__dirname, '../../storage/exports', filename);
  await workbook.xlsx.writeFile(filepath);

  return filepath;
}

async function exportAssets() {
  const assets = db.prepare('SELECT * FROM assets').all();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Assets');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Asset Tag', key: 'asset_tag', width: 20 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Condition', key: 'condition', width: 15 }
  ];

  worksheet.addRows(assets);

  const filename = `assets-${Date.now()}.xlsx`;
  const filepath = path.join(__dirname, '../../storage/exports', filename);
  await workbook.xlsx.writeFile(filepath);

  return filepath;
}

module.exports = { exportDevices, exportAssets };
