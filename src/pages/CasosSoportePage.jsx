import { useState, useEffect } from 'react'
import { crmAPI } from '../services/api'
import ModalDetalleCaso from '../components/crm/ModalDetalleCaso'

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

const FILTROS_ANTIGUEDAD = [
  { label: 'Todos', value: 0 },
  { label: '+15 días', value: 15 },
  { label: '+30 días', value: 30 },
  { label: '+45 días', value: 45 },
  { label: '+60 días', value: 60 },
  { label: '+75 días', value: 75 },
]

export default function CasosSoportePage() {
  const [casos, setCasos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('active')
  const [filtroPrioridad, setFiltroPrioridad] = useState('')
  const [filtroAntiguedad, setFiltroAntiguedad] = useState(0)
  const [filtroCuenta, setFiltroCuenta] = useState('')
  const [soloConTareas, setSoloConTareas] = useState(true)
  const [casoSeleccionado, setCasoSeleccionado] = useState(null)

  // Lista única de cuentas/sedes extraída de los casos
  const cuentasUnicas = [...new Map(
    casos
      .filter(c => c.cuentaNombre)
      .map(c => [c.cuentaId, c.cuentaNombre])
  ).entries()].sort((a, b) => a[1].localeCompare(b[1]))

  useEffect(() => {
    cargarCasos()
  }, [filtroEstado, filtroPrioridad, filtroAntiguedad, soloConTareas])

  const cargarCasos = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = { limit: 200 }
      if (filtroEstado) params.estado = filtroEstado
      if (filtroPrioridad) params.prioridad = filtroPrioridad
      if (filtroAntiguedad > 0) params.diasMinimos = filtroAntiguedad
      if (soloConTareas) params.soloConTareasAbiertas = 'true'

      const res = await crmAPI.getCasos(params)
      const data = res?.data || res
      setCasos(data.casos || [])
    } catch (err) {
      setError(err.message || 'Error cargando casos de CRM')
      console.error('Error cargando casos CRM:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar por sede en el cliente (antigüedad se filtra en el backend)
  const casosFiltrados = casos.filter(caso => {
    if (filtroCuenta && caso.cuentaId !== filtroCuenta) return false
    return true
  })

  const getEstadoBadge = (codigo) => {
    const badge = ESTADO_BADGES[codigo] || { label: String(codigo), style: 'bg-surface-100 text-surface-600 border-surface-200' }
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${badge.style}`}>{badge.label}</span>
  }

  const getPrioridadBadge = (codigo) => {
    const badge = PRIORIDAD_BADGES[codigo] || { label: String(codigo), style: 'bg-surface-100 text-surface-600 border-surface-200' }
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${badge.style}`}>{badge.label}</span>
  }

  const getDiasAbierto = (fechaCreacion) => {
    const dias = Math.floor((Date.now() - new Date(fechaCreacion).getTime()) / (1000 * 60 * 60 * 24))
    if (dias >= 60) return <span className="text-rose-600 font-bold">{dias}d</span>
    if (dias >= 30) return <span className="text-amber-600 font-semibold">{dias}d</span>
    if (dias >= 15) return <span className="text-yellow-600">{dias}d</span>
    return <span className="text-surface-500">{dias}d</span>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Soporte CRM</h1>
        <p className="text-sm text-surface-500 mt-1">Casos derivados a Soporte Sedes</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-surface-200 p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">Estado</label>
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="text-sm rounded-lg border-surface-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1.5 pr-8"
            >
              <option value="">Todos</option>
              <option value="active">Activos</option>
              <option value="resolved">Resueltos</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">Prioridad</label>
            <select
              value={filtroPrioridad}
              onChange={e => setFiltroPrioridad(e.target.value)}
              className="text-sm rounded-lg border-surface-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1.5 pr-8"
            >
              <option value="">Todas</option>
              <option value="high">Alta</option>
              <option value="normal">Normal</option>
              <option value="low">Baja</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">Sede</label>
            <select
              value={filtroCuenta}
              onChange={e => setFiltroCuenta(e.target.value)}
              className="text-sm rounded-lg border-surface-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1.5 pr-8"
            >
              <option value="">Todas las sedes</option>
              {cuentasUnicas.map(([id, nombre]) => (
                <option key={id} value={id}>{nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">Antigüedad</label>
            <div className="flex gap-1">
              {FILTROS_ANTIGUEDAD.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFiltroAntiguedad(f.value)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    filtroAntiguedad === f.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-surface-600 border-surface-200 hover:bg-surface-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 self-center">
            <input
              type="checkbox"
              id="soloConTareas"
              checked={soloConTareas}
              onChange={e => setSoloConTareas(e.target.checked)}
              className="rounded border-surface-300 text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
            />
            <label htmlFor="soloConTareas" className="text-xs text-surface-500 cursor-pointer select-none">
              Solo con tareas abiertas
            </label>
          </div>

          <div className="ml-auto self-center">
            <span className="text-xs text-surface-500">
              {casosFiltrados.length} caso{casosFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && casos.length === 0 && (
        <div className="py-16 flex justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-surface-200 border-t-primary-600"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12 bg-white rounded-xl border border-surface-200">
          <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3 text-rose-500">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-surface-900 font-medium">Error al conectar con CRM</p>
          <p className="text-surface-500 text-sm mt-1">{error}</p>
          <button onClick={cargarCasos} className="mt-4 px-4 py-1.5 text-xs font-medium bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-lg transition-colors">
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla */}
      {!loading && !error && (
        <>
          {casosFiltrados.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-surface-200">
              <div className="w-14 h-14 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-3 text-surface-400">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-surface-900 font-medium">Sin casos</p>
              <p className="text-surface-500 text-sm mt-1">No se encontraron casos con los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-50 border-b border-surface-200">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">N. Caso</th>
                      <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Título</th>
                      <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Sede</th>
                      <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Prioridad</th>
                      <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Días</th>
                      <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Fecha</th>
                      <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Asignado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {casosFiltrados.map(caso => (
                      <tr
                        key={caso.id}
                        className="hover:bg-surface-50/50 transition-colors cursor-pointer"
                        onClick={() => setCasoSeleccionado(caso)}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-primary-600 font-medium">{caso.numeroCaso}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-surface-900 line-clamp-1 max-w-xs">{caso.titulo}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-surface-600 line-clamp-1 max-w-[160px]">{caso.cuentaNombre || '-'}</p>
                        </td>
                        <td className="px-4 py-3">{getEstadoBadge(caso.estadoCodigo)}</td>
                        <td className="px-4 py-3">{getPrioridadBadge(caso.prioridadCodigo)}</td>
                        <td className="px-4 py-3 text-xs">{getDiasAbierto(caso.creadoEn)}</td>
                        <td className="px-4 py-3 text-xs text-surface-500">
                          {new Date(caso.creadoEn).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 text-xs text-surface-600">{caso.asignadoA || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal detalle */}
      {casoSeleccionado && (
        <ModalDetalleCaso
          caso={casoSeleccionado}
          onClose={() => setCasoSeleccionado(null)}
        />
      )}
    </div>
  )
}
