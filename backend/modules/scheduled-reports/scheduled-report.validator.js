const { body } = require('express-validator');

const createScheduledReportValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên báo cáo không được để trống')
    .isLength({ max: 200 }).withMessage('Tên báo cáo không được quá 200 ký tự'),
  
  body('schedule_type')
    .notEmpty().withMessage('Loại lịch không được để trống')
    .isIn(['daily', 'weekly', 'monthly']).withMessage('Loại lịch không hợp lệ'),
  
  body('schedule_time')
    .trim()
    .notEmpty().withMessage('Thời gian không được để trống')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Thời gian phải ở định dạng HH:MM'),
  
  body('schedule_day')
    .optional()
    .isInt({ min: 1, max: 31 }).withMessage('Ngày phải từ 1-31'),
  
  body('chat_ids')
    .optional()
    .isArray().withMessage('chat_ids phải là mảng'),
  
  body('report_type')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Loại báo cáo không được quá 50 ký tự')
];

const updateScheduledReportValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Tên báo cáo không được để trống')
    .isLength({ max: 200 }).withMessage('Tên báo cáo không được quá 200 ký tự'),
  
  body('schedule_type')
    .optional()
    .isIn(['daily', 'weekly', 'monthly']).withMessage('Loại lịch không hợp lệ'),
  
  body('schedule_time')
    .optional()
    .trim()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Thời gian phải ở định dạng HH:MM'),
  
  body('schedule_day')
    .optional()
    .isInt({ min: 1, max: 31 }).withMessage('Ngày phải từ 1-31'),
  
  body('chat_ids')
    .optional()
    .isArray().withMessage('chat_ids phải là mảng'),
  
  body('report_type')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Loại báo cáo không được quá 50 ký tự'),
  
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active phải là boolean')
];

module.exports = {
  createScheduledReportValidator,
  updateScheduledReportValidator
};
