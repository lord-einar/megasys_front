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

function Sidebar({ isOpen, onNavigate, onClose, onExpand }) {
  const {
    hasLegacyAccess,
    canViewSolicitudesAsignacion,
    hasInfraestructura
  } = usePermissions()
  const [expandedMenu, setExpandedMenu] = useState(null)
  // Debajo de 1024px la barra expandida se superpone al contenido (no lo empuja)
  const [isOverlay, setIsOverlay] = useState(window.innerWidth < 1024)
  const location = useLocation()

  // En modo superpuesto, navegar cierra la barra
  useEffect(() => {
    if (isOverlay && isOpen) {
      onNavigate() // This will close the sidebar
    }
  }, [location.pathname])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsOverlay(window.innerWidth < 1024)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Escape cierra la barra superpuesta
  useEffect(() => {
    if (!(isOpen && isOverlay)) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, isOverlay, onClose])

  const toggleMenu = (menu) => {
    // Colapsado (tablet / escritorio): abrir un grupo expande la barra para mostrar sus opciones
    if (!isOpen) {
      onExpand?.()
      setExpandedMenu(menu)
      return
    }
    setExpandedMenu(expandedMenu === menu ? null : menu)
  }

  const pathOf = (href) => href.split('?')[0]

  // Submenú activo = el href más largo que coincide con la ruta actual, así
  // "/solicitudes-asignacion/123" marca "Solicitudes" y no queda nada sin marcar.
  const activeSubHref = (item) => {
    const matches = item.submenu
      .filter(sub => !sub.href.includes('?'))
      .filter(sub => location.pathname === sub.href || location.pathname.startsWith(sub.href + '/'))
      .sort((a, b) => b.href.length - a.href.length)
    return matches[0]?.href
  }

  const isMenuActive = (item) => {
    if (item.href && location.pathname === pathOf(item.href)) return true
    if (item.submenu) return !!activeSubHref(item)
    return false
  }

  // Cada item puede declarar `visible: bool`. Si no, se asume true.
  const allMenuItems = [
    {
      label: 'Dashboard',
      href: hasLegacyAccess ? '/dashboard' : '/solicitudes-asignacion/dashboard',
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

  // El grupo de la pantalla actual arranca abierto
  const grupoActivo = menuItems.find(item => item.submenu && activeSubHref(item))?.label
  useEffect(() => {
    if (grupoActivo) setExpandedMenu(grupoActivo)
  }, [grupoActivo])

  return (
    <>
      {/* Backdrop overlay para móvil */}
      {isOpen && isOverlay && (
        <div
          className="fixed inset-0 bg-surface-950/60 z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full max-md:invisible w-64 md:translate-x-0 md:w-20'}
          fixed lg:static inset-y-0 left-0 bg-nav-bg text-white transition-[width,translate] duration-200 ease-out z-30 flex flex-col overflow-hidden
        `}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between border-b border-nav-line relative overflow-hidden shrink-0">
          <div className={`transition-opacity duration-150 ${isOpen ? 'opacity-100 px-6' : 'opacity-0 px-0'}`}>
            <img
              src={logo}
              alt="Grupo Megatlon"
              className="h-7 w-auto invert mix-blend-screen"
            />
          </div>
          {/* Botón cerrar en móvil */}
          {isOpen && isOverlay && (
            <button
              onClick={onClose}
              className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-md text-nav-text hover:text-white hover:bg-nav-raised transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          )}
          {!isOpen && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-9 h-9 rounded-md bg-primary-600 flex items-center justify-center text-white font-bold text-lg" aria-hidden="true">M</div>
            </div>
          )}
        </div>

      {/* Navigation Menu */}
      <nav aria-label="Principal" className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1">
        {menuItems.map((item) => {
          const active = isMenuActive(item);
          const subActive = item.submenu ? activeSubHref(item) : null;

          return (
            <div key={item.label} className="px-3">
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    title={!isOpen ? item.label : undefined}
                    className={`w-full min-h-11 flex items-center justify-between px-3 py-2 rounded-md transition-colors duration-150 group relative ${active
                        ? 'text-white'
                        : 'text-nav-text hover:bg-nav-raised hover:text-white'
                      }`}
                    aria-expanded={isOpen && expandedMenu === item.label}
                  >
                    {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-nav-mark" aria-hidden="true" />}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex-shrink-0 transition-colors duration-150 ${active ? 'text-nav-mark' : 'text-nav-text group-hover:text-white'}`}>
                        {item.icon}
                      </span>
                      <span className={`font-semibold text-[0.9375rem] truncate transition-opacity duration-150 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                        {item.label}
                      </span>
                    </div>
                    {isOpen && (
                      <ChevronDown
                        aria-hidden="true"
                        className={`w-4 h-4 transition-transform duration-200 text-nav-text ${expandedMenu === item.label ? 'rotate-180 text-white' : ''}`}
                        strokeWidth={2}
                      />
                    )}
                  </button>

                  {/* Submenu */}
                  {/* Cerrado = no renderizado: los enlaces ocultos no reciben foco con Tab */}
                  {expandedMenu === item.label && isOpen && (
                    <div className="pl-3 space-y-0.5 border-l border-nav-line ml-[1.375rem] mt-1 mb-2 motion-safe:animate-fade-in">
                      {item.submenu.map((subitem) => {
                        const isSubActive = subActive === subitem.href;
                        return (
                          <Link
                            key={subitem.href}
                            to={subitem.href}
                            aria-current={isSubActive ? 'page' : undefined}
                            className={`block min-h-10 pl-3 pr-3 py-2 text-[0.9375rem] rounded-md transition-colors duration-150 truncate ${isSubActive
                                ? 'text-white font-semibold bg-nav-raised'
                                : 'text-nav-text hover:text-white hover:bg-nav-raised'
                              }`}
                          >
                            {subitem.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.href}
                  title={!isOpen ? item.label : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={`min-h-11 flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-150 group relative ${active
                      ? 'bg-nav-raised text-white'
                      : 'text-nav-text hover:bg-nav-raised hover:text-white'
                    }`}
                >
                  {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-nav-mark" aria-hidden="true" />}
                  <span className={`flex-shrink-0 ${active ? 'text-nav-mark' : 'text-nav-text group-hover:text-white'}`}>
                    {item.icon}
                  </span>
                  <span className={`font-semibold text-[0.9375rem] truncate transition-opacity duration-150 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    {item.label}
                  </span>
                </Link>
              )}
            </div>
          )
        })}
      </nav>

      <div className="px-4 py-3 border-t border-nav-line shrink-0">
        <p className={`text-sm text-nav-text truncate ${isOpen ? '' : 'text-center'}`}>{isOpen ? 'Portal IT v2' : 'v2'}</p>
      </div>
      </aside>
    </>
  )
}

export default Sidebar
