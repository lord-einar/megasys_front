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
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-100 z-10 sticky top-0">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-navy-900 focus:outline-none transition-all duration-200 border border-transparent hover:border-gray-200"
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

          {/* Dynamic Title / Breadcrumb Placeholder */}
          <div className="hidden md:flex flex-col">
            <h1 className="text-lg font-bold text-navy-900 leading-none">Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Resumen general del sistema</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search Bar (Refined) */}
          <div className="relative hidden lg:block group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-600">
              <svg className="w-4 h-4 text-gray-400 group-focus-within:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-gray-50/50 text-sm w-64 transition-all duration-200 hover:bg-white hover:shadow-sm"
            />
          </div>

          <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

          {/* Notifications */}
          <button className="relative p-2.5 rounded-full text-gray-500 hover:bg-gray-50 hover:text-navy-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-error-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                {getUserInitials()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-navy-900 leading-tight">{getUserDisplayName()}</p>
                <p className="text-xs text-slate-500 font-medium">{getUserRole()}</p>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 transform origin-top-right transition-all">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-sm font-bold text-navy-900">{getUserDisplayName()}</p>
                  <p className="text-xs text-slate-500">{user?.email || 'usuario@empresa.com'}</p>
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700">
                    {getUserRole()}
                  </div>
                </div>

                <div className="py-2">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center gap-3 w-full text-left px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary-700 transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mi Perfil
                  </button>
                  <a href="#" className="flex items-center gap-3 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary-700 transition-colors">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Configuración
                  </a>
                </div>

                <div className="border-t border-gray-100 mt-1 pt-2 pb-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-6 py-2.5 text-sm font-medium text-error-500 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                  </button>
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