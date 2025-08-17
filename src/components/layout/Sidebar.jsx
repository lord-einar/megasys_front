// ============================================
// src/components/layout/Sidebar.jsx
// Sidebar de navegación
// ============================================
import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CubeIcon,
  DocumentIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { PERMISSIONS } from '../../services/config'

const Sidebar = () => {
  const location = useLocation()
  const { getSidebarConfig } = useApp()
  const { hasPermission, isSuperAdmin } = useAuth()
  const sidebarConfig = getSidebarConfig()
  
  // Configuración de navegación
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      permission: null
    },
    {
      name: 'Sedes',
      href: '/sedes',
      icon: BuildingOfficeIcon,
      permission: PERMISSIONS.GROUPS.MESA_AYUDA
    },
    {
      name: 'Personal',
      href: '/personal',
      icon: UsersIcon,
      permission: PERMISSIONS.GROUPS.MESA_AYUDA
    },
    {
      name: 'Inventario',
      href: '/inventario',
      icon: CubeIcon,
      permission: PERMISSIONS.GROUPS.MESA_AYUDA
    },
    {
      name: 'Remitos',
      href: '/remitos',
      icon: DocumentIcon,
      permission: PERMISSIONS.GROUPS.MESA_AYUDA
    },
    {
      name: 'Préstamos',
      href: '/prestamos',
      icon: ClockIcon,
      permission: PERMISSIONS.GROUPS.MESA_AYUDA
    },
    {
      name: 'Reportes',
      href: '/reportes',
      icon: ChartBarIcon,
      permission: PERMISSIONS.GROUPS.SOPORTE
    }
  ]
  
  // Filtrar navegación según permisos
  const filteredNavigation = navigation.filter(item => {
    if (!item.permission) return true
    return isSuperAdmin() || hasPermission(item.permission)
  })
  
  // Verificar si un item está activo
  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(href)
  }
  
  if (!sidebarConfig.shouldShow) {
    return null
  }
  
  return (
    <>
      <div
        className={`
          ${sidebarConfig.isOverlay ? 'fixed inset-y-0 left-0 z-30' : 'relative'}
          flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm
          ${sidebarConfig.isOverlay ? 'lg:relative lg:z-auto' : ''}
        `}
      >
        {/* Logo/Brand */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Megasys</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {filteredNavigation.map((item) => {
            const active = isActive(item.href)
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${active
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon
                  className={`
                    flex-shrink-0 mr-3 h-5 w-5 transition-colors
                    ${active ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-700'}
                  `}
                />
                {item.name}
              </NavLink>
            )
          })}
        </nav>
        
        {/* Footer del sidebar */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <NavLink
            to="/configuracion"
            className={`
              group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${isActive('/configuracion')
                ? 'bg-gray-50 text-gray-900'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            <Cog6ToothIcon className="flex-shrink-0 mr-3 h-5 w-5 text-gray-500 group-hover:text-gray-700" />
            Configuración
          </NavLink>
        </div>
      </div>
    </>
  )
}

export default Sidebar