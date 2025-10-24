import './DeleteConfirmationModal.css'

/**
 * Modal de confirmación reutilizable para operaciones de eliminación
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje de confirmación
 * @param {string} resourceName - Nombre del recurso a eliminar (para contexto)
 * @param {function} onConfirm - Callback cuando se confirma la eliminación
 * @param {function} onCancel - Callback cuando se cancela
 * @param {boolean} isLoading - Si la operación de eliminación está en progreso
 * @param {string} confirmText - Texto del botón de confirmación (default: "Eliminar")
 * @param {string} cancelText - Texto del botón de cancelación (default: "Cancelar")
 */
export default function DeleteConfirmationModal({
  isOpen,
  title = 'Confirmar eliminación',
  message = '¿Estás seguro de que deseas continuar?',
  resourceName = 'este registro',
  onConfirm,
  onCancel,
  isLoading = false,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar'
}) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="modal-overlay" onClick={onCancel}></div>

      {/* Modal */}
      <div className="delete-confirmation-modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            className="modal-close-btn"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="warning-icon">⚠️</div>
          <p className="modal-message">{message}</p>
          {resourceName && (
            <p className="resource-name">
              <strong>Recurso:</strong> {resourceName}
            </p>
          )}
          <p className="modal-warning-text">
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="modal-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Eliminando...' : confirmText}
          </button>
        </div>
      </div>
    </>
  )
}
