import { useState } from 'react'
import { remitosAPI } from '../services/api'

function LoanDetailModal({ loan, isOpen, onClose, onLoanUpdated }) {
  const [newDate, setNewDate] = useState(
    loan?.fecha_devolucion_esperada ? loan.fecha_devolucion_esperada.split('T')[0] : ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleExtendDate = async () => {
    if (!newDate) {
      setError('Debes seleccionar una fecha')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      await remitosAPI.actualizarFechaDevolucion(
        loan.remito.id,
        loan.id,
        newDate
      )

      setSuccess('Fecha actualizada correctamente')
      setTimeout(() => {
        onLoanUpdated?.()
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Error al actualizar la fecha')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !loan) return null

  const daysUntilDue = Math.ceil(
    (new Date(loan.fecha_devolucion_esperada) - new Date()) / (1000 * 60 * 60 * 24)
  )

  const getStatusColor = () => {
    if (daysUntilDue < 0) return 'text-red-700'
    if (daysUntilDue <= 2) return 'text-orange-700'
    return 'text-yellow-700'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Detalles del Préstamo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          {/* Remito Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Remito</p>
            <p className="text-lg font-semibold text-gray-900">{loan.remito?.numero_remito}</p>
          </div>

          {/* Solicitante Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">Prestado a</p>
            <p className="text-lg font-semibold text-gray-900">
              {loan.remito?.solicitante?.nombre && loan.remito?.solicitante?.apellido
                ? `${loan.remito.solicitante.nombre} ${loan.remito.solicitante.apellido}`
                : loan.remito?.solicitante_id || 'No disponible'}
            </p>
            {loan.remito?.solicitante && (
              <p className="text-xs text-gray-500 mt-1">
                {loan.remito.solicitante.id}
              </p>
            )}
          </div>

          {/* Artículo Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Artículo</p>
            <p className="text-lg font-semibold text-gray-900">
              {loan.inventarioDetalle?.marca} {loan.inventarioDetalle?.modelo}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              SN: {loan.inventarioDetalle?.numero_serie || 'N/A'}
            </p>
          </div>

          {/* Fecha Actual */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Fecha de Devolución Esperada</p>
            <p className={`text-lg font-semibold ${getStatusColor()}`}>
              {new Date(loan.fecha_devolucion_esperada).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {daysUntilDue < 0
                ? `Vencido hace ${Math.abs(daysUntilDue)} días`
                : daysUntilDue === 0
                ? 'Vence hoy'
                : daysUntilDue === 1
                ? 'Vence mañana'
                : `Vence en ${daysUntilDue} días`}
            </p>
          </div>

          {/* Nueva Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extender Fecha de Devolución
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleExtendDate}
            disabled={loading || !newDate}
            className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Actualizando...' : 'Extender Fecha'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoanDetailModal
