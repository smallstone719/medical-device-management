const service = require('./export.service');
const { error } = require('../../utils/response');

async function exportDevices(req, res) {
  try {
    const filepath = await service.exportDevices();
    res.download(filepath);
  } catch (err) {
    return res.status(500).json(error(err.message));
  }
}

async function exportAssets(req, res) {
  try {
    const filepath = await service.exportAssets();
    res.download(filepath);
  } catch (err) {
    return res.status(500).json(error(err.message));
  }
}

module.exports = { exportDevices, exportAssets };
