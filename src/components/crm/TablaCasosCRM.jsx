import { useState, useEffect } from 'react'
import { crmAPI } from '../../services/api'
import ModalDetalleCaso from './ModalDetalleCaso'

const ESTADO_BADGES = {
  0: { label: 'Activo', style: 'bg-blue-50 text-blue-700 border-blue-100' },
  1: { label: 'Resuelto', style: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  2: { label: 'Cancelado', style: 'bg-surface-100 text-surface-600 border-surface-200' },
}

const PRIORIDAD_BADGES = {
  1: { label: 'Alta', style: 'bg-rose-50 text-rose-700 border-rose-100' },
  2: { label: 'Normal', style: 'bg-amber-50 text-amber-700 border-amber-100' },
  3: { label: 'Baja', style: 'bg-surface-50 text-surface-600 border-surface-200' },
}

export default function TablaCasosCRM({ accountId, sedeId }) {
  const [casos, setCasos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('active')
  const [filtroPrioridad, setFiltroPrioridad] = useState('')
  const [soloConTareas, setSoloConTareas] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [casoSeleccionado, setCasoSeleccionado] = useState(null)

  useEffect(() => {
    if (accountId) cargarCasos()
  }, [accountId, filtroEstado, filtroPrioridad, soloConTareas, page])

  const cargarCasos = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = { page, limit: 15 }
      if (filtroEstado) params.estado = filtroEstado
      if (filtroPrioridad) params.prioridad = filtroPrioridad
      if (soloConTareas) params.soloConTareasAbiertas = 'true'

      const res = await crmAPI.getCasosBySede(accountId, params)
      const data = res?.data || res
      setCasos(data.casos || [])
      setPagination(data.pagination || null)
    } catch (err) {
      setError(err.message || 'Error cargando casos de CRM')
      console.error('Error cargando casos CRM:', err)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (codigo) => {
    const badge = ESTADO_BADGES[codigo] || { label: String(codigo), style: 'bg-surface-100 text-surface-600 border-surface-200' }
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${badge.style}`}>{badge.label}</span>
  }

  const getPrioridadBadge = (codigo) => {
    const badge = PRIORIDAD_BADGES[codigo] || { label: String(codigo), style: 'bg-surface-100 text-surface-600 border-surface-200' }
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${badge.style}`}>{badge.label}</span>
  }

  if (loading && casos.length === 0) {
    return (
      <div className="py-12 flex justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-surface-200 border-t-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3 text-rose-500">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-surface-900 font-medium">Error al conectar con CRM</p>
        <p className="text-surface-500 text-sm mt-1">{error}</p>
        <button onClick={cargarCasos} className="btn-secondary text-xs py-1.5 mt-4">Reintentar</button>
      </div>
    )
  }

  return (
    <>
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filtroEstado}
          onChange={e => { setFiltroEstado(e.target.value); setPage(1) }}
          className="text-sm rounded-lg border-surface-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1.5 pr-8"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="resolved">Resueltos</option>
          <option value="cancelled">Cancelados</option>
        </select>
        <select
          value={filtroPrioridad}
          onChange={e => { setFiltroPrioridad(e.target.value); setPage(1) }}
          className="text-sm rounded-lg border-surface-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1.5 pr-8"
        >
          <option value="">Todas las prioridades</option>
          <option value="high">Alta</option>
          <option value="normal">Normal</option>
          <option value="low">Baja</option>
        </select>
        <div className="flex items-center gap-2 self-center">
          <input
            type="checkbox"
            id="soloConTareasSede"
            checked={soloConTareas}
            onChange={e => { setSoloConTareas(e.target.checked); setPage(1) }}
            className="rounded border-surface-300 text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
          />
          <label htmlFor="soloConTareasSede" className="text-xs text-surface-500 cursor-pointer select-none">
            Solo con tareas abiertas
          </label>
        </div>
        {pagination?.total != null && (
          <span className="text-xs text-surface-500 self-center ml-auto">
            {pagination.total} caso{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tabla */}
      {casos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-3 text-surface-400">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-surface-900 font-medium">Sin casos de soporte</p>
          <p className="text-surface-500 text-sm mt-1">No se encontraron casos con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">N. Caso</th>
                <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Titulo</th>
                <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Prioridad</th>
                <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Asignado a</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {casos.map(caso => (
                <tr
                  key={caso.id}
                  className="hover:bg-surface-50/50 transition-colors cursor-pointer"
                  onClick={() => setCasoSeleccionado(caso)}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-primary-600 font-medium">{caso.numeroCaso}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-surface-900 line-clamp-1">{caso.titulo}</p>
                  </td>
                  <td className="px-4 py-3">{getEstadoBadge(caso.estadoCodigo)}</td>
                  <td className="px-4 py-3">{getPrioridadBadge(caso.prioridadCodigo)}</td>
                  <td className="px-4 py-3 text-xs text-surface-500">
                    {new Date(caso.creadoEn).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-xs text-surface-600">{caso.asignadoA || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-surface-100">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-xs text-surface-500">
            Página {page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal detalle */}
      {casoSeleccionado && (
        <ModalDetalleCaso
          caso={casoSeleccionado}
          sedeId={sedeId}
          onClose={() => setCasoSeleccionado(null)}
        />
      )}
    </>
  )
}
