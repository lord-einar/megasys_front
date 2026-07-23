const ESTADOS_ASIGNABLES_COMPRAS = ['pendiente_infra', 'pendiente_rrhh', 'pendiente_compra'];

export const esCompraPendiente = (solicitud) =>
  solicitud?.compra_pendiente === true || solicitud?.estado === 'pendiente_compra';

export const comprasPuedeAsignarEquipo = (solicitud, hasCompras) =>
  !!hasCompras &&
  !!solicitud &&
  solicitud.tipo_equipo === 'celular' &&
  !solicitud.inventario_asignado_id &&
  !solicitud.remito_id &&
  ESTADOS_ASIGNABLES_COMPRAS.includes(solicitud.estado);
