import { useState, useEffect } from 'react'

function RecentActivityCard() {
  const [activities, setActivities] = useState([])

  useEffect(() => {
    // Datos de ejemplo
    setActivities([
      {
        id: 1,
        type: 'transfer',
        description: 'Remito #001 - Transferencia de laptop a Sede Central',
        timestamp: '2024-10-21 10:30',
        user: 'Juan García',
      },
      {
        id: 2,
        type: 'inventory',
        description: 'Nuevo artículo agregado - Monitor Samsung 27"',
        timestamp: '2024-10-21 09:15',
        user: 'María López',
      },
      {
        id: 3,
        type: 'staff',
        description: 'Nuevo personal - Carlos Mendez (Técnico Senior)',
        timestamp: '2024-10-20 16:45',
        user: 'Admin',
      },
      {
        id: 4,
        type: 'service',
        description: 'Servicio de soporte asignado a Sede Norte',
        timestamp: '2024-10-20 14:20',
        user: 'Admin',
      },
    ])
  }, [])

  const getActivityIcon = (type) => {
    const icons = {
      transfer: '📤',
      inventory: '📦',
      staff: '👤',
      service: '🔧',
    }
    return icons[type] || '📝'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Actividad Reciente
      </h2>
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
              <p className="text-sm font-medium text-gray-900 truncate">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {activity.timestamp} • Por {activity.user}
              </p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentActivityCard
