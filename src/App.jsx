import { lazy, Suspense, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import LoginLoadingScreen from './components/LoginLoadingScreen'
import NovedadesPersonalBanner from './components/NovedadesPersonalBanner'
import { useAuth } from './contexts/AuthContext'
import { usePermissions } from './hooks/usePermissions'

// Cada pantalla se descarga recién cuando se visita: el arranque solo trae
// el shell, el login y lo que use la ruta actual.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const SedesPage = lazy(() => import('./pages/SedesPage'))
const SedeDetallePage = lazy(() => import('./pages/SedeDetallePage'))
const NuevaSede = lazy(() => import('./pages/NuevaSede'))
const EditSede = lazy(() => import('./pages/EditSede'))
const AsignarTecnicoPage = lazy(() => import('./pages/AsignarTecnicoPage'))
const AsignarSedesPage = lazy(() => import('./pages/AsignarSedesPage'))
const PersonalPage = lazy(() => import('./pages/PersonalPage'))
const PersonalDetailPage = lazy(() => import('./pages/PersonalDetailPage'))
const NuevoPersonal = lazy(() => import('./pages/NuevoPersonal'))
const EditPersonal = lazy(() => import('./pages/EditPersonal'))
const InventarioPage = lazy(() => import('./pages/InventarioPage'))
const CreateArticulo = lazy(() => import('./pages/CreateArticulo'))
const EditArticulo = lazy(() => import('./pages/EditArticulo'))
const InventarioDetailPage = lazy(() => import('./pages/InventarioDetailPage'))
const RemitoListPage = lazy(() => import('./pages/RemitoListPage'))
const CreateRemitoPage = lazy(() => import('./pages/CreateRemitoPage'))
const RemitoDetailPage = lazy(() => import('./pages/RemitoDetailPage'))
const EquiposAsignadosPage = lazy(() => import('./pages/EquiposAsignadosPage'))
const NovedadesPersonalPage = lazy(() => import('./pages/NovedadesPersonalPage'))
const ConfirmacionRecepcionPage = lazy(() => import('./pages/ConfirmacionRecepcionPage'))
const VisitasPage = lazy(() => import('./pages/VisitasPage'))
const SolicitudPreVisitaPage = lazy(() => import('./pages/SolicitudPreVisitaPage'))
const VisitaFeedbackPublico = lazy(() => import('./pages/VisitaFeedbackPublico'))
const ReportesVisitasPage = lazy(() => import('./pages/ReportesVisitasPage'))
const ConfiguracionVisitasPage = lazy(() => import('./pages/ConfiguracionVisitasPage'))
const ConfiguracionRolesPage = lazy(() => import('./pages/ConfiguracionRolesPage'))
const ProveedoresPage = lazy(() => import('./pages/ProveedoresPage'))
const ProveedorDetailPage = lazy(() => import('./pages/ProveedorDetailPage'))
const ProveedorFormPage = lazy(() => import('./pages/ProveedorFormPage'))
const ServiciosPage = lazy(() => import('./pages/ServiciosPage'))
const ServicioFormPage = lazy(() => import('./pages/ServicioFormPage'))
const ReclamosPage = lazy(() => import('./pages/ReclamosPage'))
const ReclamoDetailPage = lazy(() => import('./pages/ReclamoDetailPage'))
const ReclamoFormPage = lazy(() => import('./pages/ReclamoFormPage'))
const EquiposPage = lazy(() => import('./pages/EquiposPage'))
const EquipoFormPage = lazy(() => import('./pages/EquipoFormPage'))
const EjecutivosPage = lazy(() => import('./pages/EjecutivosPage'))
const EjecutivoFormPage = lazy(() => import('./pages/EjecutivoFormPage'))
const TiposServicioPage = lazy(() => import('./pages/TiposServicioPage'))
const TipoServicioFormPage = lazy(() => import('./pages/TipoServicioFormPage'))
const TiposArticuloPage = lazy(() => import('./pages/TiposArticuloPage'))
const CasosSoportePage = lazy(() => import('./pages/CasosSoportePage'))
const StockEquiposPage = lazy(() => import('./pages/StockEquiposPage'))
const IngresoCelularesPage = lazy(() => import('./pages/IngresoCelularesPage'))
const SolicitudesAsignacionDashboard = lazy(() => import('./pages/SolicitudesAsignacionDashboard'))
const SolicitudesAsignacionListPage = lazy(() => import('./pages/SolicitudesAsignacionListPage'))
const SolicitudAsignacionFormPage = lazy(() => import('./pages/SolicitudAsignacionFormPage'))
const SolicitudAsignacionDetailPage = lazy(() => import('./pages/SolicitudAsignacionDetailPage'))
const CategoriaEquiposAsignacionPage = lazy(() => import('./pages/CategoriaEquiposAsignacionPage'))
const HistorialEquiposPersonalPage = lazy(() => import('./pages/HistorialEquiposPersonalPage'))
const HistorialEquiposSedePage = lazy(() => import('./pages/HistorialEquiposSedePage'))
const CatalogoEquiposPage = lazy(() => import('./pages/CatalogoEquiposPage'))
const LoginLoadingPreview = lazy(() => import('./pages/LoginLoadingPreview'))
const AlertaStockPage = lazy(() => import('./pages/AlertaStockPage'))

function CargandoPantalla() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status">
      <div className="h-8 w-8 rounded-full border-[3px] border-surface-200 border-t-primary-600 motion-safe:animate-spin" aria-hidden="true" />
      <span className="sr-only">Cargando pantalla…</span>
    </div>
  )
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024)
  const { isAuthenticated, loading } = useAuth()
  const { hasLegacyAccess, canViewSolicitudesAsignacion, hasInfraestructura, hasRole } = usePermissions()

  if (loading) {
    return (
      // Misma pantalla petróleo que el login: el ingreso se ve como una sola transición
      <LoginLoadingScreen message="Cargando el portal…" />
    )
  }

  // Public routes that don't require authentication
  // Check first before authentication check
  const publicPaths = ['/login', '/confirmar-recepcion', '/visitas/solicitar', '/preview/login-loading', '/alerta-stock']
  const isFeedbackPath = window.location.pathname.startsWith('/visitas/feedback/')
  if (publicPaths.includes(window.location.pathname) || isFeedbackPath) {
    return <Suspense fallback={<CargandoPantalla />}><Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/confirmar-recepcion" element={<ConfirmacionRecepcionPage />} />
      <Route path="/visitas/solicitar" element={<SolicitudPreVisitaPage />} />
      <Route path="/visitas/feedback/:token" element={<VisitaFeedbackPublico />} />
      <Route path="/preview/login-loading" element={<LoginLoadingPreview />} />
      <Route path="/alerta-stock" element={<AlertaStockPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes></Suspense>
  }

  if (!isAuthenticated) {
    return <Suspense fallback={<CargandoPantalla />}><Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/alerta-stock" element={<AlertaStockPage />} />
      <Route path="/confirmar-recepcion" element={<ConfirmacionRecepcionPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes></Suspense>
  }

  return (
    <Routes>
      <Route
        path="/*"
        element={
          <div className="flex h-screen bg-surface-50">
            <a
              href="#contenido"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary-600 focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
            >
              Saltar al contenido
            </a>
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} onClose={() => setSidebarOpen(false)} onExpand={() => setSidebarOpen(true)} />

            {/* En tablet la barra es fija y superpuesta: este espacio reserva su riel de íconos */}
            <div className="hidden md:block lg:hidden w-20 shrink-0" aria-hidden="true" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <Header
                onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                sidebarOpen={sidebarOpen}
              />

              {/* Aviso de novedades de movimiento de personal (solo super_admin) */}
              {hasRole('super_admin') && <NovedadesPersonalBanner />}

              {/* Content Area */}
              <main id="contenido" tabIndex={-1} className="flex-1 overflow-y-auto overscroll-contain focus:outline-none">
                <Suspense fallback={<CargandoPantalla />}>
                <Routes>
                  <Route path="/" element={<Navigate to={hasLegacyAccess ? '/dashboard' : '/solicitudes-asignacion/dashboard'} replace />} />
                  <Route path="/dashboard" element={hasLegacyAccess ? <Dashboard /> : <Navigate to="/solicitudes-asignacion/dashboard" replace />} />
                  {/* Rutas de solicitudes de compra — redirigen al nuevo módulo */}
                  <Route path="/solicitudes-compra/*" element={<Navigate to="/solicitudes-asignacion/dashboard" replace />} />
                  <Route path="/catalogo-equipos" element={<Navigate to="/solicitudes-asignacion/dashboard" replace />} />
                  {/* Stock accesible desde asignación */}
                  <Route path="/solicitudes-compra/stock" element={canViewSolicitudesAsignacion ? <StockEquiposPage /> : <Navigate to="/dashboard" replace />} />
                  <Route path="/solicitudes-compra/ingreso-celular" element={canViewSolicitudesAsignacion ? <IngresoCelularesPage /> : <Navigate to="/dashboard" replace />} />
                  <Route path="/solicitudes-compra/ingreso/:tipo" element={canViewSolicitudesAsignacion ? <IngresoCelularesPage /> : <Navigate to="/dashboard" replace />} />
                  <Route path="/solicitudes-compra/equipo/:id/editar" element={canViewSolicitudesAsignacion ? <IngresoCelularesPage /> : <Navigate to="/dashboard" replace />} />
                  <Route path="/solicitudes-asignacion/historial-equipos/personal/:id" element={canViewSolicitudesAsignacion ? <HistorialEquiposPersonalPage /> : <Navigate to="/dashboard" replace />} />
                  <Route path="/solicitudes-asignacion/historial-equipos/sede/:id" element={canViewSolicitudesAsignacion ? <HistorialEquiposSedePage /> : <Navigate to="/dashboard" replace />} />
                  <Route path="/solicitudes-asignacion/dashboard" element={canViewSolicitudesAsignacion ? <SolicitudesAsignacionDashboard /> : <Navigate to="/dashboard" replace />} />
                  <Route path="/solicitudes-asignacion/nueva" element={canViewSolicitudesAsignacion ? <SolicitudAsignacionFormPage /> : <Navigate to="/dashboard" replace />} />
                  <Route path="/solicitudes-asignacion/:id" element={canViewSolicitudesAsignacion ? <SolicitudAsignacionDetailPage /> : <Navigate to="/dashboard" replace />} />
                  <Route path="/solicitudes-asignacion" element={canViewSolicitudesAsignacion ? <SolicitudesAsignacionListPage /> : <Navigate to="/dashboard" replace />} />
                  <Route path="/categoria-equipos-asignacion" element={hasInfraestructura ? <CategoriaEquiposAsignacionPage /> : <Navigate to="/solicitudes-asignacion/dashboard" replace />} />
                  <Route path="/profile" element={<Profile />} />

                  {/* Sedes routes - más específicas primero */}
                  <Route path="/sedes/nueva" element={<NuevaSede />} />
                  <Route path="/sedes/:id/editar" element={<EditSede />} />
                  <Route path="/sedes/:id/asignar-tecnico" element={<AsignarTecnicoPage />} />
                  <Route path="/sedes/:id" element={<SedeDetallePage />} />
                  <Route path="/sedes" element={<SedesPage />} />

                  {/* Personal routes - más específicas primero */}
                  <Route path="/personal/crear" element={<NuevoPersonal />} />
                  <Route path="/personal/novedades" element={hasRole('super_admin') ? <NovedadesPersonalPage /> : <Navigate to="/personal" replace />} />
                  <Route path="/personal/:id/asignar-sedes" element={<AsignarSedesPage />} />
                  <Route path="/personal/:id/editar" element={<EditPersonal />} />
                  <Route path="/personal/:id" element={<PersonalDetailPage />} />
                  <Route path="/personal" element={<PersonalPage />} />
                  <Route path="/configuracion/roles" element={<ConfiguracionRolesPage />} />

                  {/* Inventario routes - más específicas primero */}
                  <Route path="/inventario/tipos-articulo" element={<TiposArticuloPage />} />
                  <Route path="/inventario/crear" element={<CreateArticulo />} />
                  <Route path="/inventario/:id/editar" element={<EditArticulo />} />
                  <Route path="/inventario/:id" element={<InventarioDetailPage />} />
                  <Route path="/inventario" element={<InventarioPage />} />

                  {/* Remitos routes - más específicas primero */}
                  <Route path="/remitos/crear" element={<CreateRemitoPage />} />
                  <Route path="/remitos/:id" element={<RemitoDetailPage />} />
                  <Route path="/remitos" element={<RemitoListPage />} />

                  {/* Celulares y notebooks asignados al personal */}
                  <Route path="/equipos-asignados" element={<EquiposAsignadosPage />} />
                  <Route path="/celulares" element={<Navigate to="/equipos-asignados" replace />} />

                  {/* CRM / Soporte routes */}
                  <Route path="/soporte" element={<CasosSoportePage />} />

                  {/* Visitas routes */}
                  <Route path="/visitas" element={<VisitasPage />} />
                  <Route path="/reportes/visitas" element={<ReportesVisitasPage />} />
                  <Route path="/configuracion/visitas" element={<ConfiguracionVisitasPage />} />

                  {/* Proveedores routes - más específicas primero */}
                  <Route path="/proveedores/reclamos/nuevo" element={<ReclamoFormPage />} />
                  <Route path="/proveedores/reclamos/:id" element={<ReclamoDetailPage />} />
                  <Route path="/proveedores/reclamos" element={<ReclamosPage />} />
                  <Route path="/proveedores/servicios/nuevo" element={<ServicioFormPage />} />
                  <Route path="/proveedores/servicios/:id/editar" element={<ServicioFormPage />} />
                  <Route path="/proveedores/servicios" element={<ServiciosPage />} />
                  <Route path="/proveedores/equipos/nuevo" element={<EquipoFormPage />} />
                  <Route path="/proveedores/equipos/:id/editar" element={<EquipoFormPage />} />
                  <Route path="/proveedores/equipos" element={<EquiposPage />} />
                  <Route path="/proveedores/ejecutivos/nuevo" element={<EjecutivoFormPage />} />
                  <Route path="/proveedores/ejecutivos/:id/editar" element={<EjecutivoFormPage />} />
                  <Route path="/proveedores/ejecutivos" element={<EjecutivosPage />} />
                  <Route path="/proveedores/tipos-servicio/nuevo" element={<TipoServicioFormPage />} />
                  <Route path="/proveedores/tipos-servicio/:id/editar" element={<TipoServicioFormPage />} />
                  <Route path="/proveedores/tipos-servicio" element={<TiposServicioPage />} />
                  <Route path="/proveedores/nuevo" element={<ProveedorFormPage />} />
                  <Route path="/proveedores/:id/editar" element={<ProveedorFormPage />} />
                  <Route path="/proveedores/:id" element={<ProveedorDetailPage />} />
                  <Route path="/proveedores" element={<ProveedoresPage />} />

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
                </Suspense>
              </main>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App
