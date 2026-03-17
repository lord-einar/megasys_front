import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'

function Sidebar({ isOpen, onNavigate, onClose }) {
  const [expandedMenu, setExpandedMenu] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const location = useLocation()

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile && isOpen) {
      onNavigate() // This will close the sidebar
    }
  }, [location.pathname])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu)
  }

  // Helper to check if a menu or any of its submenus is active
  const isMenuActive = (item) => {
    if (location.pathname === item.href) return true
    if (item.submenu) {
      return item.submenu.some(sub => location.pathname.startsWith(sub.href))
    }
    return false
  }

  const menuItems = [
    {
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: '/',
    },
    {
      label: 'Sedes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      submenu: [
        { label: 'Listar Sedes', href: '/sedes' },
        { label: 'Nueva Sede', href: '/sedes/nueva' },
      ],
    },
    {
      label: 'Personal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      submenu: [
        { label: 'Listar Personal', href: '/personal' },
        { label: 'Nuevo Personal', href: '/personal/crear' },
        { label: 'Configuración de Roles', href: '/configuracion/roles' },
      ],
    },
    {
      label: 'Inventario',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      submenu: [
        { label: 'Listar Inventario', href: '/inventario' },
        { label: 'Nuevo Artículo', href: '/inventario/crear' },
        { label: 'Tipos de Artículo', href: '/inventario/tipos-articulo' },
        { label: 'Stock Disponible', href: '/inventario?estado=disponible' },
        { label: 'Reportes', href: '/inventario?tab=reportes' },
      ],
    },
    {
      label: 'Remitos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      submenu: [
        { label: 'Listar Remitos', href: '/remitos' },
        { label: 'Nuevo Remito', href: '/remitos/crear' },
      ],
    },
    {
      label: 'Visitas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      submenu: [
        { label: 'Calendario', href: '/visitas' },
        { label: 'Reportes', href: '/reportes/visitas' },
        { label: 'Configuracion', href: '/configuracion/visitas' },
      ],
    },
    {
      label: 'Proveedores',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      submenu: [
        { label: 'Listar Proveedores', href: '/proveedores' },
        { label: 'Servicios', href: '/proveedores/servicios' },
        { label: 'Equipos', href: '/proveedores/equipos' },
        { label: 'Ejecutivos', href: '/proveedores/ejecutivos' },
        { label: 'Tipos de Servicio', href: '/proveedores/tipos-servicio' },
        { label: 'Reclamos', href: '/proveedores/reclamos' },
      ],
    },
  ]

  return (
    <>
      {/* Backdrop overlay para móvil */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 md:translate-x-0 md:w-20 lg:w-64'}
          fixed md:static inset-y-0 left-0 bg-surface-950 text-white transition-all duration-300 ease-out z-30 flex flex-col border-r border-surface-800 shadow-2xl overflow-hidden
        `}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between border-b border-surface-800 bg-surface-950 relative overflow-hidden shrink-0">
          <div className={`transition-all duration-300 ${isOpen ? 'opacity-100 scale-100 px-6' : 'opacity-0 scale-90 px-0'}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-lg">M</div>
              <span className="font-bold text-lg tracking-tight">Portal IT</span>
            </div>
          </div>
          {/* Botón cerrar en móvil */}
          {isOpen && isMobile && (
            <button
              onClick={onClose}
              className="mr-4 p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
              aria-label="Cerrar menú"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {!isOpen && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-lg">M</div>
            </div>
          )}
        </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-1 custom-scrollbar scrollbar-thin scrollbar-thumb-surface-700 scrollbar-track-transparent">
        {menuItems.map((item, index) => {
          const active = isMenuActive(item);
          const isMenuExpanded = expandedMenu === item.label || active;

          return (
            <div key={index} className="px-3">
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${expandedMenu === item.label || active
                        ? 'bg-surface-800/50 text-white shadow-inner'
                        : 'text-surface-400 hover:bg-surface-800 hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex-shrink-0 transition-colors duration-200 ${active ? 'text-primary-400' : 'text-surface-500 group-hover:text-white'}`}>
                        {item.icon}
                      </span>
                      <span className={`font-medium text-sm truncate transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                        {item.label}
                      </span>
                    </div>
                    {isOpen && (
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 text-surface-500 ${expandedMenu === item.label ? 'rotate-180 text-white' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* Submenu */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedMenu === item.label && isOpen ? 'max-h-96 opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="pl-3 space-y-0.5 border-l border-surface-700 ml-4.5 my-1">
                      {item.submenu.map((subitem, subindex) => {
                        const isSubActive = location.pathname === subitem.href;
                        return (
                          <Link
                            key={subindex}
                            to={subitem.href}
                            className={`block pl-4 pr-3 py-2 text-sm rounded-r-lg transition-all duration-200 block truncate ${isSubActive
                                ? 'text-white font-medium bg-primary-500/10 border-l-2 border-primary-500 -ml-[1px]'
                                : 'text-surface-400 hover:text-white hover:bg-surface-800/50'
                              }`}
                          >
                            {subitem.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${active
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20'
                      : 'text-surface-400 hover:bg-surface-800 hover:text-white'
                    }`}
                >
                  <span className={`flex-shrink-0 ${!active && 'text-surface-500 group-hover:text-white'}`}>
                    {item.icon}
                  </span>
                  <span className={`font-medium text-sm truncate transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    {item.label}
                  </span>
                </Link>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer / User Profile Snippet */}
      <div className="p-4 border-t border-surface-800 bg-surface-950 shrink-0">
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center text-xs font-bold text-surface-400 ring-2 ring-surface-700">
              v2
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Portal IT Megatlon</p>
              <p className="text-xs text-surface-500 truncate">Infraestructura</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="text-[10px] font-bold text-surface-600">v2.0</span>
          </div>
        )}

      </div>
      </aside>
    </>
  )
}

export default Sidebar