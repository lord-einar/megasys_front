/**
 * Error Handler Utility
 * Centralizes error parsing and user-friendly message generation
 */

/**
 * Parse API error response and extract field-specific errors
 * @param {Error} error - The error object from API call
 * @returns {Object} - { general: string, fields: { fieldName: errorMessage } }
 */
export const parseApiError = (error) => {
  const result = {
    general: '',
    fields: {}
  };

  // Network error or no response
  if (!error.response) {
    result.general = error.message || 'Error de conexión. Por favor intenta de nuevo.';
    return result;
  }

  const { status, data } = error.response;

  // Handle different HTTP status codes
  switch (status) {
    case 400:
      // Bad request - validation errors
      if (data.errors && Array.isArray(data.errors)) {
        // Express-validator format
        data.errors.forEach(err => {
          if (err.param) {
            result.fields[err.param] = err.msg;
          }
        });
      }
      result.general = data.message || 'Los datos enviados no son válidos. Por favor revisa los errores.';
      break;

    case 401:
      result.general = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
      break;

    case 403:
      result.general = 'No tienes permiso para realizar esta acción.';
      break;

    case 404:
      result.general = data.message || 'El recurso solicitado no fue encontrado.';
      break;

    case 409:
      // Conflict - duplicate, already exists, etc.
      result.general = data.message || 'Esta acción no se puede completar. El recurso ya existe o hay un conflicto.';

      // Try to extract field info from message
      if (data.message) {
        if (data.message.toLowerCase().includes('email')) {
          result.fields.email = data.message;
        } else if (data.message.toLowerCase().includes('sede')) {
          result.fields.sedes = data.message;
        } else if (data.message.toLowerCase().includes('rol')) {
          result.fields.rol_id = data.message;
        }
      }
      break;

    case 422:
      // Unprocessable entity
      if (data.errors && typeof data.errors === 'object') {
        Object.keys(data.errors).forEach(field => {
          result.fields[field] = data.errors[field];
        });
      }
      result.general = data.message || 'Los datos enviados no pueden ser procesados.';
      break;

    case 500:
      result.general = data.message || 'Error del servidor. Por favor intenta de nuevo más tarde.';
      break;

    default:
      result.general = data.message || `Error ${status}: ${error.statusText || 'Desconocido'}`;
  }

  return result;
};

/**
 * Get field-specific error message
 * @param {string} fieldName - The field name
 * @param {Object} fieldErrors - The fields error object from parseApiError
 * @returns {string} - Error message for the field or empty string
 */
export const getFieldError = (fieldName, fieldErrors = {}) => {
  return fieldErrors[fieldName] || '';
};

/**
 * Check if a field has an error
 * @param {string} fieldName - The field name
 * @param {Object} fieldErrors - The fields error object
 * @returns {boolean}
 */
export const hasFieldError = (fieldName, fieldErrors = {}) => {
  return !!fieldErrors[fieldName];
};

/**
 * Get CSS class for error styling
 * @param {boolean} hasError - Whether field has error
 * @returns {string} - CSS class name
 */
export const getErrorClassName = (hasError) => {
  return hasError ? 'is-invalid' : '';
};

/**
 * Get success notification text
 * @param {string} action - The action performed (create, update, delete)
 * @param {string} entity - The entity type (personal, sede, etc.)
 * @returns {string} - Success message
 */
export const getSuccessMessage = (action, entity) => {
  const messages = {
    create: `${entity} creado(a) exitosamente`,
    update: `${entity} actualizado(a) correctamente`,
    delete: `${entity} eliminado(a) correctamente`,
    save: `${entity} guardado(a) correctamente`
  };

  return messages[action] || `Operación completada exitosamente`;
};
