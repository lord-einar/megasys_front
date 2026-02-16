import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { equiposServicioAPI, serviciosAPI, sedesAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { useListData } from '../hooks/useListData'
import { usePermissionError } from '../hooks/usePermissionError'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'
import { getPaginationNumbers } from '../utils/paginationHelper'
import Swal from 'sweetalert2'

export default function EquiposPage() {
  const navigate = useNavigate()
  const { canCreate, canUpdate, canDelete } = usePermissions()

  usePermissionError()

  const [filtro, setFiltro] = useState('')
  const [servicioFiltro, setServicioFiltro] = useState('')
  const [sedeFiltro, setSedeFiltro] = useState('')
  const [servicios, setServicios] = useState([])
  const [sedes, setSedes] = useState([])

  const {
    data: equipos,
    loading,
    error,
    page,
    totalPages,
    updateFilters,
    goToPage,
    previousPage,
    nextPage,
    reload
  } = useListData(equiposServicioAPI.list, {
    initialLimit: 12,
    initialFilters: { search: '', servicio_id: '', sede_id: '' }
  })

  useEffect(() => {
    cargarServicios()
    cargarSedes()
  }, [])

  const cargarServicios = async () => {
    try {
      const response = await serviciosAPI.list({ limit: 100, activo: true })
      const normalized = normalizeApiResponse(response)
      setServicios(normalized.data || [])
    } catch (err) {
      console.error('Error cargando servicios:', err)
    }
  }

  const cargarSedes = async () => {
    try {
      const response = await sedesAPI.list({ limit: 100, activo: true })
      const normalized = normalizeApiResponse(response)
      setSedes(normalized.data || [])
    } catch (err) {
      console.error('Error cargando sedes:', err)
    }
  }

  const handleBuscar = (e) => {
    e.preventDefault()
    updateFilters({ search: filtro })
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    if (name === 'servicio_id') {
      setServicioFiltro(value)
      updateFilters({ servicio_id: value })
    } else if (name === 'sede_id') {
      setSedeFiltro(value)
      updateFilters({ sede_id: value })
    }
  }

  const eliminarEquipo = async (equipo) => {
    const result = await Swal.fire({
      title: '¿Eliminar equipo?',
      html: `Se eliminará el equipo con MAC <strong>${equipo.mac || 'no asignada'}</strong>.`,
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
        await equiposServicioAPI.delete(equipo.id)
        await Swal.fire({
          title: 'Eliminado',
          text: 'El equipo ha sido eliminado correctamente.',
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
        reload()
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: err.message || 'No se pudo eliminar el equipo',
          icon: 'error',
          customClass: { popup: 'rounded-2xl' }
        })
      }
    }
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Equipos en Sedes</h1>
          <p className="text-surface-500 mt-1 font-medium">Inventario de equipos asociados a servicios</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/proveedores/servicios')}
            className="px-4 py-2.5 bg-white border border-surface-200 text-surface-700 rounded-xl font-bold text-sm hover:bg-surface-50 transition-colors shadow-sm"
          >
            Ver Servicios
          </button>
          {canCreate('proveedores') && (
            <button
              onClick={() => navigate('/proveedores/equipos/nuevo')}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-900/20 transition-all transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Equipo
            </button>
          )}
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="card-base p-6 bg-white border border-surface-200 shadow-sm mb-8 space-y-4">
        <form onSubmit={handleBuscar} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por MAC, Modelo, Serie..."
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-surface-100">
            <div>
              <label className="block text-xs font-bold text-surface-500 uppercase mb-1.5">Filtrar por Servicio</label>
              <div className="relative">
                <select
                  name="servicio_id"
                  value={servicioFiltro}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none text-sm font-medium text-surface-700"
                >
                  <option value="">Todos los servicios</option>
                  {servicios.map((servicio) => (
                    <option key={servicio.id} value={servicio.id}>
                      {servicio.nombre}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-surface-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-500 uppercase mb-1.5">Filtrar por Sede</label>
              <div className="relative">
                <select
                  name="sede_id"
                  value={sedeFiltro}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none text-sm font-medium text-surface-700"
                >
                  <option value="">Todas las sedes</option>
                  {sedes.map((sede) => (
                    <option key={sede.id} value={sede.id}>
                      {sede.nombre_sede}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-surface-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Grid de Equipos */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
          <p className="text-surface-500 font-medium">Cargando equipos...</p>
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
      ) : equipos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-surface-200 border-dashed">
          <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4 text-surface-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
          </div>
          <p className="text-surface-900 font-bold text-lg">No se encontraron equipos</p>
          <p className="text-surface-500 text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {equipos.map((equipo) => (
              <div
                key={equipo.id}
                className="bg-white rounded-2xl border border-surface-200 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-surface-100 bg-surface-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-1">Dirección MAC</p>
                      <h3 className="text-lg font-mono font-bold text-surface-900 tracking-wider">
                        {equipo.mac || 'N/A'}
                      </h3>
                      <p className="text-sm text-surface-500 mt-1 truncate max-w-[200px]" title={equipo.servicio?.nombre}>
                        {equipo.servicio?.nombre}
                      </p>
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${equipo.activo
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                      {equipo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg mt-0.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div>
                    <div>
                      <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wide">Ubicación</p>
                      <p className="text-surface-700 text-sm font-medium">{equipo.sede?.nombre_sede || 'Sin Sede Asignada'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {equipo.marca && (
                      <div>
                        <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wide">Marca</p>
                        <p className="text-surface-700 text-sm">{equipo.marca}</p>
                      </div>
                    )}
                    {equipo.modelo && (
                      <div>
                        <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wide">Modelo</p>
                        <p className="text-surface-700 text-sm">{equipo.modelo}</p>
                      </div>
                    )}
                  </div>

                  {equipo.numero_serie && (
                    <div>
                      <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wide">Número de Serie</p>
                      <p className="text-surface-700 text-xs font-mono">{equipo.numero_serie}</p>
                    </div>
                  )}

                  {equipo.observaciones && (
                    <div className="p-3 bg-surface-50 rounded-xl border border-surface-100">
                      <p className="text-xs text-surface-600 line-clamp-2 italic">"{equipo.observaciones}"</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-surface-50 border-t border-surface-100 flex gap-2">
                  <button
                    onClick={() => navigate(`/proveedores/equipos/${equipo.id}/editar`)}
                    disabled={!canUpdate('proveedores')}
                    className={`flex-1 px-3 py-2 border rounded-lg transition-all text-xs font-bold shadow-sm flex items-center justify-center gap-2 ${canUpdate('proveedores')
                        ? 'bg-white border-surface-200 text-surface-700 hover:border-primary-300 hover:text-primary-700'
                        : 'bg-surface-100 border-surface-200 text-surface-400 cursor-not-allowed'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Editar
                  </button>
                  {canDelete('proveedores') && (
                    <button
                      onClick={() => eliminarEquipo(equipo)}
                      className="p-2 bg-white border border-surface-200 text-surface-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-lg transition-colors"
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
                {getPaginationNumbers(page, totalPages).map((num, i) =>
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
