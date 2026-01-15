import './CharacterCounter.css'

/**
 * Contador de caracteres para campos de texto
 * @param {number} currentLength - Cantidad actual de caracteres
 * @param {number} maxLength - Máximo de caracteres permitidos
 * @param {boolean} showWarning - Mostrar warning cuando alcanza 80% de límite
 */
export default function CharacterCounter({ currentLength = 0, maxLength, showWarning = true }) {
  if (!maxLength) return null

  const percentage = (currentLength / maxLength) * 100
  const isNearLimit = showWarning && percentage >= 80
  const isAtLimit = percentage >= 100

  return (
    <div className={`character-counter ${isAtLimit ? 'at-limit' : isNearLimit ? 'near-limit' : ''}`}>
      <span className="counter-text">
        {currentLength}/{maxLength}
      </span>
      <div className="counter-bar">
        <div
          className="counter-fill"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  )
}
