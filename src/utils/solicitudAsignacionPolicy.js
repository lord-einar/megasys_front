// Espejo (solo UI) de megasys_back/src/modules/solicitudesAsignacion/services/solicitudAsignacionPolicy.js
// La autoridad es el backend; mantener ambos en sync ante cambios de reglas.
const ESTADOS_ASIGNABLES_COMPRAS = ['pendiente_infra', 'pendiente_rrhh', 'pendiente_compra', 'aprobada']
// La entrega va antes que el remito: se puede generar con la solicitud aprobada
// o ya entregada (finalizada), mientras no exista remito.
const ESTADOS_GENERAR_REMITO = ['aprobada', 'finalizada'];

export const esCompraPendiente = (solicitud) =>
  solicitud?.compra_pendiente === true || solicitud?.estado === 'pendiente_compra';

export const comprasPuedeAsignarEquipo = (solicitud, hasCompras) =>
  !!hasCompras &&
  !!solicitud &&
  solicitud.tipo_equipo === 'celular' &&
  !solicitud.inventario_asignado_id &&
  !solicitud.remito_id &&
  ESTADOS_ASIGNABLES_COMPRAS.includes(solicitud.estado)

// Aprobada + equipo asignado = lista para entregar. Incluye remito_generado
// (borrador automático de Compras) porque tampoco fue entregada todavía.
export const pendienteDeEntrega = (solicitud) =>
  !!solicitud &&
  !!solicitud.inventario_asignado_id &&
  ['aprobada', 'remito_generado'].includes(solicitud.estado)

export const puedeGenerarRemito = (solicitud) =>
  !!solicitud &&
  !!solicitud.inventario_asignado_id &&
  !solicitud.remito_id &&
  ESTADOS_GENERAR_REMITO.includes(solicitud.estado);
