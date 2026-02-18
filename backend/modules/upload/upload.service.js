const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processImage(file) {
  const filename = `optimized-${Date.now()}.jpg`;
  const outputPath = path.join(__dirname, '../../storage/images', filename);

  await sharp(file.path)
    .resize(800, 600, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toFile(outputPath);

  // Delete temp file
  fs.unlinkSync(file.path);

  return { filename, path: `/uploads/images/${filename}` };
}

module.exports = { processImage };
