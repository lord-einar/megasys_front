import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { inventarioAPI, sedesAPI } from '../services/api'
import Swal from 'sweetalert2'
import { usePermissions } from '../hooks/usePermissions'
import { useListData } from '../hooks/useListData'
import { usePermissionError } from '../hooks/usePermissionError'
import { normalizeStatsResponse } from '../utils/apiResponseNormalizer'
import { getPaginationNumbers } from '../utils/paginationHelper'
import InventarioReportes from '../components/inventario/InventarioReportes'
import { BarChart3, Eye, List, MapPin, Pencil, Plus, Search, Trash2 } from 'lucide-react'

export default function InventarioPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { canCreate, canUpdate, canDelete } = usePermissions()
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'listado')

  // Hook para manejar errores de permisos
  usePermissionError()

  // Estado de filtros
  const [filtro, setFiltro] = useState('')
  const [estado, setEstado] = useState(searchParams.get('estado') || '')
  const [sedeId, setSedeId] = useState(searchParams.get('sede_id') || '')
  const [sedes, setSedes] = useState([])

  // Hook para manejar listado con paginación
  const {
    data: inventario,
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
  } = useListData(inventarioAPI.list, {
    initialLimit: 10,
    initialFilters: {
      search: '',
      estado: searchParams.get('estado') || '',
      sede_id: searchParams.get('sede_id') || ''
    }
  })

  // Estadísticas
  const [estadisticas, setEstadisticas] = useState(null)

  useEffect(() => {
    cargarEstadisticas()
    cargarSedes()
  }, [])

  const cargarSedes = async () => {
    try {
      const res = await sedesAPI.list({ limit: 500 })
      setSedes(res?.data || [])
    } catch (err) {
      console.error('Error cargando sedes:', err)
    }
  }

  // Actualizar estado desde URL params
  useEffect(() => {
    const estadoParam = searchParams.get('estado')
    if (estadoParam && estadoParam !== estado) {
      setEstado(estadoParam)
      updateFilters({ estado: estadoParam })
    }
  }, [searchParams])

  // Actualizar filtros cuando cambie el estado
  useEffect(() => {
    updateFilters({ estado })
  }, [estado])

  // Actualizar filtros cuando cambie la sede
  useEffect(() => {
    updateFilters({ sede_id: sedeId })
  }, [sedeId])

  const cargarEstadisticas = async () => {
    try {
      const response = await inventarioAPI.getEstadisticas()
      setEstadisticas(normalizeStatsResponse(response))
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  const handleBuscar = (e) => {
    e.preventDefault()
    updateFilters({ search: filtro })
  }

  const eliminarItem = async (item) => {
    const result = await Swal.fire({
      title: 'Confirmar eliminación',
      html: `¿Está seguro de que desea dar de baja <strong>${item.descripcionCompleta || 'este item'}</strong>?<br/><br/><span style="color: #ef4444; font-size: 0.875rem;">Esta acción no puede ser deshecha.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, dar de baja',
      cancelButtonText: 'Cancelar',
      backdrop: true,
      allowOutsideClick: false,
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-4 py-2 bg-rose-600 text-white rounded-lg',
        cancelButton: 'px-4 py-2 bg-slate-200 text-slate-700 rounded-lg'
      }
    })

    if (result.isConfirmed) {
      try {
        await inventarioAPI.delete(item.id)
        await Swal.fire({
          title: 'Eliminado',
          text: 'El item ha sido dado de baja correctamente.',
          icon: 'success',
          timer: 1500,
          timerProgressBar: true,
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'px-4 py-2 bg-emerald-600 text-white rounded-lg'
          }
        })
        reload()
      } catch (err) {
        // Verificar si es un error de autenticación
        const isAuthError = err.message && err.message.includes('Token')
        Swal.fire({
          title: 'Error',
          text: err.message || 'Error al dar de baja el item.',
          icon: 'error',
          customClass: {
            popup: 'rounded-2xl'
          }
        })
      }
    }
  }

  const estadoBadge = (estado) => {
    const styles = {
      'disponible': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'en_uso': 'bg-blue-50 text-blue-700 border-blue-100',
      'mantenimiento': 'bg-amber-50 text-amber-700 border-amber-100',
      'dado_de_baja': 'bg-rose-50 text-rose-700 border-rose-100',
      'en_prestamo': 'bg-purple-50 text-purple-700 border-purple-100',
      'producto_proveedor': 'bg-orange-50 text-orange-700 border-orange-100'
    }
    return styles[estado] || 'bg-surface-100 text-surface-600 border-surface-200'
  }

  const formatEstado = (estado) => {
    return estado ? estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'
  }

  return (
    <div className="page-shell">
      {/* Encabezado */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Inventario</h1>
          <p className="page-description">Administra y rastrea los activos tecnológicos</p>
        </div>
        <div className="responsive-actions">
          <button
            onClick={() => navigate('/inventario/crear')}
            disabled={!canCreate('inventario')}
            className={`btn-accent ${canCreate('inventario')
              ? ''
              : 'bg-surface-200 text-surface-400 cursor-not-allowed'
              }`}
            title={!canCreate('inventario') ? 'No tienes permiso para crear artículos' : ''}
          >
            <Plus className="w-4 h-4" />
            Nuevo Artículo
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 mb-6 -mt-2">
        <button
          onClick={() => setActiveTab('listado')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'listado'
            ? 'border-primary-500 text-primary-700'
            : 'border-transparent text-surface-500 hover:text-surface-800 hover:bg-surface-50'}`}
        >
          <List className="w-4 h-4" />
          Listado
        </button>
        <button
          onClick={() => setActiveTab('reportes')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'reportes'
            ? 'border-primary-500 text-primary-700'
            : 'border-transparent text-surface-500 hover:text-surface-800 hover:bg-surface-50'}`}
        >
          <BarChart3 className="w-4 h-4" />
          Reportes
        </button>
      </div>

      {activeTab === 'reportes' && <InventarioReportes />}

      {activeTab === 'listado' && <>
      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total" value={estadisticas.resumen?.total || 0} color="blue" />
          <StatCard title="Disponible" value={estadisticas.resumen?.disponible || 0} color="emerald" />
          <StatCard title="En Uso" value={estadisticas.resumen?.enUso || 0} color="indigo" />
          <StatCard title="Mantenimiento" value={estadisticas.resumen?.mantenimiento || 0} color="amber" />
          <StatCard title="Baja" value={estadisticas.resumen?.dadoDeBaja || 0} color="rose" />
        </div>
      )}

      {/* Buscador y Filtros */}
      <div className="card-base p-6 mb-8 bg-white border border-surface-200 shadow-sm">
        <form onSubmit={handleBuscar} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-surface-500 mb-1.5 uppercase tracking-wide">
              Buscar
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400 group-focus-within:text-primary-500 transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Marca, modelo, serial, tag..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400 text-surface-900"
              />
            </div>
          </div>

          <div className="w-full md:w-64">
            <label className="block text-xs font-bold text-surface-500 mb-1.5 uppercase tracking-wide">
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-surface-900"
            >
              <option value="">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="en_uso">En Uso</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="dado_de_baja">Dado de Baja</option>
              <option value="en_prestamo">En Préstamo</option>
              <option value="producto_proveedor">Producto de Proveedor</option>
            </select>
          </div>

          <div className="w-full md:w-64">
            <label className="block text-xs font-bold text-surface-500 mb-1.5 uppercase tracking-wide">
              Sede
            </label>
            <select
              value={sedeId}
              onChange={(e) => setSedeId(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-surface-900"
            >
              <option value="">Todas las sedes</option>
              {sedes.map(s => (
                <option key={s.id} value={s.id}>{s.nombre_sede}</option>
              ))}
            </select>
          </div>

          <div className="flex w-full gap-2 md:w-auto">
            <button
              type="submit"
              className="btn-accent flex-1 md:flex-none"
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={() => {
                setFiltro('')
                setEstado('')
                setSedeId('')
                updateFilters({ search: '', estado: '', sede_id: '' })
              }}
              className="btn-secondary flex-1 md:flex-none"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de Inventario */}
      <div className="card-base bg-white border border-surface-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
            <p className="text-surface-500 font-medium">Cargando inventario...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-rose-800 font-bold mb-1">Error al cargar inventario</p>
            <p className="text-rose-600 text-sm">{error}</p>
          </div>
        ) : inventario.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4 text-surface-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-surface-900 font-medium text-lg">No se encontraron items</p>
            <p className="text-surface-500 text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Identificación
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Garantía
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {inventario.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-surface-100 flex items-center justify-center text-surface-500 text-xs font-bold">
                          {item.tipoArticulo?.nombre?.[0] || 'I'}
                        </div>
                        <div>
                          <p className="font-bold text-surface-900 text-sm">{item.descripcionCompleta || 'Item sin nombre'}</p>
                          <p className="text-xs text-surface-500">{item.marca} {item.modelo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {item.numero_serie ? (
                          <p className="text-xs font-mono text-surface-600 bg-surface-100 px-1.5 py-0.5 rounded w-fit border border-surface-200">SN: {item.numero_serie}</p>
                        ) : <span className="text-xs text-surface-400 italic">Sin SN</span>}
                        {item.service_tag && (
                          <p className="text-[10px] text-surface-500">TAG: {item.service_tag}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-surface-400" />
                        {item.sedePrincipal?.nombre_sede || item.sede?.nombre_sede || 'Sin ubicación'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${estadoBadge(item.estado)}`}>
                        {formatEstado(item.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <GarantiaBadge estado={item.garantia_estado} fechaFin={item.garantia_fecha_fin} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/inventario/${item.id}`)}
                          className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 group-hover:text-surface-600 rounded-lg transition-colors"
                          title="Ver Detalles"
                          aria-label={`Ver detalles de ${item.descripcionCompleta || 'item'}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canUpdate('inventario') && (
                          <button
                            onClick={() => navigate(`/inventario/${item.id}/editar`)}
                            className="p-1.5 text-surface-400 hover:text-amber-600 hover:bg-amber-50 group-hover:text-surface-600 rounded-lg transition-colors"
                            title="Editar"
                            aria-label={`Editar ${item.descripcionCompleta || 'item'}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}

                        {canDelete('inventario') && (
                          <button
                            onClick={() => eliminarItem(item)}
                            className="p-1.5 text-surface-400 hover:text-rose-600 hover:bg-rose-50 group-hover:text-surface-600 rounded-lg transition-colors"
                            title="Eliminar"
                            aria-label={`Eliminar ${item.descripcionCompleta || 'item'}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-surface-200 bg-surface-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-surface-500">
              Mostrando <span className="font-bold text-surface-900">{((page - 1) * limit) + 1}</span> a <span className="font-bold text-surface-900">{Math.min(page * limit, totalRecords)}</span> de <span className="font-bold text-surface-900">{totalRecords}</span> registros
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={previousPage}
                disabled={page === 1}
                className="p-2 border border-surface-200 rounded-lg bg-white text-surface-500 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>

              <div className="flex gap-1">
                {getPaginationNumbers(page, totalPages).map((num, idx) => (
                  <button
                    key={idx}
                    onClick={() => typeof num === 'number' && goToPage(num)}
                    disabled={typeof num !== 'number'}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${num === page
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
                      } ${typeof num !== 'number' ? 'cursor-default border-none bg-transparent' : ''}`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                onClick={nextPage}
                disabled={page === totalPages}
                className="p-2 border border-surface-200 rounded-lg bg-white text-surface-500 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
      </>}
    </div>
  )
}

function GarantiaBadge({ estado, fechaFin }) {
  if (!estado || estado === 'sin_consultar') {
    return <span className="text-xs text-surface-400">-</span>
  }
  if (estado === 'consultando') {
    return <span className="text-xs text-surface-400 italic">Consultando...</span>
  }
  if (estado === 'error') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-rose-50 text-rose-600 border-rose-100">Error</span>
  }
  if (estado === 'sin_garantia') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-surface-50 text-surface-500 border-surface-200">Sin garantía</span>
  }
  if (estado === 'con_garantia' && fechaFin) {
    const dias = Math.ceil((new Date(fechaFin) - new Date()) / (1000 * 60 * 60 * 24))
    if (dias <= 0) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-rose-50 text-rose-600 border-rose-100">Expirada</span>
    }
    if (dias <= 90) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-700 border-amber-100">Por vencer</span>
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-100">Vigente</span>
  }
  return <span className="text-xs text-surface-400">-</span>
}

function StatCard({ title, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100'
  }

  return (
    <div className={`p-4 rounded-xl border ${colors[color] || colors.blue} flex flex-col items-center justify-center text-center`}>
      <span className="text-2xl font-extrabold tracking-tight">{value}</span>
      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 mt-1">{title}</span>
    </div>
  )
}
