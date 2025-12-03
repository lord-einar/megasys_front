import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import MainLayout from './components/layout/MainLayout'
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
import { useAuth } from './contexts/AuthContext'

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
  if (['/login', '/confirmar-recepcion', '/visitas/solicitar'].some(path => location.pathname.startsWith(path))) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/confirmar-recepcion" element={<ConfirmacionRecepcionPage />} />
        <Route path="/visitas/solicitar" element={<SolicitudPreVisitaPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <MainLayout title={getPageTitle(location.pathname)}>
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

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  )
}

export default App
