/**
 * Chuẩn hóa response trả về cho client
 * 
 * Tất cả API đều trả về cùng cấu trúc:
 * { success, message, data, pagination? }
 */

const success = (data = null, message = 'Thành công') => ({
  success: true,
  message,
  data,
});

const paginated = (data, pagination, message = 'Thành công') => ({
  success: true,
  message,
  data,
  pagination,
});

const error = (message = 'Lỗi server', errors = null) => ({
  success: false,
  message,
  errors,
});

module.exports = { success, paginated, error };
