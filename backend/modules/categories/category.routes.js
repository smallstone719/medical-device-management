const express = require('express');
const router = express.Router();
const CategoryController = require('./category.controller');
const { createCategoryValidator, updateCategoryValidator } = require('./category.validator');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Public routes (nếu cần)
router.get('/all', CategoryController.getAllSimple);

// Protected routes
router.use(authenticate);

router.get('/', CategoryController.getCategories);
router.get('/:id', CategoryController.getCategoryById);

// Admin only
router.post('/', authorize(['admin']), validate(createCategoryValidator), CategoryController.createCategory);
router.put('/:id', authorize(['admin']), validate(updateCategoryValidator), CategoryController.updateCategory);
router.delete('/:id', authorize(['admin']), CategoryController.deleteCategory);

module.exports = router;
