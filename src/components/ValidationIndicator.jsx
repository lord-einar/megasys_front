import './ValidationIndicator.css'

/**
 * Indicador visual de validación del campo
 * @param {boolean} isValid - Si el campo es válido
 * @param {string} label - Texto a mostrar (ej: "Email válido")
 */
export default function ValidationIndicator({ isValid, label = 'Válido' }) {
  if (isValid === null) return null

  return (
    <div className={`validation-indicator ${isValid ? 'valid' : 'invalid'}`}>
      <span className="validation-icon">
        {isValid ? '✓' : '✗'}
      </span>
      <span className="validation-text">{label}</span>
    </div>
  )
}
