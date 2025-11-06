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
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'en transito': 'bg-blue-100 text-blue-800',
      'en tránsito': 'bg-blue-100 text-blue-800',
      'confirmado': 'bg-green-100 text-green-800',
      'completado': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800',
    }
    return colors[estado?.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Actividad Reciente
      </h2>
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 text-sm mt-2">Cargando actividades...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay actividades recientes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
            >
              <div className="flex-shrink-0 text-2xl">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">
                    {activity.timestamp} • Por {activity.user}
                  </p>
                  {activity.estado && (
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getEstadoBadgeColor(activity.estado)}`}>
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
