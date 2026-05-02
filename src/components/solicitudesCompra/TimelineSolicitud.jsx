// Mapeo de cada acción del historial a un label visible y color del "punto" del timeline.
const ACCION_CONFIG = {
  creada:                 { label: 'Creada',                color: 'bg-surface-400'  },
  editada:                { label: 'Editada',               color: 'bg-surface-400'  },
  reenviada_infra:        { label: 'Reenviada a Infra',     color: 'bg-amber-500'    },
  aprobada_infra:         { label: 'Aprobada por Infra',    color: 'bg-sky-500'      },
  aprobada_rrhh:          { label: 'Aprobada por RRHH',     color: 'bg-indigo-500'   },
  pedido:                 { label: 'Pedido a proveedor',    color: 'bg-blue-500'     },
  recibido:               { label: 'Recibido',              color: 'bg-cyan-500'     },
  entregado_sistemas:     { label: 'Entregado a Sistemas',  color: 'bg-teal-500'     },
  entregado_destinatario: { label: 'Entregado al destinatario', color: 'bg-teal-500' },
  finalizada:             { label: 'Finalizada',            color: 'bg-emerald-500'  },
  comprada:               { label: 'Compra registrada',     color: 'bg-emerald-500'  },
  rechazada:              { label: 'Rechazada',             color: 'bg-rose-500'     },
  cancelada:              { label: 'Cancelada',             color: 'bg-surface-500'  },
  adjunto_agregado:       { label: 'Adjunto agregado',      color: 'bg-surface-300'  },
  adjunto_eliminado:      { label: 'Adjunto eliminado',     color: 'bg-surface-300'  }
}

const formatDateTime = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function TimelineSolicitud({ historial = [] }) {
  if (!historial.length) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto rounded-full bg-surface-50 flex items-center justify-center text-surface-400 mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-surface-500 font-medium">Sin actividad registrada todavía</p>
      </div>
    )
  }

  // Backend devuelve historial ASC; lo mostramos con el más reciente arriba.
  const items = [...historial].reverse()

  return (
    <ol className="relative border-l border-surface-200 ml-3 space-y-5 py-1">
      {items.map(h => {
        const cfg = ACCION_CONFIG[h.accion] || { label: h.accion, color: 'bg-surface-300' }
        const actor = h.actor
          ? `${h.actor.nombre} ${h.actor.apellido}`
          : (h.actor_grupo ? `(${h.actor_grupo})` : 'Sistema')
        return (
          <li key={h.id} className="ml-4">
            <span className={`absolute -left-[7px] mt-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-white ${cfg.color}`} />
            <div className="flex items-baseline gap-2 flex-wrap">
              <h4 className="text-sm font-semibold text-surface-900">{cfg.label}</h4>
              <span className="text-xs text-surface-400">{formatDateTime(h.created_at)}</span>
            </div>
            <p className="text-xs text-surface-500 mt-0.5 capitalize">por {actor}</p>
            {h.comentario && (
              <p className="mt-2 text-sm text-surface-700 bg-surface-50 border border-surface-200 rounded-xl px-3 py-2">
                {h.comentario}
              </p>
            )}
            {h.diff && Object.keys(h.diff).length > 0 && (
              <details className="mt-2">
                <summary className="text-xs text-surface-400 cursor-pointer hover:text-surface-600 font-medium">
                  Ver detalles del cambio
                </summary>
                <pre className="mt-1.5 text-xs bg-surface-900 text-surface-100 rounded-xl p-3 overflow-x-auto font-mono">
{JSON.stringify(h.diff, null, 2)}
                </pre>
              </details>
            )}
          </li>
        )
      })}
    </ol>
  )
}
