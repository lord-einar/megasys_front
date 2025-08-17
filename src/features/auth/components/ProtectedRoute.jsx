// ============================================
// src/features/auth/components/ProtectedRoute.jsx
// Componente para proteger rutas que requieren autenticación
// ============================================
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'

const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth()
  const location = useLocation()
  
  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  // Si se requiere un permiso específico y no lo tiene
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Acceso denegado
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            No tiene permisos para acceder a esta sección.
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  // Si está autenticado y tiene permisos, mostrar el contenido
  return children
}

export default ProtectedRoute