// ============================================
// src/pages/InventarioPage.jsx
// Página de gestión de inventario
// ============================================
import React from 'react'
import { CubeIcon } from '@heroicons/react/24/outline'

const InventarioPage = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="text-center py-12">
        <CubeIcon className="mx-auto h-16 w-16 text-gray-400" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
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

export default InventarioPage