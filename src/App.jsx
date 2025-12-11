import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'

// Only Login loads immediately (critical for first paint)
import Login from './pages/Login'

// Lazy load all other pages for better initial load performance
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
const ConfirmacionRecepcionPage = lazy(() => import('./pages/ConfirmacionRecepcionPage'))
const VisitasPage = lazy(() => import('./pages/VisitasPage'))
const SolicitudPreVisitaPage = lazy(() => import('./pages/SolicitudPreVisitaPage'))
const VisitaFeedbackPublico = lazy(() => import('./pages/VisitaFeedbackPublico'))
const ReportesVisitasPage = lazy(() => import('./pages/ReportesVisitasPage'))

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-slate-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-slate-600 font-medium">Cargando página...</p>
    </div>
  </div>
)

function App() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Helper to determine page title based on path
  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard'
    if (pathname.startsWith('/visitas')) return 'Gestión de Visitas'
    if (pathname.startsWith('/sedes')) return 'Gestión de Sedes'
    if (pathname.startsWith('/personal')) return 'Gestión de Personal'
    if (pathname.startsWith('/inventario')) return 'Control de Inventario'
    if (pathname.startsWith('/remitos')) return 'Gestión de Remitos'
    if (pathname.startsWith('/profile')) return 'Mi Perfil'
    return 'Megasys'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 font-medium">Cargando sistema...</p>
        </div>
      </div>
    )
  }

  // Public routes
  if (['/login', '/confirmar-recepcion', '/visitas/solicitar', '/visitas/feedback'].some(path => location.pathname.startsWith(path))) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/confirmar-recepcion" element={<ConfirmacionRecepcionPage />} />
          <Route path="/visitas/solicitar" element={<SolicitudPreVisitaPage />} />
          <Route path="/visitas/feedback/:token" element={<VisitaFeedbackPublico />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <MainLayout title={getPageTitle(location.pathname)}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          {/* Sedes routes */}
          <Route path="/sedes/nueva" element={<NuevaSede />} />
          <Route path="/sedes/:id/editar" element={<EditSede />} />
          <Route path="/sedes/:id/asignar-tecnico" element={<AsignarTecnicoPage />} />
          <Route path="/sedes/:id" element={<SedeDetallePage />} />
          <Route path="/sedes" element={<SedesPage />} />

          {/* Personal routes */}
          <Route path="/personal/crear" element={<NuevoPersonal />} />
          <Route path="/personal/:id/asignar-sedes" element={<AsignarSedesPage />} />
          <Route path="/personal/:id/editar" element={<EditPersonal />} />
          <Route path="/personal/:id" element={<PersonalDetailPage />} />
          <Route path="/personal" element={<PersonalPage />} />

          {/* Inventario routes */}
          <Route path="/inventario/crear" element={<CreateArticulo />} />
          <Route path="/inventario/:id/editar" element={<EditArticulo />} />
          <Route path="/inventario/:id" element={<InventarioDetailPage />} />
          <Route path="/inventario" element={<InventarioPage />} />

          {/* Remitos routes */}
          <Route path="/remitos/crear" element={<CreateRemitoPage />} />
          <Route path="/remitos/:id" element={<RemitoDetailPage />} />
          <Route path="/remitos" element={<RemitoListPage />} />

          {/* Visitas routes */}
          <Route path="/visitas" element={<VisitasPage />} />
          <Route path="/reportes/visitas" element={<ReportesVisitasPage />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </MainLayout>
  )
}

export default App
