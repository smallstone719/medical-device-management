const { body } = require('express-validator');

const createTicketValidator = [
  body('device_id')
    .notEmpty().withMessage('ID thiết bị không được để trống')
    .isInt().withMessage('ID thiết bị phải là số nguyên'),
  
  body('title')
    .trim()
    .notEmpty().withMessage('Tiêu đề không được để trống')
    .isLength({ max: 200 }).withMessage('Tiêu đề không được quá 200 ký tự'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Mô tả không được quá 2000 ký tự'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Mức độ ưu tiên không hợp lệ'),
  
  body('assigned_to')
    .optional()
    .isInt().withMessage('ID người được gán phải là số nguyên')
];

const updateTicketValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Tiêu đề không được để trống')
    .isLength({ max: 200 }).withMessage('Tiêu đề không được quá 200 ký tự'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Mô tả không được quá 2000 ký tự'),
  
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Trạng thái không hợp lệ'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Mức độ ưu tiên không hợp lệ'),
  
  body('assigned_to')
    .optional()
    .isInt().withMessage('ID người được gán phải là số nguyên')
];

const createReplyValidator = [
  body('message')
    .trim()
    .notEmpty().withMessage('Nội dung phản hồi không được để trống')
    .isLength({ max: 1000 }).withMessage('Nội dung phản hồi không được quá 1000 ký tự')
];

module.exports = {
  createTicketValidator,
  updateTicketValidator,
  createReplyValidator
};
