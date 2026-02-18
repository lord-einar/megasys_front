import { useState } from 'react'
import { inventarioAPI } from '../services/api'
import Swal from 'sweetalert2'

function getGradient(estado, diasRestantes) {
  if (estado === 'con_garantia' && diasRestantes !== null) {
    if (diasRestantes <= 0) return 'from-rose-600 to-rose-700'
    if (diasRestantes <= 90) return 'from-amber-500 to-amber-600'
    return 'from-emerald-600 to-emerald-700'
  }
  return 'from-surface-400 to-surface-500'
}

function getEstadoLabel(estado) {
  const labels = {
    sin_consultar: 'Sin consultar',
    consultando: 'Consultando...',
    con_garantia: 'Con garantía',
    sin_garantia: 'Sin garantía',
    error: 'Error en consulta'
  }
  return labels[estado] || estado
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

function formatTipoEntrega(tipo) {
  const labels = {
    on_site: 'On-Site',
    depot: 'Depot',
    mail_in: 'Mail-In'
  }
  return labels[tipo] || tipo || '-'
}

export default function GarantiaCard({ item, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false)

  const garantias = item?.garantias || []
  const resumen = item?.resumenGarantia || {}
  const estado = item?.garantia_estado || 'sin_consultar'
  const diasRestantes = resumen.diasRestantes ?? null

  const gradient = getGradient(estado, diasRestantes)

  const handleRefrescar = async () => {
    const result = await Swal.fire({
      title: 'Refrescar Garantía',
      text: 'Se volverá a consultar la información de garantía del fabricante.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Refrescar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl'
      }
    })

    if (!result.isConfirmed) return

    try {
      setRefreshing(true)
      await inventarioAPI.refrescarGarantia(item.id)
      await Swal.fire({
        title: 'Actualizado',
        text: 'La información de garantía ha sido actualizada.',
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        customClass: { popup: 'rounded-2xl' }
      })
      if (onRefresh) onRefresh()
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error al refrescar la garantía.',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden`}>
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
      <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-20 h-20 rounded-full bg-black/10 blur-xl"></div>

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-lg leading-tight">Garantía</h3>
          <p className="text-white/70 text-xs font-medium">{getEstadoLabel(estado)}</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {estado === 'con_garantia' && diasRestantes !== null && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">
              {diasRestantes > 0 ? 'Vence en' : 'Expirada hace'}
            </p>
            <p className="font-bold text-white text-xl">
              {Math.abs(diasRestantes)} días
            </p>
            <p className="text-white/70 text-xs mt-0.5">
              Hasta: {formatDate(resumen.mejorFechaFin)}
            </p>
          </div>
        )}

        {estado === 'con_garantia' && resumen.total > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Total</p>
              <p className="font-bold text-white text-sm">{resumen.total} garantías</p>
            </div>
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Activas</p>
              <p className="font-bold text-white text-sm">{resumen.activas} activas</p>
            </div>
          </div>
        )}

        {/* Lista de garantías */}
        {garantias.length > 0 && (
          <div className="space-y-2">
            {garantias.map((g, idx) => (
              <div key={g.id || idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 border border-white/10">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-xs truncate">{g.nombre || g.descripcion || 'Garantía'}</p>
                    <p className="text-white/60 text-[10px] mt-0.5">
                      {formatTipoEntrega(g.tipo_entrega)} · {g.duracion_meses ? `${g.duracion_meses}m` : ''} · {formatDate(g.fecha_inicio)} - {formatDate(g.fecha_fin)}
                    </p>
                  </div>
                  <span className={`shrink-0 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                    g.estado === 'activa'
                      ? 'bg-white/20 border-white/30 text-white'
                      : 'bg-black/10 border-white/10 text-white/50'
                  }`}>
                    {g.estado === 'activa' ? 'Activa' : 'Expirada'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Última consulta y botón refrescar */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <p className="text-white/50 text-[10px]">
            {item?.garantia_consultada_en
              ? `Consultado: ${formatDate(item.garantia_consultada_en)}`
              : 'No consultado aún'
            }
          </p>
          <button
            onClick={handleRefrescar}
            disabled={refreshing}
            className="text-white/70 hover:text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            {refreshing ? (
              <>
                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                Consultando...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refrescar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
