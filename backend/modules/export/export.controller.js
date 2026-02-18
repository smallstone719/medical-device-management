const service = require('./export.service');
const { error } = require('../../utils/response');

async function exportDevices(req, res) {
  try {
    const filters = {
      status: req.query.status,
      department_id: req.query.department_id,
      category_id: req.query.category_id,
      limit: parseInt(req.query.limit) || 10000,
      offset: parseInt(req.query.offset) || 0
    };
    
    const result = await service.exportDevices(filters);
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    
    res.download(result.filepath, result.filename, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (err) {
    return res.status(500).json(error(err.message));
  }
}

async function exportInspections(req, res) {
  try {
    const filters = {
      device_id: req.query.device_id,
      status: req.query.status,
      from_date: req.query.from_date,
      to_date: req.query.to_date,
      limit: parseInt(req.query.limit) || 10000,
      offset: parseInt(req.query.offset) || 0
    };
    
    const result = await service.exportInspections(filters);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    
    res.download(result.filepath, result.filename, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (err) {
    return res.status(500).json(error(err.message));
  }
}

module.exports = { exportDevices, exportInspections };
