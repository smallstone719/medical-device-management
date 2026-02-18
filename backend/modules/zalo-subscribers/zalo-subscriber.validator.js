const { body } = require('express-validator');

const createZaloSubscriberValidator = [
  body('chat_id')
    .trim()
    .notEmpty().withMessage('Chat ID không được để trống')
    .isLength({ max: 100 }).withMessage('Chat ID không được quá 100 ký tự'),
  
  body('display_name')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Tên hiển thị không được quá 200 ký tự'),
  
  body('department_id')
    .optional()
    .isInt().withMessage('ID phòng ban phải là số nguyên')
];

const updateZaloSubscriberValidator = [
  body('display_name')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Tên hiển thị không được quá 200 ký tự'),
  
  body('department_id')
    .optional()
    .isInt().withMessage('ID phòng ban phải là số nguyên')
];

module.exports = {
  createZaloSubscriberValidator,
  updateZaloSubscriberValidator
};
