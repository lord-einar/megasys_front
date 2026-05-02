import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { solicitudesCompraAPI } from '../services/api'
import { useListData } from '../hooks/useListData'
import StatusBadge from '../components/solicitudesCompra/StatusBadge'

export default function SolicitudesCompraListPage() {
  const navigate = useNavigate()
  const [estado, setEstado] = useState('')
  const [q, setQ] = useState('')
  const { data, loading, error, updateFilters, reload } = useListData(solicitudesCompraAPI.list, {
    initialLimit: 20,
    initialFilters: {}
  })

  const buscar = (e) => {
    e.preventDefault()
    updateFilters({ estado: estado || undefined, q: q || undefined })
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Solicitudes de compra</p>
          <h1 className="text-2xl font-bold text-surface-900">Listado</h1>
          <p className="text-surface-500 mt-1 font-medium">Seguimiento de celulares y notebooks</p>
        </div>
        <button onClick={() => navigate('/solicitudes-compra/nueva')} className="btn-primary shadow-lg shadow-surface-900/10">Nueva solicitud</button>
      </div>

      <form onSubmit={buscar} className="card-base p-5 mb-6 grid grid-cols-1 md:grid-cols-[1fr_260px_auto] gap-4">
        <label>
          <span className="label-base">Buscar</span>
          <input value={q} onChange={e => setQ(e.target.value)} className="input-base" placeholder="Beneficiario, email o apellido" />
        </label>
        <label>
          <span className="label-base">Estado</span>
          <select value={estado} onChange={e => setEstado(e.target.value)} className="input-base">
            <option value="">Todos los estados</option>
            <option value="pendiente_infra">Pendiente Infra</option>
            <option value="aprobada_infra">Aprobada Infra</option>
            <option value="pendiente_pedido">Pendiente de pedido</option>
            <option value="pedido">Pedido</option>
            <option value="recibido">Recibido</option>
            <option value="entregado_sistemas">Entregado a Sistemas</option>
            <option value="entregado_destinatario">Entregado a destinatario</option>
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
        <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-surface-900">Solicitudes</h2>
            <p className="text-xs text-surface-500 mt-0.5">{data.length} registros visibles</p>
          </div>
          <button onClick={reload} className="btn-secondary text-xs py-2">Recargar</button>
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
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M7 4h10l3 3v13a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h1z" />
                </svg>
              </div>
              <p className="text-surface-900 font-medium">No hay solicitudes para mostrar</p>
              <p className="text-surface-500 text-sm mt-1">Ajusta los filtros o crea una nueva solicitud.</p>
            </div>
          ) : data.map(s => (
            <button key={s.id} onClick={() => navigate(`/solicitudes-compra/${s.id}`)} className="w-full text-left px-6 py-4 hover:bg-surface-50/70 transition-colors flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-surface-900">SC-{String(s.numero).padStart(4, '0')}</p>
                <p className="text-sm text-surface-500 truncate">
                  {s.beneficiario ? `${s.beneficiario.apellido}, ${s.beneficiario.nombre}` : 'Sin beneficiario'}
                  <span className="text-surface-300 mx-1.5">·</span>
                  <span className="capitalize">{(s.motivo || '').replaceAll('_', ' ')}</span>
                  <span className="text-surface-300 mx-1.5">·</span>
                  <span className="capitalize">{s.tipo_equipo}</span>
                </p>
              </div>
              <StatusBadge estado={s.estado} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
