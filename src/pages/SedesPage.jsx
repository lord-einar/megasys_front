import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sedesAPI, empresasAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { useListData } from '../hooks/useListData'
import { usePermissionError } from '../hooks/usePermissionError'
import { normalizeStatsResponse, normalizeApiResponse } from '../utils/apiResponseNormalizer'
import { getPaginationNumbers } from '../utils/paginationHelper'
import Swal from 'sweetalert2'

export default function SedesPage() {
  const navigate = useNavigate()
  const { canUpdate, canDelete } = usePermissions()

  // Hook para manejar errores de permisos
  usePermissionError()

  // Estados locales
  const [empresas, setEmpresas] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null)

  // Hook para manejar listado con paginación
  const {
    data: sedes,
    loading,
    error,
    page,
    limit,
    totalPages,
    totalRecords,
    updateFilters,
    goToPage,
    previousPage,
    nextPage,
    reload
  } = useListData(sedesAPI.list, {
    initialLimit: 9,
    initialFilters: { search: '', empresa_id: null }
  })

  useEffect(() => {
    cargarEmpresas()
    cargarEstadisticas()
  }, [])

  // Actualizar filtros cuando cambie la empresa seleccionada
  useEffect(() => {
    updateFilters({ empresa_id: empresaSeleccionada })
  }, [empresaSeleccionada])

  const cargarEmpresas = async () => {
    try {
      const response = await empresasAPI.getActivas()
      const normalized = normalizeApiResponse(response)
      setEmpresas(normalized.data)
    } catch (err) {
      console.error('Error cargando empresas:', err)
      setEmpresas([])
    }
  }

  const cargarEstadisticas = async () => {
    try {
      const response = await sedesAPI.getEstadisticas()
      setEstadisticas(normalizeStatsResponse(response))
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  const handleBuscar = (e) => {
    e.preventDefault()
    updateFilters({ search: filtro })
  }

  const cambiarEmpresa = (empresaId) => {
    setEmpresaSeleccionada(empresaId === empresaSeleccionada ? null : empresaId)
  }

  // Colores de marca para diferenciación visual
  const getBrandStyle = (nombreEmpresa) => {
    const name = (nombreEmpresa || '').toLowerCase()
    if (name.includes('fiter')) {
      return {
        borderColor: 'border-l-orange-500',
        badgeBg: 'bg-orange-50',
        badgeText: 'text-orange-700',
        badgeBorder: 'border-orange-200',
        dotColor: 'bg-orange-500',
        hoverBorder: 'hover:border-orange-200',
        hoverShadow: 'hover:shadow-orange-900/5',
        headerHover: 'group-hover:bg-orange-50/20',
        nameHover: 'group-hover:text-orange-700',
        filterActive: 'bg-orange-50 border-orange-200 text-orange-700',
      }
    }
    // Megatlon (default)
    return {
      borderColor: 'border-l-sky-600',
      badgeBg: 'bg-sky-50',
      badgeText: 'text-sky-700',
      badgeBorder: 'border-sky-200',
      dotColor: 'bg-sky-600',
      hoverBorder: 'hover:border-sky-200',
      hoverShadow: 'hover:shadow-sky-900/5',
      headerHover: 'group-hover:bg-sky-50/20',
      nameHover: 'group-hover:text-sky-700',
      filterActive: 'bg-sky-50 border-sky-200 text-sky-700',
    }
  }

  const eliminarSede = async (sede) => {
    const result = await Swal.fire({
      title: 'Confirmar eliminación',
      html: `¿Está seguro de que desea eliminar la sede <strong>${sede.nombre_sede}</strong>?<br/><br/><span style="color: #ef4444; font-size: 0.875rem;">Esta acción no puede ser deshecha.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      backdrop: true,
      allowOutsideClick: false,
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-4 py-2 bg-red-600 text-white rounded-lg',
        cancelButton: 'px-4 py-2 bg-slate-200 text-slate-700 rounded-lg'
      }
    })

    if (result.isConfirmed) {
      try {
        await Swal.fire({
          title: 'Eliminando...',
          html: 'Por favor espere',
          allowOutsideClick: false,
          didOpen: async () => {
            Swal.showLoading()
            try {
              await sedesAPI.delete(sede.id)
              await Swal.fire({
                title: '¡Eliminado!',
                text: 'La sede ha sido eliminada correctamente.',
                icon: 'success',
                confirmButtonColor: '#3b82f6',
                customClass: {
                  popup: 'rounded-2xl',
                  confirmButton: 'px-4 py-2 bg-blue-600 text-white rounded-lg'
                }
              })
              reload()
            } catch (err) {
              console.error('Error eliminando sede:', err)
              await Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar la sede: ' + (err.message || 'Error desconocido'),
                icon: 'error',
                confirmButtonColor: '#ef4444',
                customClass: {
                  popup: 'rounded-2xl'
                }
              })
            }
          }
        })
      } catch (err) {
        console.error('Error inesperado:', err)
      }
    }
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Gestión de Sedes</h1>
          <p className="text-surface-500 mt-1 font-medium">Administra la infraestructura física de la empresa</p>
        </div>
        <div>
          <button
            onClick={() => navigate('/sedes/nueva')}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-surface-900/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva Sede
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatMiniCard title="Sedes Totales" value={estadisticas.sedes?.total || 0} color="blue" />
          <StatMiniCard title="Sedes Activas" value={estadisticas.sedes?.activas || 0} color="emerald" />
          <StatMiniCard title="Personal Total" value={estadisticas.personal?.total || 0} color="indigo" />
          <StatMiniCard title="Items Inventario" value={estadisticas.inventario?.total || 0} color="amber" />
        </div>
      )}

      {/* Buscador y Filtros */}
      <div className="card-base p-6 mb-8 bg-white border border-surface-200 shadow-sm">
        <form onSubmit={handleBuscar} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400 group-focus-within:text-primary-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar sedes por nombre, localidad, provincia..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400 text-surface-900"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-sm hover:shadow-md font-medium text-sm flex items-center gap-2"
              >
                Buscar
              </button>
              <button
                type="button"
                onClick={() => {
                  setFiltro('')
                  updateFilters({ search: '' })
                }}
                className="px-4 py-2.5 bg-white border border-surface-200 text-surface-600 rounded-xl hover:bg-surface-50 hover:text-surface-900 transition-colors font-medium text-sm"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Toggle de Empresas */}
          <div className="pt-4 border-t border-surface-100">
            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Filtrar por empresa</p>
            <div className="flex gap-2 flex-wrap">
              {empresas.map((empresa) => {
                const brand = getBrandStyle(empresa.nombre_empresa)
                return (
                  <button
                    key={empresa.id}
                    type="button"
                    onClick={() => cambiarEmpresa(empresa.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${empresaSeleccionada === empresa.id
                      ? `${brand.filterActive} shadow-sm`
                      : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300 hover:bg-surface-50'
                      }`}
                  >
                    {empresa.nombre_empresa}
                  </button>
                )
              })}
            </div>
          </div>
        </form>
      </div>

      {/* Grid de Cards de Sedes */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 border-2 border-surface-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
          <p className="text-surface-500 font-medium">Cargando sedes...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-4">
          <svg className="w-6 h-6 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-rose-800 font-bold mb-1">Error al cargar sedes</p>
            <p className="text-rose-600 text-sm">{error}</p>
          </div>
        </div>
      ) : sedes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-surface-200">
          <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4 text-surface-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-surface-900 font-medium text-lg">No se encontraron sedes</p>
          <p className="text-surface-500 text-sm mt-1">Prueba ajustando los filtros de búsqueda</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sedes.map((sede) => {
              const brand = getBrandStyle(sede.empresa?.nombre_empresa)
              return (
                <div
                  key={sede.id}
                  className={`group bg-white rounded-2xl border border-surface-200 ${brand.hoverBorder} hover:shadow-lg ${brand.hoverShadow} transition-all duration-300 overflow-hidden flex flex-col border-l-4 ${brand.borderColor}`}
                >
                  {/* Header de la tarjeta */}
                  <div className={`p-5 border-b border-surface-100 bg-surface-50/30 ${brand.headerHover} transition-colors`}>
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h3 className={`text-lg font-bold text-surface-900 ${brand.nameHover} transition-colors leading-tight`}>
                          {sede.nombre_sede}
                        </h3>
                        <p className="text-sm mt-1 flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${brand.badgeBg} ${brand.badgeText} ${brand.badgeBorder}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${brand.dotColor}`}></span>
                            {sede.empresa?.nombre_empresa || 'Sin empresa'}
                          </span>
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${sede.activo
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                        {sede.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>

                  {/* Contenido de la tarjeta */}
                  <div className="p-5 space-y-4 flex-1">
                    {/* Ubicación */}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-surface-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-900">{sede.direccion}</p>
                        <p className="text-xs text-surface-500 mt-0.5">{sede.localidad}, {sede.provincia}</p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-surface-50">
                      <div className="bg-surface-50/50 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-0.5">Personal</p>
                        <p className="text-lg font-bold text-surface-900">{sede.estadisticas?.totalPersonal || 0}</p>
                      </div>
                      <div className="bg-surface-50/50 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-0.5">Inventario</p>
                        <p className="text-lg font-bold text-surface-900">{sede.estadisticas?.totalInventario || 0}</p>
                      </div>
                    </div>

                    {/* Contacto */}
                    {(sede.telefono || sede.ip_sede) && (
                      <div className="space-y-2 pt-1">
                        {sede.telefono && (
                          <div className="flex items-center gap-2 text-xs text-surface-600">
                            <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="font-mono">{sede.telefono}</span>
                          </div>
                        )}
                        {sede.ip_sede && (
                          <div className="flex items-center gap-2 text-xs text-surface-600">
                            <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            <span className="bg-surface-100 px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wide text-surface-700">{sede.ip_sede}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="p-4 bg-surface-50 border-t border-surface-100 flex gap-2">
                    <button
                      onClick={() => navigate(`/sedes/${sede.id}`)}
                      className="flex-1 px-3 py-2 bg-white border border-surface-200 text-surface-700 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all text-xs font-bold shadow-sm"
                    >
                      Ver Detalles
                    </button>
                    {canUpdate('sedes') && (
                      <button
                        onClick={() => navigate(`/sedes/${sede.id}/editar`)}
                        className="px-3 py-2 bg-white border border-surface-200 text-surface-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 rounded-lg transition-all shadow-sm"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                    {canDelete('sedes') && (
                      <button
                        onClick={() => eliminarSede(sede)}
                        className="px-3 py-2 bg-white border border-surface-200 text-surface-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-lg transition-all shadow-sm"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Paginador */}
          {
            totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 mb-8">
                <button
                  onClick={previousPage}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs text-surface-600 shadow-sm"
                >
                  ← Anterior
                </button>

                <div className="flex gap-1">
                  {getPaginationNumbers(page, totalPages).map((num, i) =>
                    num === '...' ? (
                      <span key={`dots-${i}`} className="px-2 py-2 text-surface-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={num}
                        onClick={() => goToPage(num)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-all ${page === num
                          ? 'bg-primary-600 text-white shadow-md ring-2 ring-primary-100'
                          : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
                          }`}
                      >
                        {num}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={nextPage}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs text-surface-600 shadow-sm"
                >
                  Siguiente →
                </button>
              </div>
            )
          }
        </>
      )}
    </div>
  )
}

function StatMiniCard({ title, value, color }) {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-100'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-100'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-100'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-100'
    }
  }

  const theme = colors[color] || colors.blue;

  return (
    <div className={`p-4 rounded-xl border ${theme.bg} ${theme.border} flex flex-col items-center justify-center`}>
      <span className={`text-2xl font-bold tracking-tight ${theme.text}`}>{value}</span>
      <span className={`text-[10px] uppercase font-bold tracking-wider opacity-80 ${theme.text}`}>{title}</span>
    </div>
  )
}
