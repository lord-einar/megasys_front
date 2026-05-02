// Mapeo de estados a la paleta de badges del sistema (Tailwind utilities consistentes
// con los demás badges del proyecto: clases pill compactas, sin bordes pesados).
const ESTADO_CONFIG = {
  pendiente_infra: {
    label: 'Pendiente Infra',
    classes: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  aprobada_infra: {
    label: 'Aprobada Infra',
    classes: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  aprobada_rrhh: {
    label: 'Aprobada RRHH',
    classes: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  pendiente_pedido: {
    label: 'Pendiente de pedido',
    classes: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  pedido: {
    label: 'Pedido',
    classes: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  recibido: {
    label: 'Recibido',
    classes: 'bg-cyan-50 text-cyan-700 border-cyan-200'
  },
  entregado_sistemas: {
    label: 'Entregado a Sistemas',
    classes: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  entregado_destinatario: {
    label: 'Entregado a destinatario',
    classes: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  finalizada: {
    label: 'Finalizada',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  comprada: {
    label: 'Comprada',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  rechazada: {
    label: 'Rechazada',
    classes: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  cancelada: {
    label: 'Cancelada',
    classes: 'bg-surface-100 text-surface-700 border-surface-200'
  }
}

export default function StatusBadge({ estado, className = '' }) {
  const cfg = ESTADO_CONFIG[estado] || {
    label: estado || '—',
    classes: 'bg-surface-100 text-surface-700 border-surface-200'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.classes} ${className}`}>
      {cfg.label}
    </span>
  )
}

export { ESTADO_CONFIG }
