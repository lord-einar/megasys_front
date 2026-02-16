import { useState, useEffect } from 'react'
import { remitosAPI } from '../services/api'

function RecentActivityCard() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarActividades()
  }, [])

  const cargarActividades = async () => {
    try {
      setLoading(true)
      const response = await remitosAPI.list({ limit: 10 })
      const remitos = Array.isArray(response.data) ? response.data : response || []

      const actividades = remitos.slice(0, 5).map((remito) => ({
        id: remito.id,
        type: 'transfer',
        description: `Remito #${remito.numero_remito} - ${remito.descripcion || 'Transferencia de artículos'}`,
        timestamp: new Date(remito.created_at).toLocaleString('es-AR'),
        user: remito.tecnicoAsignado?.nombre || 'Sistema',
        estado: remito.estado,
      }))

      setActivities(actividades)
    } catch (err) {
      console.error('Error cargando actividades:', err)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type) => {
    const icons = {
      transfer: '📤',
      inventory: '📦',
      staff: '👤',
      service: '🔧',
    }
    return icons[type] || '📝'
  }

  const getEstadoBadgeColor = (estado) => {
    const colors = {
      'pendiente': 'bg-amber-50 text-amber-700 border-amber-200',
      'en transito': 'bg-info-50 text-info-700 border-info-200',
      'en tránsito': 'bg-info-50 text-info-700 border-info-200',
      'confirmado': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'completado': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'cancelado': 'bg-rose-50 text-rose-700 border-rose-200',
    }
    return colors[estado?.toLowerCase()] || 'bg-surface-100 text-surface-700 border-surface-200'
  }

  return (
    <div className="card-base p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-surface-900 tracking-tight flex items-center gap-2">
          <span className="p-1.5 bg-surface-50 rounded-lg text-surface-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          Actividad Reciente
        </h2>
        <button className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline">Ver todo</button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="h-8 w-8 border-2 border-surface-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-surface-400">Actualizando feed...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 bg-surface-50/50 rounded-xl border border-dashed border-surface-200">
          <p className="text-surface-500 font-medium text-sm">No hay actividades recientes</p>
          <p className="text-xs text-surface-400 mt-1">Los movimientos aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-0 relative before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-surface-100">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex gap-4 pb-6 last:pb-0 group relative z-10"
            >
              <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-white border border-surface-100 flex items-center justify-center text-xl shadow-sm z-10 group-hover:scale-110 group-hover:border-primary-200 group-hover:text-primary-600 transition-all duration-300">
                {getActivityIcon(activity.type)}
              </div>

              <div className="flex-1 min-w-0 pt-1 group-hover:translate-x-1 transition-transform duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-surface-900 leading-tight">
                      {activity.description}
                    </p>
                    <p className="text-xs text-surface-500 mt-1 flex items-center gap-1.5">
                      <span className="font-medium text-surface-600">{activity.user}</span>
                      <span className="w-1 h-1 rounded-full bg-surface-300"></span>
                      <span>{activity.timestamp}</span>
                    </p>
                  </div>
                  {activity.estado && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${getEstadoBadgeColor(activity.estado)}`}>
                      {activity.estado}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecentActivityCard
