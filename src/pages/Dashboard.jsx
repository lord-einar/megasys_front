import { useState, useEffect } from 'react'
import { sedesAPI, personalAPI, inventarioAPI } from '../services/api'
import StatCard from '../components/StatCard'
import RecentActivityCard from '../components/RecentActivityCard'
import LoansAboutToExpireCard from '../components/LoansAboutToExpireCard'

function Dashboard() {
  const [stats, setStats] = useState({
    sedes: 0,
    personal: 0,
    inventario: 0,
    remitos: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      setLoading(true)

      // Cargar cada estadística por separado para que un error no afecte a las otras
      let sedesCount = 0
      let personalCount = 0
      let inventarioCount = 0

      try {
        const sedesData = await sedesAPI.list({ limit: 1 })
        sedesCount = sedesData.pagination?.total || 0
      } catch (err) {
        console.error('Error cargando sedes:', err)
      }

      try {
        const personalData = await personalAPI.list({ limit: 1 })
        personalCount = personalData.pagination?.total || 0
      } catch (err) {
        console.error('Error cargando personal:', err)
      }

      try {
        const inventarioData = await inventarioAPI.list({ limit: 1 })
        inventarioCount = inventarioData?.pagination?.total || inventarioData?.total || 0
      } catch (err) {
        console.warn('Inventario no disponible:', err.message)
        // Inventario puede no estar implementado, es opcional
      }

      setStats({
        sedes: sedesCount,
        personal: personalCount,
        inventario: inventarioCount,
        remitos: 0, // Placeholder - remitos no está completamente implementado
      })
    } catch (err) {
      console.error('Error inesperado cargando estadísticas:', err)
      // Mantener valores anteriores en caso de error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Resumen general del sistema de gestión</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Generar Reporte
            </button>
            <button className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Operación
            </button>
          </div>
        </div>
        
        {/* Date Filter */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-600">Últimos 30 días</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <StatCard
    title="Sedes Activas"
    value={stats.sedes}
    icon="building"
    trend={12}
    subtitle="+2 este mes"
  />
  <StatCard
    title="Personal"
    value={stats.personal}
    icon="users"
    trend={8}
    subtitle="+3 este mes"
  />
  <StatCard
    title="Inventario"
    value={stats.inventario}
    icon="package"
    trend={15}
    subtitle="+34 este mes"
  />
  <StatCard
    title="Remitos"
    value={stats.remitos}
    icon="document"
    trend={-2}
    subtitle="-1 este mes"
  />
</div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left column - Recent Activity & Loans */}
        <div className="xl:col-span-2 space-y-8">
          <RecentActivityCard />
          <LoansAboutToExpireCard />
        </div>

        {/* Right column - Quick Actions & System Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Acciones Rápidas
            </h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-left flex items-center gap-3">
                <span className="text-lg">📄</span>
                <span>Nuevo Remito</span>
              </button>
              <button className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium text-left flex items-center gap-3">
                <span className="text-lg">📦</span>
                <span>Nuevo Artículo</span>
              </button>
              <button className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium text-left flex items-center gap-3">
                <span className="text-lg">👥</span>
                <span>Nuevo Personal</span>
              </button>
              <button className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium text-left flex items-center gap-3">
                <span className="text-lg">🤝</span>
                <span>Nuevo Proveedor</span>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Estado del Sistema
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Servidor API</span>
                <span className="px-2 py-1 bg-success-100 text-success-700 text-xs font-medium rounded-full">Online</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Base de Datos</span>
                <span className="px-2 py-1 bg-success-100 text-success-700 text-xs font-medium rounded-full">Estable</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Sincronización</span>
                <span className="px-2 py-1 bg-warning-100 text-warning-700 text-xs font-medium rounded-full">Parcial</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Última Actualización</span>
                <span className="text-xs text-gray-500">Hace 5 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard