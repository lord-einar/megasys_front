import { useState, useEffect } from 'react'
import { sedesAPI, personalAPI, inventarioAPI, remitosAPI } from '../services/api'
import StatCard from '../components/StatCard'
import RecentActivityCard from '../components/RecentActivityCard'
import LoansAboutToExpireCard from '../components/LoansAboutToExpireCard'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    sedes: 0,
    personal: 0,
    inventario: 0,
    remitos: 0,
  })
  const [pendingRemitos, setPendingRemitos] = useState([])
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
      let remitosCount = 0

      // Usar el endpoint de estadísticas para sedes (más eficiente)
      try {
        const response = await sedesAPI.getEstadisticas()
        const estadisticas = response?.data || response
        sedesCount = estadisticas?.sedes?.activas || 0
        personalCount = estadisticas?.personal?.total || 0
        inventarioCount = estadisticas?.inventario?.total || 0
      } catch (err) {
        console.error('Error cargando estadísticas generales:', err)
      }

      // Cargar remitos pendientes de confirmación
      // Estos son remitos que aún no están en estado 'completado'
      try {
        const remitosData = await remitosAPI.list({
          limit: 100  // Cargar sin filtro de estado para obtener todos
        })

        const remitos = Array.isArray(remitosData.data) ? remitosData.data : remitosData || []
        remitosCount = remitosData?.pagination?.total || remitos.length || 0
        // Filtrar solo los que NO estén en estado 'completado' (aún no han sido confirmados)
        const pendientes = remitos.filter(r => r.estado !== 'completado').slice(0, 5)
        setPendingRemitos(pendientes)
      } catch (err) {
        console.warn('No se pudieron cargar los remitos pendientes:', err.message)
        setPendingRemitos([])
      }

      setStats({
        sedes: sedesCount,
        personal: personalCount,
        inventario: inventarioCount,
        remitos: remitosCount,
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
            <button
              onClick={() => navigate('/remitos')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ver Remitos
            </button>
            <button
              onClick={() => navigate('/remitos/crear')}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Remito
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

          {/* Pending Confirmations Card */}
          {pendingRemitos.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Remitos Pendientes de Confirmación
              </h2>
              <div className="space-y-3">
                {pendingRemitos.slice(0, 5).map((remito) => (
                  <div
                    key={remito.id}
                    onClick={() => navigate(`/remitos/${remito.id}`)}
                    className="p-3 bg-warning-50 border border-warning-200 rounded-lg hover:bg-warning-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{remito.numero_remito}</p>
                        <p className="text-sm text-gray-600">
                          Solicitante: {remito.solicitante?.nombre || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-warning-200 text-warning-800 text-xs font-semibold rounded-full">
                          Pendiente
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/remitos')}
                className="mt-4 w-full px-4 py-2 bg-warning-100 text-warning-800 hover:bg-warning-200 rounded-lg font-medium transition-colors text-sm"
              >
                Ver todos los remitos pendientes
              </button>
            </div>
          )}
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
              <button
                onClick={() => navigate('/remitos/crear')}
                className="w-full px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-left flex items-center gap-3"
              >
                <span className="text-lg">📄</span>
                <span>Nuevo Remito</span>
              </button>
              <button
                onClick={() => navigate('/inventario/crear')}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium text-left flex items-center gap-3"
              >
                <span className="text-lg">📦</span>
                <span>Nuevo Artículo</span>
              </button>
              <button
                onClick={() => navigate('/personal/crear')}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium text-left flex items-center gap-3"
              >
                <span className="text-lg">👥</span>
                <span>Nuevo Personal</span>
              </button>
              <button
                onClick={() => navigate('/proveedores/crear')}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium text-left flex items-center gap-3"
              >
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