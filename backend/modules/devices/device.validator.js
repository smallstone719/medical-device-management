const { body } = require('express-validator');

const createDeviceValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên thiết bị không được để trống')
    .isLength({ max: 200 }).withMessage('Tên thiết bị không được quá 200 ký tự'),
  
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Model không được quá 100 ký tự'),
  
  body('serial_number')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Số serial không được quá 100 ký tự'),
  
  body('manufacturer')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Nhà sản xuất không được quá 100 ký tự'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Vị trí không được quá 200 ký tự'),
  
  body('department_id')
    .optional()
    .isInt().withMessage('ID phòng ban phải là số nguyên'),
  
  body('category_id')
    .optional()
    .isInt().withMessage('ID danh mục phải là số nguyên'),
  
  body('purchase_date')
    .optional()
    .isISO8601().withMessage('Ngày mua không hợp lệ'),
  
  body('warranty_expiry')
    .optional()
    .isISO8601().withMessage('Ngày hết hạn bảo hành không hợp lệ'),
  
  body('usage_start_date')
    .optional()
    .isISO8601().withMessage('Ngày bắt đầu sử dụng không hợp lệ'),
  
  body('next_maintenance_date')
    .optional()
    .isISO8601().withMessage('Ngày bảo trì tiếp theo không hợp lệ'),
  
  body('last_maintenance_date')
    .optional()
    .isISO8601().withMessage('Ngày bảo trì cuối không hợp lệ'),
  
  body('status')
    .optional()
    .isIn(['active', 'maintenance', 'inactive', 'retired', 'broken']).withMessage('Trạng thái không hợp lệ'),
  
  body('require_auth')
    .optional()
    .isBoolean().withMessage('require_auth phải là boolean'),
  
  body('inspection_frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Tần suất kiểm tra không hợp lệ'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Ghi chú không được quá 1000 ký tự')
];

const updateDeviceValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Tên thiết bị không được để trống')
    .isLength({ max: 200 }).withMessage('Tên thiết bị không được quá 200 ký tự'),
  
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Model không được quá 100 ký tự'),
  
  body('serial_number')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Số serial không được quá 100 ký tự'),
  
  body('manufacturer')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Nhà sản xuất không được quá 100 ký tự'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Vị trí không được quá 200 ký tự'),
  
  body('department_id')
    .optional()
    .isInt().withMessage('ID phòng ban phải là số nguyên'),
  
  body('category_id')
    .optional()
    .isInt().withMessage('ID danh mục phải là số nguyên'),
  
  body('purchase_date')
    .optional()
    .isISO8601().withMessage('Ngày mua không hợp lệ'),
  
  body('warranty_expiry')
    .optional()
    .isISO8601().withMessage('Ngày hết hạn bảo hành không hợp lệ'),
  
  body('usage_start_date')
    .optional()
    .isISO8601().withMessage('Ngày bắt đầu sử dụng không hợp lệ'),
  
  body('next_maintenance_date')
    .optional()
    .isISO8601().withMessage('Ngày bảo trì tiếp theo không hợp lệ'),
  
  body('last_maintenance_date')
    .optional()
    .isISO8601().withMessage('Ngày bảo trì cuối không hợp lệ'),
  
  body('status')
    .optional()
    .isIn(['active', 'maintenance', 'inactive', 'retired', 'broken']).withMessage('Trạng thái không hợp lệ'),
  
  body('require_auth')
    .optional()
    .isBoolean().withMessage('require_auth phải là boolean'),
  
  body('inspection_frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Tần suất kiểm tra không hợp lệ'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Ghi chú không được quá 1000 ký tự')
];

module.exports = {
  createDeviceValidator,
  updateDeviceValidator
};
