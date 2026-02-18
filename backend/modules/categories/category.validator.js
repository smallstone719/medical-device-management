const { body } = require('express-validator');

const createCategoryValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên danh mục không được để trống')
    .isLength({ max: 100 }).withMessage('Tên danh mục không được quá 100 ký tự'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Mô tả không được quá 500 ký tự'),
  
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Màu sắc phải ở định dạng hex (#RRGGBB)')
];

const updateCategoryValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Tên danh mục không được để trống')
    .isLength({ max: 100 }).withMessage('Tên danh mục không được quá 100 ký tự'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Mô tả không được quá 500 ký tự'),
  
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Màu sắc phải ở định dạng hex (#RRGGBB)')
];

module.exports = {
  createCategoryValidator,
  updateCategoryValidator
};
