// Constantes de UI de las solicitudes de asignación. Los valores válidos los
// define el backend (models/SolicitudAsignacion.js); mantener en sync.

export const MOTIVO_LABELS = {
  nuevo_ingreso: 'Nuevo ingreso',
  nuevo_puesto: 'Nuevo puesto',
  reposicion_robo: 'Reposición por robo',
  reposicion_perdida: 'Reposición por pérdida',
  reposicion_rotura: 'Reposición por rotura',
  cambio_equipo: 'Cambio de equipo',
  otro: 'Otro'
}

export const MOTIVOS_REPOSICION = ['reposicion_robo', 'reposicion_perdida', 'reposicion_rotura']

/** La reposición exige indicar el equipo actual del beneficiario. */
export const esReposicion = (motivo) => MOTIVOS_REPOSICION.includes(motivo)

/** Robo pide denuncia y rotura pide foto: ambos muestran la sección de documentación. */
export const requiereDocumentacion = (motivo) => motivo === 'reposicion_robo' || motivo === 'reposicion_rotura'

export const etiquetaMotivo = (motivo) => MOTIVO_LABELS[motivo] || (motivo || '').replaceAll('_', ' ')

// De qué pedido de autogestión salió: aprobado por el superior o cargado directo (sin superior)
export function textoOrigenAutogestion(pedido) {
  const codigo = pedido ? `PE-${String(pedido.numero).padStart(4, '0')}` : null
  if (pedido?.autoaprobado) return `Pedida por la persona en autogestión (${codigo}); sin superior en el organigrama, se cargó directo`
  const aprobador = pedido?.aprobador ? ` (${pedido.aprobador.nombre} ${pedido.aprobador.apellido})` : ''
  return `Pedida por la persona en autogestión${codigo ? ` (${codigo})` : ''} y aprobada por su superior${aprobador}`
}
