import { useState, useEffect } from 'react'
import { sedesAPI, personalAPI, inventarioAPI, remitosAPI } from '../services/api'
import StatCard from '../components/StatCard'
import RecentActivityCard from '../components/RecentActivityCard'
import LoansAboutToExpireCard from '../components/LoansAboutToExpireCard'
import { useNavigate } from 'react-router-dom'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

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
      try {
        const remitosData = await remitosAPI.list({
          limit: 100
        })

        const remitos = Array.isArray(remitosData.data) ? remitosData.data : remitosData || []
        remitosCount = remitosData?.pagination?.total || remitos.length || 0
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-slate-600 font-medium">Últimos 30 días</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/remitos')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ver Remitos
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/remitos/crear')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Remito
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column - Recent Activity & Loans */}
        <div className="xl:col-span-2 space-y-6">
          <RecentActivityCard />
          <LoansAboutToExpireCard />

          {/* Pending Confirmations Card */}
          {pendingRemitos.length > 0 && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Remitos Pendientes de Confirmación
                </CardTitle>
                <Badge variant="warning">{pendingRemitos.length} pendientes</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingRemitos.slice(0, 5).map((remito) => (
                    <div
                      key={remito.id}
                      onClick={() => navigate(`/remitos/${remito.id}`)}
                      className="p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-amber-900 transition-colors">{remito.numero_remito}</p>
                          <p className="text-sm text-slate-600">
                            Solicitante: {remito.solicitante?.nombre || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="warning">Pendiente</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-4 text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                  onClick={() => navigate('/remitos')}
                >
                  Ver todos los remitos pendientes
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Quick Actions & System Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() => navigate('/remitos/crear')}
                className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-left flex items-center gap-3 border border-blue-100"
              >
                <span className="text-xl">📄</span>
                <span>Nuevo Remito</span>
              </button>
              <button
                onClick={() => navigate('/inventario/crear')}
                className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-left flex items-center gap-3 shadow-sm"
              >
                <span className="text-xl">📦</span>
                <span>Nuevo Artículo</span>
              </button>
              <button
                onClick={() => navigate('/personal/crear')}
                className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-left flex items-center gap-3 shadow-sm"
              >
                <span className="text-xl">👥</span>
                <span>Nuevo Personal</span>
              </button>
              <button
                onClick={() => navigate('/proveedores/crear')}
                className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-left flex items-center gap-3 shadow-sm"
              >
                <span className="text-xl">🤝</span>
                <span>Nuevo Proveedor</span>
              </button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Servidor API</span>
                <Badge variant="success">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Base de Datos</span>
                <Badge variant="success">Estable</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Sincronización</span>
                <Badge variant="warning">Parcial</Badge>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Última Actualización</span>
                <span className="text-xs text-slate-400 font-mono">Hace 5 min</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard