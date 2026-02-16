import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { proveedoresAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { useListData } from '../hooks/useListData'
import { usePermissionError } from '../hooks/usePermissionError'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'
import Swal from 'sweetalert2'

export default function ProveedoresPage() {
  const navigate = useNavigate()
  const { canCreate, canUpdate, canDelete } = usePermissions()

  usePermissionError()

  const [estadisticas, setEstadisticas] = useState(null)
  const [filtro, setFiltro] = useState('')

  const {
    data: proveedores,
    loading,
    error,
    page,
    totalPages,
    totalRecords,
    updateFilters,
    goToPage,
    previousPage,
    nextPage,
    reload
  } = useListData(proveedoresAPI.list, {
    initialLimit: 9,
    initialFilters: { search: '' }
  })

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      const response = await proveedoresAPI.getEstadisticas()
      const normalized = normalizeApiResponse(response)
      setEstadisticas(normalized.data)
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  const handleBuscar = (e) => {
    e.preventDefault()
    updateFilters({ search: filtro })
  }

  // Generar números de paginación
  const getPaginationNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 3; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        pages.push(page)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  const eliminarProveedor = async (proveedor) => {
    const result = await Swal.fire({
      title: '¿Eliminar proveedor?',
      text: `Se eliminará "${proveedor.empresa}" y toda su información asociada. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'bg-rose-600 text-white px-4 py-2 rounded-lg',
        cancelButton: 'bg-surface-200 text-surface-700 px-4 py-2 rounded-lg ml-2'
      },
      buttonsStyling: false
    })

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Eliminando...',
          text: 'Por favor espere',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
          customClass: { popup: 'rounded-2xl' }
        })

        await proveedoresAPI.delete(proveedor.id)

        await Swal.fire({
          title: 'Eliminado',
          text: 'El proveedor ha sido eliminado correctamente.',
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
        reload()
        cargarEstadisticas()
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el proveedor: ' + (err.message || 'Error desconocido'),
          icon: 'error',
          customClass: { popup: 'rounded-2xl' }
        })
      }
    }
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Proveedores y Servicios</h1>
          <p className="text-surface-500 mt-1 font-medium">Gestión integral de prestadores externos</p>
        </div>
        {canCreate('proveedores') && (
          <button
            onClick={() => navigate('/proveedores/nuevo')}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-900/20 transition-all transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Proveedor
          </button>
        )}
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white rounded-2xl border border-surface-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-surface-900">{estadisticas.proveedores?.total || 0}</div>
                <div className="text-sm font-medium text-surface-500">Proveedores Totales</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-surface-100 flex justify-between items-center text-xs">
              <span className="text-surface-400">Activos actualmente</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{estadisticas.proveedores?.activos || 0} Activos</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-surface-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-surface-900">{estadisticas.servicios?.total || 0}</div>
                <div className="text-sm font-medium text-surface-500">Servicios Contratados</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-surface-100 flex justify-between items-center text-xs">
              <span className="text-surface-400">Total servicios activos</span>
              <span className="font-bold text-surface-600 cursor-pointer hover:text-primary-600 transition-colors" onClick={() => navigate('/proveedores/servicios')}>Ver detalles →</span>
            </div>
          </div>

          <div
            onClick={() => navigate('/proveedores/reclamos')}
            className="p-6 bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100 shadow-sm cursor-pointer hover:shadow-md hover:border-orange-200 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white text-orange-500 rounded-xl shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <div className="text-xl font-bold text-surface-900">Gestión de Reclamos</div>
                <div className="text-sm font-medium text-surface-500">Incidencias y garantías</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-orange-100 flex justify-between items-center text-xs">
              <span className="text-orange-700/60 font-medium">Revisar estado de reclamos</span>
              <span className="font-bold text-orange-600 group-hover:translate-x-1 transition-transform">Acceder →</span>
            </div>
          </div>
        </div>
      )}

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '🔧', label: 'Servicios', desc: 'Catálogo completo', path: '/proveedores/servicios', color: 'from-blue-500 to-blue-600' },
          { icon: '💻', label: 'Equipos', desc: 'Inventario externo', path: '/proveedores/equipos', color: 'from-indigo-500 to-indigo-600' },
          { icon: '👔', label: 'Ejecutivos', desc: 'Contactos clave', path: '/proveedores/ejecutivos', color: 'from-cyan-500 to-cyan-600' },
          { icon: '📋', label: 'Tipos', desc: 'Configuración', path: '/proveedores/tipos-servicio', color: 'from-teal-500 to-teal-600' }
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => navigate(item.path)}
            className="group relative overflow-hidden bg-white p-5 rounded-2xl border border-surface-200 shadow-sm hover:shadow-lg transition-all text-left"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
            <div className="relative z-10">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-bold text-surface-900">{item.label}</div>
              <div className="text-xs text-surface-500">{item.desc}</div>
            </div>
            <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
              <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </button>
        ))}
      </div>

      {/* Buscador */}
      <div className="card-base p-4 mb-8 bg-white border border-surface-200 shadow-sm">
        <form onSubmit={handleBuscar} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Buscar proveedores por empresa, email..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors shadow-lg shadow-primary-900/10"
          >
            Buscar
          </button>
          {filtro && (
            <button
              type="button"
              onClick={() => {
                setFiltro('')
                updateFilters({ search: '' })
              }}
              className="px-4 py-2.5 bg-white border border-surface-200 text-surface-600 rounded-xl hover:bg-surface-50 transition-colors font-medium text-sm"
            >
              Limpiar
            </button>
          )}
        </form>
      </div>

      {/* Grid de Proveedores */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
          <p className="text-surface-500 font-medium">Cargando proveedores...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-full">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <h3 className="text-rose-900 font-bold">Error de carga</h3>
            <p className="text-rose-700 text-sm">{error}</p>
          </div>
        </div>
      ) : proveedores.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-surface-200 border-dashed">
          <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4 text-surface-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <p className="text-surface-900 font-bold text-lg">No se encontraron proveedores</p>
          <p className="text-surface-500 text-sm mt-1">Intenta ajustar los términos de búsqueda</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {proveedores.map((proveedor) => (
              <div
                key={proveedor.id}
                className="bg-white rounded-2xl border border-surface-200 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col"
              >
                <div className="p-6 pb-4 border-b border-surface-100 bg-surface-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-surface-900 line-clamp-1" title={proveedor.empresa}>{proveedor.empresa}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${proveedor.activo
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                      {proveedor.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-surface-500 text-xs font-medium bg-white px-2 py-1 rounded border border-surface-200 w-fit">
                    {proveedor.ejecutivos?.length || 0} ejecutivo(s) asociados
                  </p>
                </div>

                <div className="p-6 space-y-4 flex-1">
                  {proveedor.email ? (
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg mt-0.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                      <div>
                        <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wide">Email</p>
                        <p className="text-surface-700 text-sm font-medium">{proveedor.email}</p>
                      </div>
                    </div>
                  ) : <div className="h-10"></div>}

                  {proveedor.telefono ? (
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg mt-0.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
                      <div>
                        <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wide">Teléfono</p>
                        <p className="text-surface-700 text-sm font-medium">{proveedor.telefono}</p>
                      </div>
                    </div>
                  ) : <div className="h-10"></div>}

                  {proveedor.direccion ? (
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg mt-0.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                      <div>
                        <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wide">Dirección</p>
                        <p className="text-surface-700 text-sm font-medium line-clamp-2">{proveedor.direccion}</p>
                      </div>
                    </div>
                  ) : <div className="h-10"></div>}
                </div>

                <div className="p-4 bg-surface-50 border-t border-surface-100 flex gap-2">
                  <button
                    onClick={() => navigate(`/proveedores/${proveedor.id}`)}
                    className="flex-1 px-3 py-2 bg-white border border-surface-200 text-surface-700 hover:border-primary-300 hover:text-primary-700 rounded-lg transition-all text-xs font-bold shadow-sm"
                  >
                    Detalles
                  </button>
                  {canUpdate('proveedores') && (
                    <button
                      onClick={() => navigate(`/proveedores/${proveedor.id}/editar`)}
                      className="p-2 text-surface-500 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  )}
                  {canDelete('proveedores') && (
                    <button
                      onClick={() => eliminarProveedor(proveedor)}
                      className="p-2 text-surface-500 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Paginador */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <button
                onClick={previousPage}
                disabled={page === 1}
                className="p-2 rounded-lg border border-surface-200 text-surface-500 hover:bg-white hover:text-surface-900 disabled:opacity-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>

              <div className="flex gap-1.5">
                {getPaginationNumbers().map((num, i) =>
                  num === '...' ? (
                    <span key={`dots-${i}`} className="px-2 py-1 text-surface-400">...</span>
                  ) : (
                    <button
                      key={num}
                      onClick={() => goToPage(num)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${page === num
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                          : 'bg-white text-surface-600 border border-surface-200 hover:border-primary-300'
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
                className="p-2 rounded-lg border border-surface-200 text-surface-500 hover:bg-white hover:text-surface-900 disabled:opacity-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
