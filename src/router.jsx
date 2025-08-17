// ============================================
// src/router.jsx
// Configuración de rutas de la aplicación
// ============================================
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layout
import Layout from './components/layout/Layout'

// Auth components
import ProtectedRoute from './features/auth/components/ProtectedRoute'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SedesPage from './pages/SedesPage'
import PersonalPage from './pages/PersonalPage'
import InventarioPage from './pages/InventarioPage'
import RemitosPage from './pages/RemitosPage'
import PrestamosPage from './pages/PrestamosPage'
import NotFoundPage from './pages/NotFoundPage'

// Permisos
import { PERMISSIONS } from './services/config'

const AppRouter = () => {
  const { isAuthenticated } = useAuth()
  
  return (
    <Routes>
      {/* Ruta de login */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Rutas protegidas */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                {/* Dashboard - Ruta principal */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                
                {/* Gestión de Sedes */}
                <Route 
                  path="/sedes" 
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.GROUPS.MESA_AYUDA}>
                      <SedesPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Gestión de Personal */}
                <Route 
                  path="/personal" 
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.GROUPS.MESA_AYUDA}>
                      <PersonalPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Gestión de Inventario */}
                <Route 
                  path="/inventario" 
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.GROUPS.MESA_AYUDA}>
                      <InventarioPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Gestión de Remitos */}
                <Route 
                  path="/remitos" 
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.GROUPS.MESA_AYUDA}>
                      <RemitosPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Gestión de Préstamos */}
                <Route 
                  path="/prestamos" 
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.GROUPS.MESA_AYUDA}>
                      <PrestamosPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Reportes */}
                <Route 
                  path="/reportes" 
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.GROUPS.SOPORTE}>
                      <div className="p-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
                        <p className="text-gray-600 mt-2">Esta sección está en desarrollo</p>
                      </div>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Configuración */}
                <Route 
                  path="/configuracion" 
                  element={
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                      <p className="text-gray-600 mt-2">Esta sección está en desarrollo</p>
                    </div>
                  } 
                />
                
                {/* 404 - Página no encontrada */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default AppRouter