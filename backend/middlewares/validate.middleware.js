/**
 * Middleware validate request body theo schema đơn giản
 * Schema là object mô tả các field cần validate
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const errors = [];
    const body = req.body;

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      const isEmpty = value === undefined || value === null || value === '';

      // Kiểm tra required
      if (rules.required && isEmpty) {
        errors.push({ field, message: `${field} là bắt buộc` });
        continue;
      }

      // Bỏ qua nếu field không bắt buộc và không có giá trị
      if (isEmpty) continue;

      // Kiểm tra type
      if (rules.type && typeof value !== rules.type) {
        errors.push({ field, message: rules.message || `${field} không đúng kiểu dữ liệu` });
        continue;
      }

      // Kiểm tra minLength / maxLength (string)
      if (rules.type === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push({ field, message: rules.message || `${field} quá ngắn` });
          continue;
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push({ field, message: rules.message || `${field} quá dài` });
          continue;
        }
      }

      // Kiểm tra pattern (regex)
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push({ field, message: rules.message || `${field} không hợp lệ` });
        continue;
      }

      // Kiểm tra enum
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({
          field,
          message: rules.message || `${field} phải là một trong: ${rules.enum.join(', ')}`,
        });
        continue;
      }
    }

    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors,
      });
    }

    next();
  };
};

module.exports = { validateBody };
module.exports.validate = validateBody; // Alias for backward compatibility
