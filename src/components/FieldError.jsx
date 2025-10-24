import './FieldError.css'

/**
 * Componente mejorado para mostrar errores de campo
 * Soporta errores del cliente (Yup) y del servidor (API)
 * @param {string} serverError - Error del servidor
 * @param {Object} clientError - Error del cliente (objeto de react-hook-form)
 * @param {string} fieldName - Nombre del campo para contexto
 */
export default function FieldError({ serverError, clientError, fieldName = '' }) {
  if (!serverError && !clientError) return null

  // Priorizar error del servidor
  const error = serverError || clientError?.message
  const isServerError = !!serverError
  const isClientError = !!clientError && !serverError

  return (
    <div className={`field-error ${isServerError ? 'server-error' : 'client-error'}`}>
      <span className="error-icon">
        {isServerError ? '⚠' : '✕'}
      </span>
      <div className="error-content">
        <p className="error-message">{error}</p>
        {isServerError && (
          <p className="error-hint">Error desde el servidor</p>
        )}
        {isClientError && (
          <p className="error-hint">Revisa el formato de los datos</p>
        )}
      </div>
    </div>
  )
}
