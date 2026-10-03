import { Ban, CircleCheck, CircleDashed, FileCheck, PackageCheck, ShoppingCart, XCircle } from 'lucide-react'

// Estados del módulo de Solicitudes de Asignación. Cada uno lleva ícono + texto:
// el color refuerza, nunca es la única forma de distinguirlos.
// `etapa` indica dónde está la solicitud en el riel Infra → RRHH → Entrega
// (índice de la etapa en curso; 3 = todas cumplidas; null = flujo detenido).
const ESTADO_CONFIG = {
  pendiente_infra: { label: 'En revisión Infra', tono: 'wait', Icon: CircleDashed, etapa: 0 },
  pendiente_rrhh: { label: 'En revisión RRHH', tono: 'progress', Icon: CircleDashed, etapa: 1 },
  pendiente_compra: { label: 'Compra pendiente', tono: 'buy', Icon: ShoppingCart, etapa: 0 },
  aprobada: { label: 'Aprobada, falta entregar', tono: 'ready', Icon: PackageCheck, etapa: 2 },
  remito_generado: { label: 'Remito listo, falta entregar', tono: 'ready', Icon: FileCheck, etapa: 2 },
  finalizada: { label: 'Equipo entregado', tono: 'done', Icon: CircleCheck, etapa: 3 },
  rechazada: { label: 'Rechazada', tono: 'stop', Icon: XCircle, etapa: null },
  cancelada: { label: 'Cancelada', tono: 'neutral', Icon: Ban, etapa: null }
}

const ETAPAS = ['Infra', 'RRHH', 'Entrega']

const configDe = (estado) =>
  ESTADO_CONFIG[estado] || { label: estado || '—', tono: 'neutral', Icon: CircleDashed, etapa: null }

export default function StatusBadgeAsignacion({ estado, className = '' }) {
  const { label, tono, Icon } = configDe(estado)

  return (
    <span className={`status status-${tono} ${className}`}>
      <Icon aria-hidden="true" strokeWidth={2.25} />
      {label}
    </span>
  )
}

// Riel de etapas. La descripción textual va como texto accesible; el riel es
// un refuerzo visual que distingue hecho / en curso / pendiente por forma.
export function EtapasAsignacion({ estado, className = '' }) {
  const { etapa } = configDe(estado)
  const detenida = etapa === null

  const descripcion = detenida
    ? 'Flujo detenido'
    : etapa >= ETAPAS.length
      ? 'Todas las etapas cumplidas'
      : `Etapa ${etapa + 1} de ${ETAPAS.length}: ${ETAPAS[etapa]}`

  return (
    <span className={`stage-rail ${className}`} title={descripcion}>
      {ETAPAS.map((nombre, i) => {
        const clase = detenida
          ? 'stage-halted'
          : i < etapa ? 'stage-done' : i === etapa ? 'stage-current' : 'stage-todo'
        return <span key={nombre} className={clase} aria-hidden="true" />
      })}
      <span className="sr-only">{descripcion}</span>
    </span>
  )
}

