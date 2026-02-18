const { body } = require('express-validator');

const createInspectionValidator = [
  body('device_id')
    .notEmpty().withMessage('ID thiết bị không được để trống')
    .isInt().withMessage('ID thiết bị phải là số nguyên'),
  
  body('inspector_name')
    .trim()
    .notEmpty().withMessage('Tên người kiểm tra không được để trống')
    .isLength({ max: 100 }).withMessage('Tên người kiểm tra không được quá 100 ký tự'),
  
  body('user_id')
    .optional()
    .isInt().withMessage('ID người dùng phải là số nguyên'),
  
  body('status')
    .notEmpty().withMessage('Trạng thái không được để trống')
    .isIn(['good', 'issue', 'critical']).withMessage('Trạng thái không hợp lệ'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Ghi chú không được quá 1000 ký tự'),
  
  body('issues')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Vấn đề không được quá 1000 ký tự'),
  
  body('images')
    .optional()
    .isArray().withMessage('Hình ảnh phải là mảng'),
  
  body('inspection_date')
    .optional()
    .isISO8601().withMessage('Ngày kiểm tra không hợp lệ')
];

const updateInspectionValidator = [
  body('status')
    .optional()
    .isIn(['good', 'issue', 'critical']).withMessage('Trạng thái không hợp lệ'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Ghi chú không được quá 1000 ký tự'),
  
  body('issues')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Vấn đề không được quá 1000 ký tự'),
  
  body('images')
    .optional()
    .isArray().withMessage('Hình ảnh phải là mảng')
];

module.exports = {
  createInspectionValidator,
  updateInspectionValidator
};
