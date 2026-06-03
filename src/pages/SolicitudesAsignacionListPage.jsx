import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { solicitudesAsignacionAPI } from '../services/api'
import { useListData } from '../hooks/useListData'
import StatusBadgeAsignacion from '../components/solicitudesAsignacion/StatusBadgeAsignacion'
import { FileText, Plus, RefreshCw } from 'lucide-react'

export default function SolicitudesAsignacionListPage() {
  const navigate = useNavigate()
  const [estado, setEstado] = useState('')
  const [tipoEquipo, setTipoEquipo] = useState('')
  const [motivo, setMotivo] = useState('')
  const { data, loading, error, updateFilters, reload } = useListData(solicitudesAsignacionAPI.list, {
    initialLimit: 20,
    initialFilters: {}
  })

  const buscar = (e) => {
    e.preventDefault()
    updateFilters({
      estado: estado || undefined,
      tipo_equipo: tipoEquipo || undefined,
      motivo: motivo || undefined
    })
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Solicitudes de asignación</p>
          <h1 className="page-title">Listado</h1>
          <p className="page-description">Seguimiento de celulares y notebooks asignados desde stock</p>
        </div>
        <div className="responsive-actions">
          <button onClick={() => navigate('/solicitudes-asignacion/nueva')} className="btn-primary">
            <Plus className="w-4 h-4" />
            Nueva solicitud
          </button>
        </div>
      </div>

      <form onSubmit={buscar} className="card-base p-5 mb-6 grid grid-cols-1 md:grid-cols-[1fr_200px_200px_auto] gap-4">
        <label>
          <span className="label-base">Tipo de equipo</span>
          <select value={tipoEquipo} onChange={e => setTipoEquipo(e.target.value)} className="input-base">
            <option value="">Todos los tipos</option>
            <option value="celular">Celular</option>
            <option value="notebook">Notebook</option>
          </select>
        </label>
        <label>
          <span className="label-base">Motivo</span>
          <select value={motivo} onChange={e => setMotivo(e.target.value)} className="input-base">
            <option value="">Todos los motivos</option>
            <option value="nuevo_ingreso">Nuevo ingreso</option>
            <option value="nuevo_puesto">Nuevo puesto</option>
            <option value="reposicion_robo">Reposición por robo</option>
            <option value="reposicion_perdida">Reposición por pérdida</option>
            <option value="reposicion_rotura">Reposición por rotura</option>
            <option value="cambio_equipo">Cambio de equipo</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        <label>
          <span className="label-base">Estado</span>
          <select value={estado} onChange={e => setEstado(e.target.value)} className="input-base">
            <option value="">Todos los estados</option>
            <option value="pendiente_infra">En revisión Infra</option>
            <option value="pendiente_rrhh">Pendiente RRHH</option>
            <option value="aprobada">Aprobada</option>
            <option value="remito_generado">Remito generado</option>
            <option value="finalizada">Finalizada</option>
            <option value="rechazada">Rechazada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </label>
        <div className="flex items-end">
          <button className="btn-secondary w-full" type="submit">Filtrar</button>
        </div>
      </form>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 mb-4">
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </div>
      )}

      <div className="card-base overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-surface-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h2 className="font-bold text-surface-900">Solicitudes</h2>
            <p className="text-xs text-surface-500 mt-0.5">{data.length} registros visibles</p>
          </div>
          <button onClick={reload} className="btn-secondary text-xs py-2">
            <RefreshCw className="w-4 h-4" />
            Recargar
          </button>
        </div>
        <div className="divide-y divide-surface-100">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4" />
              <p className="text-surface-500 font-medium">Cargando solicitudes...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-3 text-surface-400">
                <FileText className="w-7 h-7" />
              </div>
              <p className="text-surface-900 font-medium">No hay solicitudes para mostrar</p>
              <p className="text-surface-500 text-sm mt-1">Ajusta los filtros o crea una nueva solicitud.</p>
            </div>
          ) : data.map(s => (
            <button
              key={s.id}
              onClick={() => navigate(`/solicitudes-asignacion/${s.id}`)}
              className="w-full text-left px-4 sm:px-6 py-4 hover:bg-surface-50/70 transition-colors flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-surface-900">SA-{String(s.numero).padStart(4, '0')}</p>
                <p className="text-sm text-surface-500 truncate">
                  {s.beneficiario ? `${s.beneficiario.apellido}, ${s.beneficiario.nombre}` : 'Sin beneficiario'}
                  <span className="text-surface-300 mx-1.5">·</span>
                  <span className="capitalize">{(s.motivo || '').replaceAll('_', ' ')}</span>
                  <span className="text-surface-300 mx-1.5">·</span>
                  <span className="capitalize">{s.tipo_equipo}</span>
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-surface-400">
                  {s.created_at ? new Date(s.created_at).toLocaleDateString('es-AR') : ''}
                </span>
                <StatusBadgeAsignacion estado={s.estado} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
