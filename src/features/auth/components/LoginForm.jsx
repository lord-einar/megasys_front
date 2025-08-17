// src/features/auth/components/LoginForm.jsx
import React, { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useNotification } from '../../../context/NotificationContext'

export default function LoginForm() {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { clearError, error } = useAuth()
  const { showError } = useNotification()

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true)
      clearError()
      // Si el backend responde 302, el navegador seguirá la redirección
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/login`
    } catch (err) {
      console.error(err)
      showError(err.message || 'Error al iniciar sesión')
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Ingresá a Megasys</h1>
          <p className="text-gray-600">Con tu cuenta de Microsoft</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="btn btn-primary btn-lg w-full"
        >
          {isLoggingIn ? 'Redirigiendo…' : 'Iniciar sesión con Microsoft'}
        </button>

        <p className="text-xs text-gray-500 mt-6 text-center">
          Al continuar aceptás nuestros términos y condiciones.
        </p>
      </div>
    </div>
  )
}
