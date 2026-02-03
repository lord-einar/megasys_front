import { useState, useEffect } from 'react'
import { sedesAPI, personalAPI, inventarioAPI, remitosAPI } from '../services/api'
import StatCard from '../components/StatCard'
import RecentActivityCard from '../components/RecentActivityCard'
import LoansAboutToExpireCard from '../components/LoansAboutToExpireCard'
import { useNavigate, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'

function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
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

  // Mostrar mensaje de error si fue redirigido por falta de permisos
  useEffect(() => {
    if (location.state?.error) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: location.state.error,
        confirmButtonColor: '#3b82f6'
      })
      // Limpiar el state para que no se muestre de nuevo
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate, location.pathname])

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
    <div className="p-8 bg-slate-50 min-h-full">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1 font-medium">Resumen general del sistema de gestión</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/remitos')}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ver Remitos
            </button>
            <button
              onClick={() => navigate('/remitos/crear')}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Remito
            </button>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-4 mt-6">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-slate-600">Últimos 30 días</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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
            <div className="card-base p-6">
              <h2 className="text-lg font-bold text-navy-900 mb-6 flex items-center gap-2">
                <div className="p-2 bg-warning-50 rounded-lg">
                  <svg className="w-5 h-5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Remitos Pendientes
              </h2>
              <div className="space-y-3">
                {pendingRemitos.slice(0, 5).map((remito) => (
                  <div
                    key={remito.id}
                    onClick={() => navigate(`/remitos/${remito.id}`)}
                    className="p-4 bg-white border border-slate-100 rounded-xl hover:border-warning-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-navy-900 group-hover:text-primary-600 transition-colors">{remito.numero_remito}</p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          Solicitante: <span className="font-medium text-slate-700">{remito.solicitante?.nombre || 'N/A'}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-warning-50 text-warning-700 border border-warning-100 text-xs font-bold rounded-full">
                          Pendiente
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/remitos')}
                className="mt-6 w-full py-3 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-navy-900 rounded-lg font-medium transition-all text-sm border border-slate-200"
              >
                Ver todos los remitos pendientes
              </button>
            </div>
          )}
        </div>

        {/* Right column - Quick Actions & System Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card-base p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-6 flex items-center gap-2">
              <div className="p-2 bg-primary-50 rounded-lg">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Acciones Rápidas
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/remitos/crear')}
                className="w-full px-4 py-3 bg-primary-50 border border-primary-100 text-primary-700 rounded-xl hover:bg-primary-100 hover:shadow-sm transition-all font-medium text-left flex items-center gap-3 group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">📄</span>
                <span className="font-semibold">Nuevo Remito</span>
              </button>
              <button
                onClick={() => navigate('/inventario/crear')}
                className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-primary-200 hover:text-primary-700 hover:shadow-sm transition-all font-medium text-left flex items-center gap-3 group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">📦</span>
                <span>Nuevo Artículo</span>
              </button>
              <button
                onClick={() => navigate('/personal/crear')}
                className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-primary-200 hover:text-primary-700 hover:shadow-sm transition-all font-medium text-left flex items-center gap-3 group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">👥</span>
                <span>Nuevo Personal</span>
              </button>
              <button
                onClick={() => navigate('/proveedores/crear')}
                className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-primary-200 hover:text-primary-700 hover:shadow-sm transition-all font-medium text-left flex items-center gap-3 group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">🤝</span>
                <span>Nuevo Proveedor</span>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="card-base p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-6 flex items-center gap-2">
              <div className="p-2 bg-success-50 rounded-lg">
                <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Estado del Sistema
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm font-medium text-slate-600">Servidor API</span>
                <span className="px-2.5 py-0.5 bg-success-50 text-success-700 border border-success-100 text-xs font-bold rounded-full">Online</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm font-medium text-slate-600">Base de Datos</span>
                <span className="px-2.5 py-0.5 bg-success-50 text-success-700 border border-success-100 text-xs font-bold rounded-full">Estable</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm font-medium text-slate-600">Sincronización</span>
                <span className="px-2.5 py-0.5 bg-warning-50 text-warning-700 border border-warning-100 text-xs font-bold rounded-full">Parcial</span>
              </div>
              <div className="flex items-center justify-between py-2 last:border-0">
                <span className="text-sm font-medium text-slate-600">Última Actualización</span>
                <span className="text-xs font-medium text-slate-400">Hace 5 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard