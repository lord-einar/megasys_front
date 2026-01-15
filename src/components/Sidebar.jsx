import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'

function Sidebar({ isOpen, onNavigate }) {
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

  const menuItems = [
    {
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: '/',
      active: true
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
        { label: 'Stock Disponible', href: '/inventario?estado=disponible' },
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
      label: 'Proveedores',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      submenu: [
        { label: 'Listar Proveedores', href: '/proveedores' },
        { label: 'Nuevo Proveedor', href: '/proveedores/crear' },
      ],
    },
  ]

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-0'
      } bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col border-r border-gray-800`}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 h-16 px-6 border-b border-gray-800">
        <img src={logo} alt="Grupo Megatlon" className="h-10 object-contain" />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.submenu ? (
              <>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                    expandedMenu === item.label ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-gray-400">{item.icon}</span>
                  <span className="flex-1 font-medium">{item.label}</span>
                  <svg
                    className={`w-4 h-4 transition-transform text-gray-400 ${
                      expandedMenu === item.label ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                {/* Submenu */}
                {expandedMenu === item.label && (
                  <div className="bg-gray-800/50 py-2">
                    {item.submenu.map((subitem, subindex) => (
                      <Link
                        key={subindex}
                        to={subitem.href}
                        className={`block px-12 py-2 text-sm transition-colors ${
                          location.pathname === subitem.href
                            ? 'text-primary-500 bg-gray-700/50'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                        }`}
                      >
                        {subitem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.href}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  location.pathname === item.href
                    ? 'bg-primary-500/10 text-primary-500 border-r-2 border-primary-500'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className={location.pathname === item.href ? 'text-primary-500' : 'text-gray-400'}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

    </aside>
  )
}

export default Sidebar