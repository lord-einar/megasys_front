import { useState, useEffect } from 'react'
import { crmAPI } from '../../services/api'

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

export default function ModalDetalleCaso({ caso: casoInicial, onClose }) {
  const [caso, setCaso] = useState(casoInicial)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (casoInicial?.id && !casoInicial.descripcion) {
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

  const estadoBadge = ESTADO_BADGES[caso.estadoCodigo] || { label: caso.estado, style: 'bg-surface-100 text-surface-600 border-surface-200' }
  const prioridadBadge = PRIORIDAD_BADGES[caso.prioridadCodigo] || { label: caso.prioridad, style: 'bg-surface-100 text-surface-600 border-surface-200' }

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
            {caso.resueltoEn && (
              <InfoField label="Resuelto" value={new Date(caso.resueltoEn).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })} />
            )}
          </div>

          {/* Descripción */}
          {caso.descripcion && (
            <div>
              <h4 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Descripcion</h4>
              <div className="bg-surface-50 border border-surface-200 rounded-lg p-4 text-sm text-surface-700 leading-relaxed whitespace-pre-wrap">
                {caso.descripcion}
              </div>
            </div>
          )}
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
