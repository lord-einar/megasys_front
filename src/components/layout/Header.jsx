// ============================================
// src/components/layout/Header.jsx
// Header con información del usuario
// ============================================
import React, { useState, useRef, useEffect } from 'react'
import { 
  Bars3Icon, 
  BellIcon, 
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { useNotification } from '../../context/NotificationContext'

const Header = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [empresaMenuOpen, setEmpresaMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const empresaMenuRef = useRef(null)
  
  const { user, empresas, getCurrentEmpresa, changeEmpresa, logout } = useAuth()
  const { toggleSidebar, isMobile } = useApp()
  const { showConfirm } = useNotification()
  
  const empresaActual = getCurrentEmpresa()
  
  // Cerrar menús cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
      if (empresaMenuRef.current && !empresaMenuRef.current.contains(event.target)) {
        setEmpresaMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleLogout = () => {
    showConfirm(
      '¿Está seguro que desea cerrar sesión?',
      logout,
      {
        title: 'Cerrar Sesión',
        confirmText: 'Cerrar Sesión',
        variant: 'danger'
      }
    )
  }
  
  const handleEmpresaChange = (empresaId) => {
    changeEmpresa(empresaId)
    setEmpresaMenuOpen(false)
  }
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Sidebar toggle */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          
          {/* Logo/Title - solo en mobile */}
          {isMobile() && (
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">Megasys</h1>
            </div>
          )}
        </div>
        
        {/* Center section - Empresa selector */}
        {empresas.length > 1 && (
          <div className="hidden sm:flex items-center">
            <div className="relative" ref={empresaMenuRef}>
              <button
                onClick={() => setEmpresaMenuOpen(!empresaMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <span className="truncate max-w-xs">
                  {empresaActual?.nombre || 'Seleccionar empresa'}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </button>
              
              {/* Dropdown de empresas */}
              {empresaMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    {empresas.map((empresa) => (
                      <button
                        key={empresa.id}
                        onClick={() => handleEmpresaChange(empresa.id)}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                          empresa.id === empresaActual?.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{empresa.nombre}</div>
                          {empresa.razon_social && (
                            <div className="text-xs text-gray-500">{empresa.razon_social}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Right section */}
        <div className="flex items-center space-x-4">
          
          {/* Notifications */}
          <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors relative">
            <BellIcon className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {/* User avatar */}
              <div className="flex-shrink-0">
                {user?.foto_url ? (
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={user.foto_url}
                    alt={`${user.nombre} ${user.apellido}`}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserCircleIcon className="h-5 w-5 text-gray-600" />
                  </div>
                )}
              </div>
              
              {/* User info - hidden on mobile */}
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user?.nombre} {user?.apellido}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email}
                </div>
              </div>
              
              <ChevronDownIcon className="hidden md:block h-4 w-4 text-gray-500" />
            </button>
            
            {/* User dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {user?.foto_url ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.foto_url}
                            alt={`${user.nombre} ${user.apellido}`}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserCircleIcon className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user?.nombre} {user?.apellido}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {user?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        // TODO: Abrir modal de configuraciones
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-3 text-gray-500" />
                      Configuración
                    </button>
                    
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        handleLogout()
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-gray-500" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header