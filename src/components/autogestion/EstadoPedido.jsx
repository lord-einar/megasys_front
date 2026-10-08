import { Ban, CircleCheck, CircleDashed, Clock, PackageCheck, Truck, XCircle } from 'lucide-react'

const nombre = (p) => (p ? `${p.nombre} ${p.apellido}` : '')

// Qué pasó con la solicitud después de aprobado el pedido, en palabras de la persona
const ETAPA_SOLICITUD = {
  pendiente_infra: { texto: 'Infraestructura lo está revisando', Icono: CircleDashed, clase: 'status-progress' },
  pendiente_compra: { texto: 'Infraestructura lo está revisando', Icono: CircleDashed, clase: 'status-progress' },
  pendiente_rrhh: { texto: 'RRHH lo está revisando', Icono: CircleDashed, clase: 'status-progress' },
  aprobada: { texto: 'Aprobado: falta la entrega', Icono: PackageCheck, clase: 'status-ready' },
  remito_generado: { texto: 'Listo para entregar', Icono: Truck, clase: 'status-ready' },
  finalizada: { texto: 'Entregado', Icono: CircleCheck, clase: 'status-done' },
  rechazada: { texto: 'Rechazado por Infraestructura o RRHH', Icono: XCircle, clase: 'status-stop' },
  cancelada: { texto: 'Cancelado en el portal', Icono: Ban, clase: 'status-neutral' }
}

/** Estado de un pedido de autogestión con ícono y texto (nunca solo color). */
function describirEstado(pedido) {
  switch (pedido.estado) {
    case 'pendiente_superior':
      return { texto: `Esperando la aprobación de ${nombre(pedido.aprobador)}`, Icono: Clock, clase: 'status-wait' }
    case 'aprobado':
      return ETAPA_SOLICITUD[pedido.solicitud?.estado] || { texto: 'Aprobado', Icono: CircleCheck, clase: 'status-done' }
    case 'rechazado':
      return { texto: `Rechazado por ${nombre(pedido.aprobador)}`, Icono: XCircle, clase: 'status-stop' }
    case 'vencido':
      return { texto: 'Dado de baja: no hubo respuesta a tiempo', Icono: Ban, clase: 'status-neutral' }
    default:
      return { texto: 'Cancelado', Icono: Ban, clase: 'status-neutral' }
  }
}

export default function EstadoPedido({ pedido }) {
  const { texto, Icono, clase } = describirEstado(pedido)
  return (
    <span className={`status ${clase}`}>
      <Icono className="h-4 w-4" aria-hidden="true" />
      {texto}
    </span>
  )
}
