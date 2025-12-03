import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Sidebar = () => {
    const location = useLocation();
    const [expandedMenu, setExpandedMenu] = useState(null);

    const toggleMenu = (menuName) => {
        setExpandedMenu(expandedMenu === menuName ? null : menuName);
    };

    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    const isSubmenuActive = (submenu) => {
        return submenu.some(item => location.pathname === item.path);
    };

    const navItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            name: 'Visitas',
            path: '/visitas',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            name: 'Sedes',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            submenu: [
                { name: 'Listar Sedes', path: '/sedes' },
                { name: 'Nueva Sede', path: '/sedes/nueva' },
            ]
        },
        {
            name: 'Personal',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            submenu: [
                { name: 'Listar Personal', path: '/personal' },
                { name: 'Nuevo Personal', path: '/personal/crear' },
            ]
        },
        {
            name: 'Inventario',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            submenu: [
                { name: 'Listar Inventario', path: '/inventario' },
                { name: 'Nuevo Artículo', path: '/inventario/crear' },
                { name: 'Stock Disponible', path: '/inventario?estado=disponible' },
            ]
        },
        {
            name: 'Remitos',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            submenu: [
                { name: 'Listar Remitos', path: '/remitos' },
                { name: 'Nuevo Remito', path: '/remitos/crear' },
            ]
        },
        {
            name: 'Proveedores',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            submenu: [
                { name: 'Listar Proveedores', path: '/proveedores' },
                { name: 'Nuevo Proveedor', path: '/proveedores/crear' },
            ]
        }
    ];

    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 shadow-xl transition-transform duration-300 ease-in-out flex flex-col">
            {/* Logo Area */}
            <div className="flex h-16 items-center px-6 border-b border-slate-800 bg-slate-950">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Megasys" className="h-8 w-auto object-contain" />
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-white tracking-tight leading-none">MEGASYS</span>
                        <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider leading-none mt-0.5">Enterprise</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1 custom-scrollbar">
                <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Principal
                </div>
                {navItems.map((item) => {
                    const hasSubmenu = !!item.submenu;
                    const isItemActive = hasSubmenu
                        ? isSubmenuActive(item.submenu)
                        : isActive(item.path, item.path === '/dashboard');
                    const isExpanded = expandedMenu === item.name || isItemActive;

                    return (
                        <div key={item.name} className="space-y-1">
                            {hasSubmenu ? (
                                <button
                                    onClick={() => toggleMenu(item.name)}
                                    className={`
                    w-full group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                    ${isItemActive
                                            ? 'bg-slate-800 text-white'
                                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                        }
                  `}
                                >
                                    <div className="flex items-center">
                                        <span className={`mr-3 transition-colors ${isItemActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'}`}>
                                            {item.icon}
                                        </span>
                                        {item.name}
                                    </div>
                                    <svg
                                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-slate-400' : 'text-slate-600'}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            ) : (
                                <Link
                                    to={item.path}
                                    className={`
                    group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                    ${isItemActive
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                        }
                  `}
                                >
                                    <span className={`mr-3 transition-colors ${isItemActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>
                                        {item.icon}
                                    </span>
                                    {item.name}
                                </Link>
                            )}

                            {/* Submenu */}
                            {hasSubmenu && (
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="ml-4 pl-4 border-l border-slate-800 space-y-1 my-1">
                                        {item.submenu.map((subItem) => {
                                            const isSubActive = isActive(subItem.path, true);
                                            return (
                                                <Link
                                                    key={subItem.name}
                                                    to={subItem.path}
                                                    className={`
                            block rounded-md px-3 py-2 text-sm transition-colors
                            ${isSubActive
                                                            ? 'text-blue-400 bg-blue-500/10 font-medium'
                                                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                                                        }
                          `}
                                                >
                                                    {subItem.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer / User Profile Summary */}
            <div className="border-t border-slate-800 p-4 bg-slate-950">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold ring-1 ring-slate-700">
                        MS
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xs font-medium text-slate-300">Megasys System</p>
                        <p className="text-[10px] text-slate-500">v2.0.0 Enterprise</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
