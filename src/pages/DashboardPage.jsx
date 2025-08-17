// ============================================
// src/pages/DashboardPage.jsx
// Dashboard principal del sistema
// ============================================
import React from 'react'
import { useAuth } from '../context/AuthContext'
import {
  BuildingOfficeIcon,
  CubeIcon,
  UsersIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const DashboardPage = () => {
  const { user, getCurrentEmpresa } = useAuth()
  const empresaActual = getCurrentEmpresa()
  
  // Datos mock para el dashboard
  const stats = [
    {
      name: 'Total Sedes',
      value: '12',
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
      change: '+2',
      changeType: 'increase'
    },
    {
      name: 'Items en Inventario',
      value: '1,247',
      icon: CubeIcon,
      color: 'bg-green-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Personal Activo',
      value: '89',
      icon: UsersIcon,
      color: 'bg-purple-500',
      change: '+3',
      changeType: 'increase'
    },
    {
      name: 'Remitos Pendientes',
      value: '7',
      icon: DocumentIcon,
      color: 'bg-orange-500',
      change: '-2',
      changeType: 'decrease'
    }
  ]
  
  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Préstamos por vencer',
      message: '3 items de inventario vencen en los próximos 7 días',
      action: 'Ver préstamos'
    },
    {
      id: 2,
      type: 'success',
      title: 'Remitos confirmados',
      message: '5 remitos fueron confirmados hoy',
      action: 'Ver remitos'
    },
    {
      id: 3,
      type: 'info',
      title: 'Nuevo personal',
      message: '2 nuevos empleados agregados esta semana',
      action: 'Ver personal'
    }
  ]
  
  const recentActivity = [
    {
      id: 1,
      user: 'Juan Pérez',
      action: 'creó un remito',
      target: 'REM-20240817-001',
      time: 'hace 2 horas',
      type: 'create'
    },
    {
      id: 2,
      user: 'María González',
      action: 'actualizó inventario',
      target: 'Laptop HP - ABC123',
      time: 'hace 4 horas',
      type: 'update'
    },
    {
      id: 3,
      user: 'Carlos López',
      action: 'confirmó recepción',
      target: 'REM-20240816-005',
      time: 'hace 6 horas',
      type: 'confirm'
    }
  ]
  
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Bienvenido, {user?.nombre}!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {empresaActual ? `${empresaActual.nombre}` : 'Dashboard'} - 
              {new Date().toLocaleDateString('es-AR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Generar Reporte
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} p-3 rounded-md`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Alerts */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Alertas y Notificaciones
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-md border-l-4 ${
                    alert.type === 'warning' ? 'border-yellow-400 bg-yellow-50' :
                    alert.type === 'success' ? 'border-green-400 bg-green-50' :
                    'border-blue-400 bg-blue-50'
                  }`}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {alert.type === 'warning' && (
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                        )}
                        {alert.type === 'success' && (
                          <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        )}
                        {alert.type === 'info' && (
                          <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className={`text-sm font-medium ${
                          alert.type === 'warning' ? 'text-yellow-800' :
                          alert.type === 'success' ? 'text-green-800' :
                          'text-blue-800'
                        }`}>
                          {alert.title}
                        </h4>
                        <p className={`mt-1 text-sm ${
                          alert.type === 'warning' ? 'text-yellow-700' :
                          alert.type === 'success' ? 'text-green-700' :
                          'text-blue-700'
                        }`}>
                          {alert.message}
                        </p>
                        <div className="mt-2">
                          <button className={`text-sm font-medium underline ${
                            alert.type === 'warning' ? 'text-yellow-800 hover:text-yellow-900' :
                            alert.type === 'success' ? 'text-green-800 hover:text-green-900' :
                            'text-blue-800 hover:text-blue-900'
                          }`}>
                            {alert.action}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Actividad Reciente
              </h3>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivity.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivity.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              activity.type === 'create' ? 'bg-green-500' :
                              activity.type === 'update' ? 'bg-blue-500' :
                              'bg-orange-500'
                            }`}>
                              {activity.type === 'create' && (
                                <DocumentIcon className="h-4 w-4 text-white" />
                              )}
                              {activity.type === 'update' && (
                                <CubeIcon className="h-4 w-4 text-white" />
                              )}
                              {activity.type === 'confirm' && (
                                <CheckCircleIcon className="h-4 w-4 text-white" />
                              )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-900">
                                  {activity.user}
                                </span>{' '}
                                <span className="text-gray-500">
                                  {activity.action}
                                </span>{' '}
                                <span className="font-medium text-gray-900">
                                  {activity.target}
                                </span>
                              </div>
                              <p className="mt-0.5 text-sm text-gray-500">
                                {activity.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Ver toda la actividad
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage