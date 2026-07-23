// Mapeo de estados del módulo de Solicitudes de Asignación a la paleta de badges.
const ESTADO_CONFIG = {
  pendiente_infra: {
    label: 'En revisión Infra',
    classes: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  pendiente_rrhh: {
    label: 'Pendiente RRHH',
    classes: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  pendiente_compra: {
    label: 'Compra pendiente',
    classes: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  aprobada: {
    label: 'Aprobada',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  remito_generado: {
    label: 'Remito generado',
    classes: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  finalizada: {
    label: 'Finalizada',
    classes: 'bg-green-50 text-green-700 border-green-200'
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

export default function StatusBadgeAsignacion({ estado, className = '' }) {
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
