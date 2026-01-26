import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Profile from './pages/Profile'
import SedesPage from './pages/SedesPage'
import SedeDetallePage from './pages/SedeDetallePage'
import NuevaSede from './pages/NuevaSede'
import EditSede from './pages/EditSede'
import AsignarTecnicoPage from './pages/AsignarTecnicoPage'
import AsignarSedesPage from './pages/AsignarSedesPage'
import PersonalPage from './pages/PersonalPage'
import PersonalDetailPage from './pages/PersonalDetailPage'
import NuevoPersonal from './pages/NuevoPersonal'
import EditPersonal from './pages/EditPersonal'
import InventarioPage from './pages/InventarioPage'
import CreateArticulo from './pages/CreateArticulo'
import EditArticulo from './pages/EditArticulo'
import InventarioDetailPage from './pages/InventarioDetailPage'
import RemitoListPage from './pages/RemitoListPage'
import CreateRemitoPage from './pages/CreateRemitoPage'
import RemitoDetailPage from './pages/RemitoDetailPage'
import ConfirmacionRecepcionPage from './pages/ConfirmacionRecepcionPage'
import VisitasPage from './pages/VisitasPage'
import SolicitudPreVisitaPage from './pages/SolicitudPreVisitaPage'
import VisitaFeedbackPublico from './pages/VisitaFeedbackPublico'
import ReportesVisitasPage from './pages/ReportesVisitasPage'
import ConfiguracionVisitasPage from './pages/ConfiguracionVisitasPage'
import ConfiguracionRolesPage from './pages/ConfiguracionRolesPage'
import { useAuth } from './contexts/AuthContext'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Public routes that don't require authentication
  // Check first before authentication check
  const publicPaths = ['/login', '/confirmar-recepcion', '/visitas/solicitar']
  const isFeedbackPath = window.location.pathname.startsWith('/visitas/feedback/')
  if (publicPaths.includes(window.location.pathname) || isFeedbackPath) {
    return <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/confirmar-recepcion" element={<ConfirmacionRecepcionPage />} />
      <Route path="/visitas/solicitar" element={<SolicitudPreVisitaPage />} />
      <Route path="/visitas/feedback/:token" element={<VisitaFeedbackPublico />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  }

  if (!isAuthenticated) {
    return <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/confirmar-recepcion" element={<ConfirmacionRecepcionPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  }

  return (
    <Routes>
      <Route
        path="/*"
        element={
          <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <Header
                onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                sidebarOpen={sidebarOpen}
              />

              {/* Content Area */}
              <main className="flex-1 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />

                  {/* Sedes routes - más específicas primero */}
                  <Route path="/sedes/nueva" element={<NuevaSede />} />
                  <Route path="/sedes/:id/editar" element={<EditSede />} />
                  <Route path="/sedes/:id/asignar-tecnico" element={<AsignarTecnicoPage />} />
                  <Route path="/sedes/:id" element={<SedeDetallePage />} />
                  <Route path="/sedes" element={<SedesPage />} />

                  {/* Personal routes - más específicas primero */}
                  <Route path="/personal/crear" element={<NuevoPersonal />} />
                  <Route path="/personal/:id/asignar-sedes" element={<AsignarSedesPage />} />
                  <Route path="/personal/:id/editar" element={<EditPersonal />} />
                  <Route path="/personal/:id" element={<PersonalDetailPage />} />
                  <Route path="/personal" element={<PersonalPage />} />
                  <Route path="/configuracion/roles" element={<ConfiguracionRolesPage />} />

                  {/* Inventario routes - más específicas primero */}
                  <Route path="/inventario/crear" element={<CreateArticulo />} />
                  <Route path="/inventario/:id/editar" element={<EditArticulo />} />
                  <Route path="/inventario/:id" element={<InventarioDetailPage />} />
                  <Route path="/inventario" element={<InventarioPage />} />

                  {/* Remitos routes - más específicas primero */}
                  <Route path="/remitos/crear" element={<CreateRemitoPage />} />
                  <Route path="/remitos/:id" element={<RemitoDetailPage />} />
                  <Route path="/remitos" element={<RemitoListPage />} />

                  {/* Visitas routes */}
                  <Route path="/visitas" element={<VisitasPage />} />
                  <Route path="/reportes/visitas" element={<ReportesVisitasPage />} />
                  <Route path="/configuracion/visitas" element={<ConfiguracionVisitasPage />} />

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App
