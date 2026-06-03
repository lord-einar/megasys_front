import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function Header({ onMenuClick, sidebarOpen }) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const getRouteContext = () => {
    const path = location.pathname
    const contexts = [
      { test: path.startsWith('/solicitudes-compra'), title: 'Solicitudes de compra', subtitle: 'Compras, RRHH e Infraestructura' },
      { test: path.startsWith('/catalogo-equipos'), title: 'Catálogo de equipos', subtitle: 'Modelos autorizados' },
      { test: path.startsWith('/sedes'), title: 'Sedes', subtitle: 'Operación y soporte' },
      { test: path.startsWith('/personal'), title: 'Personal', subtitle: 'Usuarios y asignaciones' },
      { test: path.startsWith('/configuracion/roles'), title: 'Roles', subtitle: 'Permisos del sistema' },
      { test: path.startsWith('/inventario'), title: 'Inventario', subtitle: 'Activos tecnológicos' },
      { test: path.startsWith('/remitos'), title: 'Remitos', subtitle: 'Movimientos y entregas' },
      { test: path.startsWith('/celulares'), title: 'Celulares', subtitle: 'Asignaciones móviles' },
      { test: path.startsWith('/soporte'), title: 'Soporte CRM', subtitle: 'Casos y seguimiento' },
      { test: path.startsWith('/visitas') || path.startsWith('/reportes/visitas') || path.startsWith('/configuracion/visitas'), title: 'Visitas', subtitle: 'Agenda, informes y reportes' },
      { test: path.startsWith('/proveedores'), title: 'Proveedores', subtitle: 'Servicios, equipos y reclamos' },
      { test: path.startsWith('/profile'), title: 'Mi perfil', subtitle: 'Cuenta y preferencias' },
    ]

    return contexts.find(item => item.test) || { title: 'Dashboard', subtitle: 'Vista general' }
  }

  const routeContext = getRouteContext()

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
    <header className="bg-white/95 backdrop-blur border-b border-surface-200 z-10 sticky top-0 transition-colors duration-200">
      <div className="flex items-center justify-between min-h-16 px-4 sm:px-6 lg:px-8 py-3 gap-4">
        {/* Left Section - Toggle & Title */}
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <button
            onClick={onMenuClick}
            className="icon-button shrink-0"
            aria-label={sidebarOpen ? 'Cerrar navegación' : 'Abrir navegación'}
            aria-expanded={sidebarOpen}
          >
            <Menu className="w-5 h-5" strokeWidth={2} />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-surface-900 leading-tight tracking-tight truncate">{routeContext.title}</h1>
            <p className="hidden sm:block text-xs text-surface-500 font-medium truncate">{routeContext.subtitle}</p>
          </div>
        </div>

        {/* Right Section - Search & User */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Bar - Hidden on small screens */}
          <div className="relative hidden lg:block group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-600">
              <Search className="w-4 h-4 text-surface-400 group-hover:text-surface-500 transition-colors" strokeWidth={2} />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 bg-surface-50/50 border border-surface-200 rounded-lg text-sm w-64 transition-colors duration-150 placeholder:text-surface-400 text-surface-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none hover:bg-surface-50 hover:border-surface-300"
            />
          </div>

          <div className="h-8 w-px bg-surface-200 hidden md:block"></div>

          {/* Notifications */}
          <button
            className="icon-button relative group"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5 transition-transform group-hover:scale-110 duration-200" strokeWidth={2} />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 sm:gap-3 pl-1 pr-2 sm:pr-3 py-1 rounded-lg hover:bg-surface-50 transition-colors duration-150 border border-transparent hover:border-surface-200 group"
              aria-label="Menú de usuario"
              aria-expanded={showUserMenu}
            >
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-primary-700/20 transition-colors">
                {getUserInitials()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-surface-900 leading-tight group-hover:text-primary-700 transition-colors">{getUserDisplayName()}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-surface-500 mt-0.5">{getUserRole()}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-surface-400 transition-transform duration-200 group-hover:text-surface-600 ${showUserMenu ? 'rotate-180' : ''}`}
                strokeWidth={2}
              />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute right-0 mt-3 w-[min(18rem,calc(100vw-2rem))] bg-white rounded-xl shadow-lg border border-surface-200 py-2 z-50 transform origin-top-right animate-fade-in overflow-hidden">
                  <div className="px-6 py-4 border-b border-surface-50 bg-surface-50/50">
                    <p className="text-sm font-bold text-surface-900 truncate">{getUserDisplayName()}</p>
                    <p className="text-xs text-surface-500 truncate">{user?.email || 'usuario@megatlon.com.ar'}</p>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center gap-3 w-full text-left px-6 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50 hover:text-primary-700 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-50 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                        <User className="w-4 h-4 text-surface-400 group-hover:text-primary-600" strokeWidth={2} />
                      </div>
                      <span>Mi Perfil</span>
                    </button>
                    <a href="#" className="flex items-center gap-3 px-6 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50 hover:text-primary-700 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-surface-50 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                        <Settings className="w-4 h-4 text-surface-400 group-hover:text-primary-600" strokeWidth={2} />
                      </div>
                      <span>Configuración</span>
                    </a>
                  </div>

                  <div className="border-t border-surface-100 mt-1 pt-2 pb-2 px-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                        <LogOut className="w-4 h-4 text-rose-500 group-hover:text-rose-600" strokeWidth={2} />
                      </div>
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
