// ============================================
// src/pages/NotFoundPage.jsx
// Página 404 - No encontrada
// ============================================
import React from 'react'
import { Link } from 'react-router-dom'
import { HomeIcon } from '@heroicons/react/24/outline'

const NotFoundPage = () => {
  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Página no encontrada
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Lo sentimos, no pudimos encontrar la página que buscas.
          </p>
        </div>
        
        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <HomeIcon className="mr-2 h-4 w-4" />
            Ir al Dashboard
          </Link>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Volver atrás
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage