import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { TIPO_EQUIPO_LABELS } from '../../utils/tipoEquipo'
import { etiquetaMotivo } from '../../utils/solicitudAsignacion'

/** Pedidos de la gente a cargo que esperan la decisión de quien ingresó. */
export default function PedidosParaAprobar({ pedidos }) {
  if (!pedidos.length) return null
  return (
    <section className="card-base border-l-4 border-l-primary-500" aria-labelledby="titulo-para-aprobar">
      <h2 id="titulo-para-aprobar" className="text-base font-bold text-surface-900 p-6 pb-3">
        Pedidos para aprobar ({pedidos.length})
      </h2>
      <ul className="divide-y divide-surface-200 border-t border-surface-200">
        {pedidos.map(p => (
          <li key={p.id} className="relative px-6 py-4 hover:bg-surface-50">
            <Link to={`/autogestion/aprobar/${p.id}`} className="flex items-center justify-between gap-3 after:absolute after:inset-0">
              <span className="min-w-0">
                <span className="block font-semibold text-surface-900 truncate">{p.solicitante.apellido}, {p.solicitante.nombre}</span>
                <span className="block text-sm text-surface-600 truncate">
                  {TIPO_EQUIPO_LABELS[p.tipo_equipo]} · {etiquetaMotivo(p.motivo)}{p.solicitante.sede ? ` · ${p.solicitante.sede.nombre_sede}` : ''}
                </span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-surface-400" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
