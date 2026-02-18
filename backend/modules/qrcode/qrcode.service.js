const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

async function generate(data) {
  const qrData = JSON.stringify(data);
  const filename = `qr-${Date.now()}.png`;
  const filepath = path.join(__dirname, '../../storage/qrcodes', filename);

  await QRCode.toFile(filepath, qrData);

  return { filename, path: `/uploads/qrcodes/${filename}` };
}

module.exports = { generate };
