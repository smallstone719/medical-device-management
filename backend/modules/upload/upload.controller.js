const service = require('./upload.service');
const { success, error } = require('../../utils/response');

async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json(error('Không có file được tải lên'));
    }
    const result = await service.processImage(req.file);
    return res.json(success(result, 'Tải ảnh lên thành công'));
  } catch (err) {
    return res.status(500).json(error(err.message));
  }
}

module.exports = { uploadImage };
