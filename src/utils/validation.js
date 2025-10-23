// Validation utilities

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^[0-9\-\+\(\)\s]{7,}$/
  return re.test(phone)
}

export const validateIP = (ip) => {
  const re = /^(\d{1,3}\.){3}\d{1,3}$/
  return re.test(ip)
}

export const validateRequired = (value) => {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return value != null && value !== ''
}

export const validateMinLength = (value, min) => {
  return String(value).length >= min
}

export const validateMaxLength = (value, max) => {
  return String(value).length <= max
}

export const getFieldError = (field, errors) => {
  return errors.find((error) => error.field === field)?.message || ''
}

export const hasFieldError = (field, errors) => {
  return errors.some((error) => error.field === field)
}
