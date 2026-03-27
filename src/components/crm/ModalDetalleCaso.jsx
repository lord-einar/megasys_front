import { useState, useEffect } from 'react'
import { crmAPI } from '../../services/api'
import Swal from 'sweetalert2'

const ESTADO_BADGES = {
  0: { label: 'Activo', style: 'bg-blue-50 text-blue-700 border-blue-100' },
  1: { label: 'Resuelto', style: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  2: { label: 'Cancelado', style: 'bg-surface-100 text-surface-600 border-surface-200' },
}

const PRIORIDAD_BADGES = {
  1: { label: 'Alta', style: 'bg-rose-50 text-rose-700 border-rose-100' },
  2: { label: 'Normal', style: 'bg-amber-50 text-amber-700 border-amber-100' },
  3: { label: 'Baja', style: 'bg-surface-50 text-surface-600 border-surface-200' },
}

const TAREA_ESTADO = {
  0: { label: 'Abierta', style: 'text-blue-700 bg-blue-50 border-blue-100' },
  1: { label: 'Completada', style: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
  2: { label: 'Cancelada', style: 'text-surface-600 bg-surface-100 border-surface-200' },
}

export default function ModalDetalleCaso({ caso: casoInicial, onClose }) {
  const [caso, setCaso] = useState(casoInicial)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Siempre cargar detalle para obtener tareas
    if (casoInicial?.id) {
      cargarDetalle()
    }
  }, [casoInicial?.id])

  const cargarDetalle = async () => {
    try {
      setLoading(true)
      const res = await crmAPI.getCaso(casoInicial.id)
      setCaso(res?.data || res)
    } catch (err) {
      console.error('Error cargando detalle del caso:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCompletarTarea = async (tareaId, asunto) => {
    const result = await Swal.fire({
      title: '¿Completar tarea?',
      html: `<p>Se marcará como completada:<br/><strong>${asunto}</strong></p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, completar',
      cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) return

    try {
      await crmAPI.completarTarea(tareaId)
      Swal.fire({ title: 'Tarea completada', icon: 'success', timer: 1500, showConfirmButton: false })
      cargarDetalle() // recargar para ver el cambio
    } catch (err) {
      Swal.fire({ title: 'Error', text: err.message || 'No se pudo completar la tarea', icon: 'error' })
    }
  }

  const handleCancelarTarea = async (tareaId, asunto) => {
    const result = await Swal.fire({
      title: '¿Cancelar tarea?',
      html: `<p>Se marcará como cancelada:<br/><strong>${asunto}</strong></p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cancelar tarea',
      cancelButtonText: 'Volver',
    })
    if (!result.isConfirmed) return

    try {
      await crmAPI.cancelarTarea(tareaId)
      Swal.fire({ title: 'Tarea cancelada', icon: 'success', timer: 1500, showConfirmButton: false })
      cargarDetalle()
    } catch (err) {
      Swal.fire({ title: 'Error', text: err.message || 'No se pudo cancelar la tarea', icon: 'error' })
    }
  }

  const estadoBadge = ESTADO_BADGES[caso.estadoCodigo] || { label: caso.estado, style: 'bg-surface-100 text-surface-600 border-surface-200' }
  const prioridadBadge = PRIORIDAD_BADGES[caso.prioridadCodigo] || { label: caso.prioridad, style: 'bg-surface-100 text-surface-600 border-surface-200' }
  const tareas = caso.tareas || []

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all">
        {loading && (
          <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start px-6 py-5 border-b border-surface-100 bg-surface-50/50 rounded-t-xl">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-primary-600 font-bold bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                {caso.numeroCaso}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${estadoBadge.style}`}>
                {estadoBadge.label}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${prioridadBadge.style}`}>
                {prioridadBadge.label}
              </span>
            </div>
            <h3 className="text-lg font-bold text-surface-900 leading-tight">{caso.titulo}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-surface-400 hover:text-surface-600 transition-colors p-1 hover:bg-surface-100 rounded-full shrink-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Cliente" value={caso.cuentaNombre || '-'} />
            <InfoField label="Asignado a" value={caso.asignadoA || '-'} />
            <InfoField label="Tipo" value={caso.tipo || '-'} />
            <InfoField label="Origen" value={caso.origen || '-'} />
            <InfoField label="Creado" value={caso.creadoEn ? new Date(caso.creadoEn).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} />
            <InfoField label="Modificado" value={caso.modificadoEn ? new Date(caso.modificadoEn).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} />
          </div>

          {/* Descripción */}
          {caso.descripcion && (
            <div>
              <h4 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Descripción</h4>
              <div className="bg-surface-50 border border-surface-200 rounded-lg p-4 text-sm text-surface-700 leading-relaxed whitespace-pre-wrap">
                {caso.descripcion}
              </div>
            </div>
          )}

          {/* Tareas */}
          <div>
            <h4 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">
              Tareas {tareas.length > 0 && <span className="text-surface-300 font-normal">({tareas.length})</span>}
            </h4>
            {tareas.length === 0 ? (
              <p className="text-xs text-surface-400 italic">
                {loading ? 'Cargando tareas...' : 'Sin tareas asociadas'}
              </p>
            ) : (
              <div className="space-y-2">
                {tareas.map(tarea => {
                  const tareaEstado = TAREA_ESTADO[tarea.estadoCodigo] || { label: tarea.estado, style: 'text-surface-600 bg-surface-100 border-surface-200' }
                  const vencida = tarea.vencimiento && tarea.estadoCodigo === 0 && new Date(tarea.vencimiento) < new Date()
                  return (
                    <div key={tarea.id} className={`border rounded-lg p-3 ${vencida ? 'border-rose-200 bg-rose-50/30' : 'border-surface-200 bg-surface-50/50'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${tareaEstado.style}`}>
                              {tareaEstado.label}
                            </span>
                            {vencida && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-rose-200 text-rose-600 bg-rose-50">
                                Vencida
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-surface-800">{tarea.asunto}</p>
                          {tarea.descripcion && (
                            <p className="text-xs text-surface-500 mt-1 line-clamp-2 whitespace-pre-wrap">{tarea.descripcion}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex gap-4 text-[10px] text-surface-400">
                          {tarea.asignadoA && <span>Asignado: {tarea.asignadoA}</span>}
                          {tarea.vencimiento && (
                            <span className={vencida ? 'text-rose-500 font-semibold' : ''}>
                              Vence: {new Date(tarea.vencimiento).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                          {tarea.creadoEn && <span>Creada: {new Date(tarea.creadoEn).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>}
                        </div>
                        {tarea.estadoCodigo === 0 && (
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => handleCompletarTarea(tarea.id, tarea.asunto)}
                              className="px-2.5 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded text-[11px] font-semibold transition-colors"
                              title="Marcar como completada"
                            >
                              ✓ Completar
                            </button>
                            <button
                              onClick={() => handleCancelarTarea(tarea.id, tarea.asunto)}
                              className="px-2.5 py-1 bg-surface-100 text-surface-500 hover:bg-rose-100 hover:text-rose-600 rounded text-[11px] font-semibold transition-colors"
                              title="Cancelar tarea"
                            >
                              ✕ Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-50 rounded-b-xl border-t border-surface-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-200 text-surface-700 rounded-lg text-sm font-medium hover:bg-surface-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase font-bold text-surface-400 tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-surface-800 font-medium">{value}</p>
    </div>
  )
}
