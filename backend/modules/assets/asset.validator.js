const { body } = require('express-validator');

const createAssetValidator = [
  body('device_id')
    .optional()
    .isInt().withMessage('ID thiết bị phải là số nguyên'),
  
  body('asset_tag')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Mã tài sản không được quá 100 ký tự'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Mô tả không được quá 500 ký tự'),
  
  body('condition')
    .optional()
    .isIn(['excellent', 'good', 'fair', 'poor']).withMessage('Tình trạng không hợp lệ'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Ghi chú không được quá 1000 ký tự')
];

const updateAssetValidator = [
  body('device_id')
    .optional()
    .isInt().withMessage('ID thiết bị phải là số nguyên'),
  
  body('asset_tag')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Mã tài sản không được quá 100 ký tự'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Mô tả không được quá 500 ký tự'),
  
  body('condition')
    .optional()
    .isIn(['excellent', 'good', 'fair', 'poor']).withMessage('Tình trạng không hợp lệ'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Ghi chú không được quá 1000 ký tự')
];

module.exports = {
  createAssetValidator,
  updateAssetValidator
};
