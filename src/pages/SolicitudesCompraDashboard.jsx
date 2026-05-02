import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { solicitudesCompraAPI } from '../services/api'
import StatusBadge from '../components/solicitudesCompra/StatusBadge'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'
import { usePermissions } from '../hooks/usePermissions'

const ESTADOS_TARJETA = [
  'pendiente_infra',
  'aprobada_infra',
  'pendiente_pedido',
  'pedido',
  'recibido',
  'entregado_sistemas',
  'finalizada',
  'rechazada'
]

const ESTADOS_PENDIENTES = ['pendiente_infra', 'aprobada_infra', 'pendiente_pedido', 'pedido', 'recibido', 'entregado_sistemas']

export default function SolicitudesCompraDashboard() {
  const navigate = useNavigate()
  const { hasInfraestructura } = usePermissions()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    solicitudesCompraAPI.list({ limit: 100 })
      .then(res => setSolicitudes(normalizeApiResponse(res, 100).data))
      .catch(err => setError(err.message || 'No se pudo cargar el panel'))
      .finally(() => setLoading(false))
  }, [])

  const counts = ESTADOS_TARJETA.reduce((acc, estado) => {
    acc[estado] = solicitudes.filter(s => s.estado === estado).length
    return acc
  }, {})

  const totalActivas = solicitudes.filter(s => !['finalizada', 'rechazada', 'cancelada', 'comprada'].includes(s.estado)).length
  const totalFinalizadas = solicitudes.filter(s => ['finalizada', 'comprada'].includes(s.estado)).length
  const totalRechazadas = solicitudes.filter(s => s.estado === 'rechazada').length

  const pendientes = solicitudes.filter(s => ESTADOS_PENDIENTES.includes(s.estado)).slice(0, 8)

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Solicitudes de compra</h1>
          <p className="text-surface-500 mt-1 font-medium">Panel operativo para Infraestructura, RRHH y Compras</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/solicitudes-compra')} className="btn-secondary">Ver listado</button>
          {hasInfraestructura && (
            <button onClick={() => navigate('/catalogo-equipos')} className="btn-secondary">Catálogo</button>
          )}
          <button
            onClick={() => navigate('/solicitudes-compra/nueva')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary-900/10 transition-all bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-900/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva solicitud
          </button>
        </div>
      </div>

      {error && (
        <div className="card-base p-4 mb-6 border-l-4 border-l-rose-500 bg-rose-50/50">
          <p className="text-sm text-rose-700 font-medium">{error}</p>
        </div>
      )}

      {/* Indicadores principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard
          title="Activas"
          value={totalActivas}
          subtitle="En curso"
          accent="primary"
          iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <SummaryCard
          title="Finalizadas"
          value={totalFinalizadas}
          subtitle="Equipos entregados y dados de alta"
          accent="emerald"
          iconPath="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
        <SummaryCard
          title="Rechazadas"
          value={totalRechazadas}
          subtitle="Sin curso"
          accent="rose"
          iconPath="M6 18L18 6M6 6l12 12"
        />
      </div>

      {/* Distribución por estado */}
      <div className="card-base p-6 mb-8">
        <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-4">Distribución por estado</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
          {ESTADOS_TARJETA.map(estado => (
            <div key={estado} className="flex flex-col gap-2">
              <StatusBadge estado={estado} />
              <p className="text-2xl font-extrabold text-surface-900">{counts[estado] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pendientes de acción */}
      <div className="card-base overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-surface-900">Pendientes de acción</h2>
            <p className="text-xs text-surface-500 mt-0.5">Las primeras 8 solicitudes que requieren intervención</p>
          </div>
          <button
            onClick={() => navigate('/solicitudes-compra')}
            className="text-sm text-primary-700 hover:text-primary-800 font-medium hover:underline"
          >
            Ver todas →
          </button>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4" />
            <p className="text-surface-500 font-medium">Cargando solicitudes…</p>
          </div>
        ) : pendientes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-3 text-surface-400">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-surface-900 font-medium">No hay solicitudes pendientes</p>
            <p className="text-surface-500 text-sm mt-1">Cuando se carguen aparecerán acá</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {pendientes.map(s => (
              <button
                key={s.id}
                onClick={() => navigate(`/solicitudes-compra/${s.id}`)}
                className="w-full text-left px-6 py-4 hover:bg-surface-50/60 transition-colors flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-surface-900">SC-{String(s.numero).padStart(4, '0')}</p>
                  <p className="text-sm text-surface-500 truncate">
                    {s.beneficiario ? `${s.beneficiario.apellido}, ${s.beneficiario.nombre}` : 'Sin beneficiario'}
                    <span className="text-surface-300 mx-1.5">·</span>
                    <span className="capitalize">{s.tipo_equipo}</span>
                    <span className="text-surface-300 mx-1.5">·</span>
                    <span className="capitalize">{(s.motivo || '').replaceAll('_', ' ')}</span>
                  </p>
                </div>
                <StatusBadge estado={s.estado} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ title, value, subtitle, accent, iconPath }) {
  const accentClasses = {
    primary: 'text-primary-600 bg-primary-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    rose: 'text-rose-600 bg-rose-50'
  }
  return (
    <div className="card-base p-6 hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-surface-400 mb-1.5 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-surface-900 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-surface-500 mt-2 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${accentClasses[accent] || accentClasses.primary}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
        </div>
      </div>
    </div>
  )
}
