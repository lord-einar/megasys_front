import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { remitosAPI } from '../services/api'
import LoanDetailModal from './LoanDetailModal'

function LoansAboutToExpireCard() {
  const navigate = useNavigate()
  const [loansResumen, setLoansResumen] = useState({
    proximosAVencer: 0,
    vencidos: 0,
    totalActivos: 0,
    alerta: false
  })
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [sendingReminder, setSendingReminder] = useState(null) // Track which loan is sending reminder

  useEffect(() => {
    cargarPrestamos()
  }, [])

  const cargarPrestamos = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar resumen de préstamos
      const resumenResponse = await remitosAPI.obtenerResumenPrestamos()
      setLoansResumen(resumenResponse.data || resumenResponse)

      // Cargar tanto próximos a vencer como vencidos
      const [proximosResponse, vencidosResponse] = await Promise.all([
        remitosAPI.obtenerPrestamosProximosAVencer(7),
        remitosAPI.obtenerPrestamosVencidos()
      ])

      const proximosPrestamos = Array.isArray(proximosResponse.data) ? proximosResponse.data : proximosResponse || []
      const prestamosvencidos = Array.isArray(vencidosResponse.data) ? vencidosResponse.data : vencidosResponse || []

      // Combinar ambos, priorizando los vencidos primero (por severidad)
      const todosPrestamos = [...prestamosvencidos, ...proximosPrestamos]
      setLoans(todosPrestamos.slice(0, 5)) // Mostrar los 5 primeros
    } catch (err) {
      console.error('Error cargando préstamos:', err)
      setError('Error al cargar los préstamos')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getDaysUntilDue = (dateString) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(dateString)
    dueDate.setHours(0, 0, 0, 0)
    const diffTime = dueDate - today
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusColor = (daysUntilDue) => {
    if (daysUntilDue < 0) return 'bg-red-50 border-red-200'
    if (daysUntilDue <= 2) return 'bg-orange-50 border-orange-200'
    return 'bg-yellow-50 border-yellow-200'
  }

  const getStatusBadgeColor = (daysUntilDue) => {
    if (daysUntilDue < 0) return 'bg-red-100 text-red-700'
    if (daysUntilDue <= 2) return 'bg-orange-100 text-orange-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  const getStatusText = (daysUntilDue) => {
    if (daysUntilDue < 0) return `Vencido hace ${Math.abs(daysUntilDue)} días`
    if (daysUntilDue === 0) return 'Vence hoy'
    if (daysUntilDue === 1) return 'Vence mañana'
    return `Vence en ${daysUntilDue} días`
  }

  const handleEnviarAviso = async (e, loanId) => {
    e.stopPropagation()
    try {
      setSendingReminder(loanId)
      const response = await remitosAPI.enviarAvisoDevolucion(loanId)

      if (response.success || response.success !== false) {
        // Mostrar éxito con SweetAlert2
        await Swal.fire({
          title: '¡Aviso enviado!',
          text: 'El aviso de devolución ha sido enviado exitosamente a infraestructura y solicitante',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          timer: 3000,
          timerProgressBar: true
        })
        cargarPrestamos()
      }
    } catch (err) {
      console.error('Error enviando aviso:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Error desconocido'
      await Swal.fire({
        title: '¡Error!',
        text: `Error al enviar el aviso de devolución: ${errorMessage}`,
        icon: 'error',
        confirmButtonText: 'Aceptar'
      })
    } finally {
      setSendingReminder(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">⏰</span>
            Préstamos a Vencer
          </h2>
          <p className="text-xs text-gray-500 mt-1">Próximos 7 días</p>
        </div>
        {loansResumen.alerta && (
          <div className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            Requiere atención
          </div>
        )}
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {loansResumen.vencidos}
          </div>
          <p className="text-xs text-red-600 font-medium">Vencidos</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {loansResumen.proximosAVencer}
          </div>
          <p className="text-xs text-orange-600 font-medium">Próximos a vencer</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {loansResumen.totalActivos}
          </div>
          <p className="text-xs text-gray-600 font-medium">Activos</p>
        </div>
      </div>

      {/* Lista de préstamos */}
      {loans.length > 0 ? (
        <div className="space-y-3">
          {loans.map((loan) => {
            const daysUntilDue = getDaysUntilDue(loan.fecha_devolucion_esperada)
            return (
              <div
                key={loan.id}
                className={`p-3 rounded-lg border ${getStatusColor(daysUntilDue)} cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => navigate(`/remitos/${loan.remito.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {loan.remito?.numero_remito || 'N/A'}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeColor(
                          daysUntilDue
                        )}`}
                      >
                        {getStatusText(daysUntilDue)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {loan.inventarioDetalle?.marca} {loan.inventarioDetalle?.modelo}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Vence: {formatDate(loan.fecha_devolucion_esperada)}
                    </p>
                    {loan.remito?.solicitante && (
                      <p className="text-xs text-gray-500">
                        {loan.remito.solicitante.nombre} {loan.remito.solicitante.apellido}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Botón "Enviar Aviso" solo cuando falte exactamente 1 día */}
                    {daysUntilDue === 1 && (
                      <button
                        onClick={(e) => handleEnviarAviso(e, loan.id)}
                        disabled={sendingReminder === loan.id}
                        className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs font-medium transition-colors"
                        title="Enviar aviso de devolución mañana"
                      >
                        {sendingReminder === loan.id ? 'Enviando...' : 'Enviar aviso'}
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedLoan(loan)
                        setModalOpen(true)
                      }}
                      className="text-primary-500 hover:text-primary-600 transition-colors"
                      title="Acción rápida"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No hay préstamos próximos a vencer</p>
          <p className="text-gray-400 text-xs mt-1">Todos los préstamos están en orden</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Modal para acciones rápidas */}
      <LoanDetailModal
        loan={selectedLoan}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onLoanUpdated={cargarPrestamos}
      />
    </div>
  )
}

export default LoansAboutToExpireCard
