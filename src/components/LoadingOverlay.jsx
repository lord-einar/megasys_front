import './LoadingOverlay.css'

export default function LoadingOverlay({ isVisible, message = 'Procesando...' }) {
  if (!isVisible) return null

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner"></div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  )
}
