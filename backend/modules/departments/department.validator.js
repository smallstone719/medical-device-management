const createDepartmentSchema = {
  code: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 20,
    pattern: /^[A-Z0-9_-]+$/,
    message: 'Mã phòng ban chỉ gồm chữ IN HOA, số, gạch ngang (2-20 ký tự). VD: IT, HR-01',
  },
  name: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100,
    message: 'Tên phòng ban phải từ 2 đến 100 ký tự',
  },
  description: {
    required: false,
    type: 'string',
    maxLength: 500,
    message: 'Mô tả không được quá 500 ký tự',
  },
  manager_id: {
    required: false,
    type: 'number',
    message: 'manager_id phải là số',
  },
  parent_id: {
    required: false,
    type: 'number',
    message: 'parent_id phải là số',
  },
};

const updateDepartmentSchema = {
  name: {
    required: false,
    type: 'string',
    minLength: 2,
    maxLength: 100,
    message: 'Tên phòng ban phải từ 2 đến 100 ký tự',
  },
  description: {
    required: false,
    type: 'string',
    maxLength: 500,
    message: 'Mô tả không được quá 500 ký tự',
  },
  manager_id: {
    required: false,
    type: 'number',
    message: 'manager_id phải là số',
  },
  parent_id: {
    required: false,
    type: 'number',
    message: 'parent_id phải là số',
  },
  is_active: {
    required: false,
    type: 'boolean',
    message: 'is_active phải là true hoặc false',
  },
};

const addMemberSchema = {
  user_id: {
    required: true,
    type: 'number',
    message: 'user_id là bắt buộc và phải là số',
  },
  is_primary: {
    required: false,
    type: 'boolean',
    message: 'is_primary phải là true hoặc false',
  },
};

module.exports = { createDepartmentSchema, updateDepartmentSchema, addMemberSchema };
