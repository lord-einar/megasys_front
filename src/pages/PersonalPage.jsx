// ============================================
// src/pages/PersonalPage.jsx
// Página de gestión de personal
// ============================================
import React from 'react'
import { UsersIcon } from '@heroicons/react/24/outline'

const PersonalPage = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="text-center py-12">
        <UsersIcon className="mx-auto h-16 w-16 text-gray-400" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Gestión de Personal</h1>
        <p className="mt-2 text-gray-600">Esta sección está en desarrollo</p>
        <div className="mt-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            Próximamente
          </span>
        </div>
      </div>
    </div>
  )
}

export default PersonalPage