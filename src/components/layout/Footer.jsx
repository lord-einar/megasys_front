// ============================================
// src/components/layout/Footer.jsx
// Footer simple de la aplicación
// ============================================
import React from 'react'
import { APP_CONFIG } from '../../services/config'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>
          © {new Date().getFullYear()} {APP_CONFIG.NAME} v{APP_CONFIG.VERSION}
        </div>
        <div className="flex items-center space-x-4">
          <span>Sistema de Gestión Empresarial</span>
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-xs">En línea</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer