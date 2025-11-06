import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/logo.png'

function Header({ onMenuClick, sidebarOpen }) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleProfileClick = () => {
    setShowUserMenu(false)
    navigate('/profile')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    const name = user.fullName || user.name || user.email || 'Usuario'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  const getUserDisplayName = () => {
    if (!user) return 'Usuario'
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.fullName || user.name || user.email || 'Usuario'
  }

  const getUserRole = () => {
    if (!user) return 'Sin rol'
    const roleNames = {
      'super_admin': 'Super Administrador',
      'helpdesk': 'Mesa de Ayuda',
      'support': 'Soporte',
      'user': 'Usuario'
    }
    return roleNames[user.role] || user.role || 'Usuario'
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-card">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center h-8">
            <img src={logo} alt="Grupo Megatlon" className="h-8 object-contain" />
          </div>

          <button
            onClick={onMenuClick}
            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none transition-colors border border-gray-200"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Dashboard</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-700 font-medium">Resumen</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 text-sm w-64 transition-colors"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getUserInitials()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                <p className="text-xs text-gray-500">{getUserRole()}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-card-hover border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-sm text-gray-500">{user?.email || 'usuario@empresa.com'}</p>
                  <p className="text-xs text-gray-400 mt-1">Rol: {getUserRole()}</p>
                </div>
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mi Perfil
                </button>
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configuración
                </a>
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header