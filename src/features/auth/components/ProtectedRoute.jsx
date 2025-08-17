// ============================================
// src/features/auth/components/LoginForm.jsx
// Formulario de login con Azure AD
// ============================================
import React, { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useNotification } from '../../../context/NotificationContext'

const LoginForm = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { login, error, clearError } = useAuth()
  const { showError } = useNotification()
  
  const handleLogin = async () => {
    try {
      setIsLoggingIn(true)
      clearError()
      
      // Redirigir directamente al backend para iniciar el flujo OAuth
      // No usar fetch, sino window.location para que el navegador haga la redirección
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/login`
      
    } catch (error) {
      console.error('Error en login:', error)
      showError(error.message || 'Error al iniciar sesión')
      setIsLoggingIn(false)
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Mensaje de bienvenida */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">
          Bienvenido
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Inicie sesión con su cuenta de Microsoft para acceder al sistema
        </p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al iniciar sesión
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Login button */}
      <div className="space-y-4">
        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoggingIn ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Iniciando sesión...
            </>
          ) : (
            <>
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.64 12.204c0-.832-.074-1.634-.214-2.404H12.193v4.548h6.457c-.278 1.504-1.125 2.776-2.394 3.632v3.015h3.88c2.267-2.088 3.574-5.164 3.574-8.791z"/>
                  <path d="M12.193 24c3.24 0 5.955-1.074 7.94-2.907l-3.88-3.015c-1.074.72-2.448 1.146-4.06 1.146-3.125 0-5.77-2.112-6.715-4.95H1.466v3.107C3.444 21.3 7.5 24 12.193 24z"/>
                  <path d="M5.478 14.274c-.24-.72-.375-1.49-.375-2.274s.135-1.554.375-2.274V6.62H1.466C.532 8.485 0 10.194 0 12s.532 3.515 1.466 5.38l4.012-3.106z"/>
                  <path d="M12.193 4.773c1.76 0 3.34.605 4.582 1.794l3.435-3.435C18.14 1.19 15.424 0 12.193 0 7.5 0 3.444 2.7 1.466 6.62l4.012 3.106c.945-2.838 3.59-4.953 6.715-4.953z"/>
                </svg>
              </span>
              Iniciar sesión con Microsoft
            </>
          )}
        </button>
        
        {/* Información adicional */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Al iniciar sesión, acepta nuestros términos de servicio y política de privacidad
          </p>
        </div>
      </div>
      
      {/* Información del sistema */}
      <div className="border-t border-gray-200 pt-6">
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Funcionalidades del sistema
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Gestión de Sedes</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Control de Inventario</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Gestión de Personal</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Remitos y Traslados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm