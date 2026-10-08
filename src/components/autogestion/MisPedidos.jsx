import { useState } from 'react'
import { Inbox } from 'lucide-react'
import EstadoPedido from './EstadoPedido'
import { autogestionAPI } from '../../services/autogestionApi'
import { TIPO_EQUIPO_LABELS } from '../../utils/tipoEquipo'
import { etiquetaMotivo } from '../../utils/solicitudAsignacion'

const fecha = (iso) => new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
const codigo = (p) => `PE-${String(p.numero).padStart(4, '0')}`

/** Historial de pedidos de la persona, con su estado y la opción de cancelar los pendientes. */
export default function MisPedidos({ pedidos, onCambio }) {
  const [cancelando, setCancelando] = useState(null)
  const [error, setError] = useState(null)

  const cancelar = async (id) => {
    setError(null)
    try {
      await autogestionAPI.cancelarPedido(id)
      setCancelando(null)
      onCambio?.('Pedido cancelado')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="card-base" aria-labelledby="titulo-mis-pedidos">
      <h2 id="titulo-mis-pedidos" className="text-base font-bold text-surface-900 p-6 pb-3">Mis pedidos</h2>
      {error && <p className="mx-6 mb-3 rounded-md px-3 py-2 text-sm font-semibold status-stop" role="alert">{error}</p>}

      {!pedidos.length ? (
        <div className="px-6 pb-8 text-center">
          <Inbox className="h-10 w-10 mx-auto text-surface-400" strokeWidth={1.75} aria-hidden="true" />
          <p className="mt-2 text-sm text-surface-600">Todavía no hiciste pedidos.</p>
        </div>
      ) : (
        <ul className="divide-y divide-surface-200 border-t border-surface-200">
          {pedidos.map(p => (
            <li key={p.id} className="px-6 py-4 space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-surface-900">
                  {TIPO_EQUIPO_LABELS[p.tipo_equipo]} · {etiquetaMotivo(p.motivo)}
                </p>
                <p className="text-sm text-surface-600">{codigo(p)} · {fecha(p.created_at)}</p>
              </div>
              <EstadoPedido pedido={p} />
              {p.estado === 'rechazado' && p.motivo_rechazo && (
                <p className="text-sm text-surface-600"><strong className="text-surface-900">Motivo:</strong> {p.motivo_rechazo}</p>
              )}
              {p.nota_aprobacion && (
                <p className="text-sm text-surface-600"><strong className="text-surface-900">Nota de tu superior:</strong> {p.nota_aprobacion}</p>
              )}
              {p.estado === 'pendiente_superior' && (
                cancelando === p.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">¿Cancelar este pedido?</span>
                    <button className="btn-danger" onClick={() => cancelar(p.id)}>Sí, cancelar</button>
                    <button className="btn-secondary" onClick={() => setCancelando(null)}>No</button>
                  </div>
                ) : (
                  <button className="btn-secondary" onClick={() => setCancelando(p.id)}>Cancelar pedido</button>
                )
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
