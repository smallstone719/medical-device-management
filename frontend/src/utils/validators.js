export function required(value) {
  return !!value || 'This field is required';
}

export function email(value) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value) || 'Invalid email address';
}

export function minLength(min) {
  return (value) => {
    return (value && value.length >= min) || `Minimum ${min} characters required`;
  };
}

export function maxLength(max) {
  return (value) => {
    return (value && value.length <= max) || `Maximum ${max} characters allowed`;
  };
}
