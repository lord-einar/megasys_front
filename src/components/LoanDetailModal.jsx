import { useState } from 'react'
import { remitosAPI } from '../services/api'
import Swal from 'sweetalert2'

function LoanDetailModal({ loan, isOpen, onClose, onLoanUpdated }) {
  // Convertir fecha a formato dd/mm/yyyy para mostrar
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return ''
    // Si es un string de fecha ISO (YYYY-MM-DD), dividirlo
    if (dateString.includes('-')) {
      const parts = dateString.split('T')[0].split('-')
      if (parts.length === 3) {
        const [year, month, day] = parts
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
      }
    }
    // Fallback a parseo de fecha (para casos con timestamp)
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      const day = String(date.getUTCDate()).padStart(2, '0')
      const month = String(date.getUTCMonth() + 1).padStart(2, '0')
      const year = date.getUTCFullYear()
      return `${day}/${month}/${year}`
    }
    return ''
  }

  // Convertir formato dd/mm/yyyy a yyyy-mm-dd para enviar al backend
  const formatDateForBackend = (displayDate) => {
    if (!displayDate) return ''
    const parts = displayDate.split('/')
    if (parts.length !== 3) return ''
    const [day, month, year] = parts
    // Asegurar que estamos enviando la fecha correcta sin conversiones de timezone
    const dayStr = String(day).padStart(2, '0')
    const monthStr = String(month).padStart(2, '0')
    const yearStr = String(year).padStart(4, '0')
    const result = `${yearStr}-${monthStr}-${dayStr}`
    console.log('formatDateForBackend:', { displayDate, parts, result }) // DEBUG
    return result
  }

  const [newDate, setNewDate] = useState(
    loan?.fecha_devolucion_esperada ? formatDateForDisplay(loan.fecha_devolucion_esperada) : ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [markingReturned, setMarkingReturned] = useState(false)

  const handleExtendDate = async () => {
    if (!newDate) {
      setError('Debes seleccionar una fecha')
      return
    }

    // Validar que el formato sea dd/mm/yyyy
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
    const match = newDate.match(dateRegex)
    if (!match) {
      setError('Formato de fecha inválido. Usa dd/mm/yyyy')
      return
    }

    const [, day, month, year] = match
    if (parseInt(day) < 1 || parseInt(day) > 31 || parseInt(month) < 1 || parseInt(month) > 12) {
      setError('Fecha inválida')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      // Convertir a formato yyyy-mm-dd para backend
      const backendDate = formatDateForBackend(newDate)

      await remitosAPI.actualizarFechaDevolucion(
        loan.remito.id,
        loan.id,
        backendDate
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

  const handleMarkReturned = async () => {
    const confirm = await Swal.fire({
      title: '¿Marcar como devuelto?',
      text: 'Esta acción marcará el artículo como devuelto',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, devolver',
      cancelButtonText: 'Cancelar'
    })

    if (!confirm.isConfirmed) return

    try {
      setMarkingReturned(true)
      setError(null)
      setSuccess(null)

      // Usar el endpoint de devolver con solo este detalle
      await remitosAPI.devolver(loan.remito.id, [loan.id])

      setSuccess('Artículo marcado como devuelto')
      setTimeout(() => {
        onLoanUpdated?.()
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Error al marcar como devuelto')
    } finally {
      setMarkingReturned(false)
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
              Extender Fecha de Devolución (dd/mm/yyyy)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="dd/mm/yyyy"
                value={newDate}
                onChange={(e) => {
                  let value = e.target.value
                  // Solo permitir números y barras
                  value = value.replace(/[^\d/]/g, '')
                  // Limitar a máximo 10 caracteres (dd/mm/yyyy)
                  if (value.length <= 10) {
                    // Auto-insertar barras
                    if (value.length === 2 && !value.includes('/')) {
                      value = value + '/'
                    } else if (value.length === 5 && (value.match(/\//g) || []).length === 1) {
                      value = value + '/'
                    }
                    setNewDate(value)
                  }
                }}
                maxLength="10"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date()
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  const day = String(tomorrow.getDate()).padStart(2, '0')
                  const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
                  const year = tomorrow.getFullYear()
                  setNewDate(`${day}/${month}/${year}`)
                }}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                title="Establecer para mañana"
              >
                Mañana
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Ingresa la fecha en formato dd/mm/yyyy o usa el botón "Mañana"</p>
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
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={onClose}
            disabled={loading || markingReturned}
            className="flex-1 min-w-[120px] px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleMarkReturned}
            disabled={loading || markingReturned}
            className="flex-1 min-w-[120px] px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {markingReturned ? 'Marcando...' : 'Marcar Devuelto'}
          </button>
          <button
            onClick={handleExtendDate}
            disabled={loading || !newDate || markingReturned}
            className="flex-1 min-w-[120px] px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Actualizando...' : 'Extender Fecha'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoanDetailModal
