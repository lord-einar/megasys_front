import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  FileText,
  Smartphone,
  PackageCheck,
  CalendarDays,
  LifeBuoy,
  Truck,
  ChevronDown,
  X,
} from 'lucide-react'
import logo from '../assets/logo.png'
import { usePermissions } from '../hooks/usePermissions'

function Sidebar({ isOpen, onNavigate, onClose }) {
  const {
    hasLegacyAccess,
    canViewSolicitudesCompra,
    canViewSolicitudesAsignacion,
    hasInfraestructura
  } = usePermissions()
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

  // Cada item puede declarar `visible: bool`. Si no, se asume true.
  const allMenuItems = [
    {
      label: 'Dashboard',
      href: hasLegacyAccess ? '/' : '/solicitudes-compra/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" strokeWidth={2} />,
    },
    {
      label: 'Sedes',
      visible: hasLegacyAccess,
      icon: <Building2 className="w-5 h-5" strokeWidth={2} />,
      submenu: [
        { label: 'Listar Sedes', href: '/sedes' },
        { label: 'Nueva Sede', href: '/sedes/nueva' },
      ],
    },
    {
      label: 'Personal',
      visible: hasLegacyAccess,
      icon: <Users className="w-5 h-5" strokeWidth={2} />,
      submenu: [
        { label: 'Listar Personal', href: '/personal' },
        { label: 'Nuevo Personal', href: '/personal/crear' },
        { label: 'Configuración de Roles', href: '/configuracion/roles' },
      ],
    },
    {
      label: 'Inventario',
      visible: hasLegacyAccess,
      icon: <Package className="w-5 h-5" strokeWidth={2} />,
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
      visible: hasLegacyAccess,
      icon: <FileText className="w-5 h-5" strokeWidth={2} />,
      submenu: [
        { label: 'Listar Remitos', href: '/remitos' },
        { label: 'Nuevo Remito', href: '/remitos/crear' },
      ],
    },
    {
      label: 'Celulares',
      visible: hasLegacyAccess,
      icon: <Smartphone className="w-5 h-5" strokeWidth={2} />,
      href: '/celulares',
    },
    {
      label: 'Asignación de equipos',
      visible: canViewSolicitudesAsignacion,
      icon: <PackageCheck className="w-5 h-5" strokeWidth={2} />,
      submenu: [
        { label: 'Dashboard', href: '/solicitudes-asignacion/dashboard' },
        { label: 'Stock de equipos', href: '/solicitudes-compra/stock' },
        { label: 'Listar solicitudes', href: '/solicitudes-asignacion' },
        { label: 'Nueva solicitud', href: '/solicitudes-asignacion/nueva' },
        ...(hasInfraestructura ? [{ label: 'Categorías', href: '/categoria-equipos-asignacion' }] : [])
      ],
    },
    {
      label: 'Visitas',
      visible: hasLegacyAccess,
      icon: <CalendarDays className="w-5 h-5" strokeWidth={2} />,
      submenu: [
        { label: 'Calendario', href: '/visitas' },
        { label: 'Reportes', href: '/reportes/visitas' },
        { label: 'Configuracion', href: '/configuracion/visitas' },
      ],
    },
    {
      label: 'Soporte CRM',
      visible: hasLegacyAccess,
      icon: <LifeBuoy className="w-5 h-5" strokeWidth={2} />,
      href: '/soporte',
    },
    {
      label: 'Proveedores',
      visible: hasLegacyAccess,
      icon: <Truck className="w-5 h-5" strokeWidth={2} />,
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

  const menuItems = allMenuItems.filter(item => item.visible !== false)

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
          fixed md:static inset-y-0 left-0 bg-surface-950 text-white transition-all duration-300 ease-out z-30 flex flex-col border-r border-surface-800 shadow-lg overflow-hidden
        `}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between border-b border-surface-800 bg-surface-950 relative overflow-hidden shrink-0">
          <div className={`transition-all duration-300 ${isOpen ? 'opacity-100 scale-100 px-6' : 'opacity-0 scale-90 px-0'}`}>
            <img
              src={logo}
              alt="Grupo Megatlon"
              className="h-7 w-auto brightness-0 invert"
            />
          </div>
          {/* Botón cerrar en móvil */}
          {isOpen && isMobile && (
            <button
              onClick={onClose}
              className="mr-4 p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          )}
          {!isOpen && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">M</div>
            </div>
          )}
        </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-1 custom-scrollbar scrollbar-thin scrollbar-thumb-surface-700 scrollbar-track-transparent">
        {menuItems.map((item) => {
          const active = isMenuActive(item);
          const isMenuExpanded = expandedMenu === item.label || active;

          return (
            <div key={item.label} className="px-3">
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    title={!isOpen ? item.label : undefined}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors duration-150 group relative ${expandedMenu === item.label || active
                        ? 'bg-surface-800/50 text-white shadow-inner'
                        : 'text-surface-400 hover:bg-surface-800 hover:text-white'
                      }`}
                    aria-expanded={expandedMenu === item.label}
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
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 text-surface-500 ${expandedMenu === item.label ? 'rotate-180 text-white' : ''}`}
                        strokeWidth={2}
                      />
                    )}
                  </button>

                  {/* Submenu */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedMenu === item.label && isOpen ? 'max-h-96 opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="pl-3 space-y-0.5 border-l border-surface-700 ml-4.5 my-1">
                      {item.submenu.map((subitem) => {
                        const isSubActive = location.pathname === subitem.href;
                        return (
                          <Link
                            key={subitem.href}
                            to={subitem.href}
                            className={`block pl-4 pr-3 py-2 text-sm rounded-r-lg transition-colors duration-150 truncate ${isSubActive
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
                  title={!isOpen ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 group relative ${active
                      ? 'bg-primary-600 text-white shadow-sm'
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
