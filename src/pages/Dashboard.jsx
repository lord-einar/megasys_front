import { useState, useEffect } from 'react'
import { sedesAPI, personalAPI, inventarioAPI, remitosAPI } from '../services/api'
import StatCard from '../components/StatCard'
import RecentActivityCard from '../components/RecentActivityCard'
import LoansAboutToExpireCard from '../components/LoansAboutToExpireCard'
import { useNavigate, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import { FileText, Package, Users, Truck, Plus, AlertTriangle, Zap } from 'lucide-react'

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
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate, location.pathname])

  const cargarEstadisticas = async () => {
    try {
      setLoading(true)

      let sedesCount = 0
      let personalCount = 0
      let inventarioCount = 0
      let remitosCount = 0

      // Cargar estadísticas
      try {
        const response = await sedesAPI.getEstadisticas()
        const estadisticas = response?.data || response
        sedesCount = estadisticas?.sedes?.activas || 0
        personalCount = estadisticas?.personal?.total || 0
        inventarioCount = estadisticas?.inventario?.total || 0
      } catch (err) {
        console.error('Error cargando estadísticas generales:', err)
      }

      // Cargar remitos
      try {
        const remitosData = await remitosAPI.list({ limit: 100 })
        const remitos = Array.isArray(remitosData.data) ? remitosData.data : remitosData || []
        remitosCount = remitosData?.pagination?.total || remitos.length || 0

        const pendientes = remitos.filter(r => r.estado !== 'completado').slice(0, 5)
        setPendingRemitos(pendientes)
      } catch (err) {
        console.warn('No se pudieron cargar los remitos pendientes:', err.message)
      }

      setStats({
        sedes: sedesCount,
        personal: personalCount,
        inventario: inventarioCount,
        remitos: remitosCount,
      })
    } catch (err) {
      console.error('Error inesperado:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Resumen general del sistema</p>
        </div>
        <div className="responsive-actions">
          <button
            onClick={() => navigate('/remitos')}
            className="btn-secondary"
          >
            <FileText className="w-4 h-4" />
            Ver Remitos
          </button>
          <button
            onClick={() => navigate('/remitos/crear')}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Nuevo Remito
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Sedes Activas"
          value={stats.sedes}
          icon="building"
          subtitle="Total operativo"
        />
        <StatCard
          title="Personal"
          value={stats.personal}
          icon="users"
          subtitle="Activos hoy"
        />
        <StatCard
          title="Inventario"
          value={stats.inventario}
          icon="package"
          subtitle="Items registrados"
        />
        <StatCard
          title="Remitos"
          value={stats.remitos}
          icon="document"
          subtitle="Movimientos"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column (2/3) */}
        <div className="xl:col-span-2 space-y-8">
          <RecentActivityCard />
          <LoansAboutToExpireCard />

          {/* Pending Confirmations Section */}
          {pendingRemitos.length > 0 && (
            <div className="card-base p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  Remitos Pendientes
                </h2>
                <button
                  onClick={() => navigate('/remitos')}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Ver todos
                </button>
              </div>

              <div className="space-y-3">
                {pendingRemitos.slice(0, 5).map((remito) => (
                  <div
                    key={remito.id}
                    onClick={() => navigate(`/remitos/${remito.id}`)}
                    className="group relative flex items-center justify-between p-4 bg-white border border-surface-100 rounded-xl hover:border-amber-200 hover:shadow-md hover:shadow-amber-500/5 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-surface-50 flex items-center justify-center text-surface-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-surface-900 group-hover:text-primary-700 transition-colors">
                          #{remito.numero_remito}
                        </p>
                        <p className="text-sm text-surface-500">
                          Solicitante: <span className="font-medium text-surface-700">{remito.solicitante?.nombre || 'N/A'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-medium text-surface-400">Estado</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                          {remito.estado || 'Pendiente'}
                        </span>
                      </div>
                      <svg className="w-5 h-5 text-surface-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="card-base p-6 sticky top-24">
            <h2 className="text-lg font-bold text-surface-900 mb-6 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 ring-1 ring-primary-100">
                <Zap className="w-4 h-4" />
              </span>
              Acciones Rápidas
            </h2>
            <div className="grid gap-3">
              <ActionButton
                icon={FileText}
                label="Nuevo Remito"
                onClick={() => navigate('/remitos/crear')}
                primary
              />
              <ActionButton
                icon={Package}
                label="Nuevo Artículo"
                onClick={() => navigate('/inventario/crear')}
              />
              <ActionButton
                icon={Users}
                label="Nuevo Personal"
                onClick={() => navigate('/personal/crear')}
              />
              <ActionButton
                icon={Truck}
                label="Nuevo Proveedor"
                onClick={() => navigate('/proveedores/nuevo')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionButton({ icon: Icon, label, onClick, primary = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 rounded-lg border transition-colors duration-150 font-medium text-left flex items-center gap-3 group ${primary
          ? 'bg-primary-50 border-primary-100 text-primary-900 hover:bg-primary-100'
          : 'bg-white border-surface-200 text-surface-700 hover:border-primary-200 hover:text-primary-700 hover:shadow-sm'
        }`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${primary ? 'bg-white text-primary-600' : 'bg-surface-50 text-surface-500 group-hover:text-primary-600'}`}>
        <Icon className="w-5 h-5" />
      </span>
      <span className="font-semibold text-sm">{label}</span>
      <svg className={`w-4 h-4 ml-auto transition-transform ${primary ? 'text-primary-400 group-hover:text-primary-600' : 'text-surface-300 group-hover:text-primary-500'} group-hover:translate-x-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}

export default Dashboard
