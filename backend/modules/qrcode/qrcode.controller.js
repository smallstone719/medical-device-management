const service = require('./qrcode.service');
const { success, error } = require('../../utils/response');

async function generate(req, res) {
  try {
    const result = await service.generate(req.body);
    return res.json(success(result, 'Tạo mã QR thành công'));
  } catch (err) {
    return res.status(500).json(error(err.message));
  }
}

module.exports = { generate };
