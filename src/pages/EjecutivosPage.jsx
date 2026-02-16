import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ejecutivosAPI, proveedoresAPI, tiposServicioAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { useListData } from '../hooks/useListData'
import { usePermissionError } from '../hooks/usePermissionError'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'
import { getPaginationNumbers } from '../utils/paginationHelper'
import Swal from 'sweetalert2'

export default function EjecutivosPage() {
  const navigate = useNavigate()
  const { canCreate, canUpdate, canDelete } = usePermissions()

  usePermissionError()

  const [filtro, setFiltro] = useState('')
  const [proveedorFiltro, setProveedorFiltro] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [proveedores, setProveedores] = useState([])
  const [tiposServicio, setTiposServicio] = useState([])

  const {
    data: ejecutivos,
    loading,
    error,
    page,
    totalPages,
    updateFilters,
    goToPage,
    previousPage,
    nextPage,
    reload
  } = useListData(ejecutivosAPI.list, {
    initialLimit: 12,
    initialFilters: { search: '', proveedor_id: '', tipo_servicio_id: '' }
  })

  useEffect(() => {
    cargarProveedores()
    cargarTiposServicio()
  }, [])

  const cargarProveedores = async () => {
    try {
      const response = await proveedoresAPI.list({ limit: 100, activo: true })
      const normalized = normalizeApiResponse(response)
      setProveedores(normalized.data || [])
    } catch (err) {
      console.error('Error cargando proveedores:', err)
    }
  }

  const cargarTiposServicio = async () => {
    try {
      const response = await tiposServicioAPI.list({ limit: 100, activo: true })
      const normalized = normalizeApiResponse(response)
      setTiposServicio(normalized.data || [])
    } catch (err) {
      console.error('Error cargando tipos de servicio:', err)
    }
  }

  const handleBuscar = (e) => {
    e.preventDefault()
    updateFilters({ search: filtro })
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    if (name === 'proveedor_id') {
      setProveedorFiltro(value)
      updateFilters({ proveedor_id: value })
    } else if (name === 'tipo_servicio_id') {
      setTipoFiltro(value)
      updateFilters({ tipo_servicio_id: value })
    }
  }

  const eliminarEjecutivo = async (ejecutivo) => {
    const result = await Swal.fire({
      title: '¿Eliminar ejecutivo?',
      html: `Se eliminará a <strong>${ejecutivo.nombre} ${ejecutivo.apellido}</strong>.`,
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
        await ejecutivosAPI.delete(ejecutivo.id)
        await Swal.fire({
          title: 'Eliminado',
          text: 'El ejecutivo ha sido eliminado correctamente.',
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
        reload()
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: err.message || 'No se pudo eliminar el ejecutivo',
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
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Ejecutivos de Cuentas</h1>
          <p className="text-surface-500 mt-1 font-medium">Gestión de contactos clave por proveedor</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/proveedores')}
            className="px-4 py-2.5 bg-white border border-surface-200 text-surface-700 rounded-xl font-bold text-sm hover:bg-surface-50 transition-colors shadow-sm"
          >
            Ver Proveedores
          </button>
          {canCreate('proveedores') && (
            <button
              onClick={() => navigate('/proveedores/ejecutivos/nuevo')}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-900/20 transition-all transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Ejecutivo
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
                placeholder="Buscar por nombre, email..."
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
              <label className="block text-xs font-bold text-surface-500 uppercase mb-1.5">Filtrar por Proveedor</label>
              <div className="relative">
                <select
                  name="proveedor_id"
                  value={proveedorFiltro}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none text-sm font-medium text-surface-700"
                >
                  <option value="">Todos los proveedores</option>
                  {proveedores.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.empresa}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-surface-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-500 uppercase mb-1.5">Filtrar por Tipo de Servicio</label>
              <div className="relative">
                <select
                  name="tipo_servicio_id"
                  value={tipoFiltro}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none text-sm font-medium text-surface-700"
                >
                  <option value="">Todos los tipos</option>
                  {tiposServicio.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
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

      {/* Grid de Ejecutivos */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
          <p className="text-surface-500 font-medium">Cargando ejecutivos...</p>
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
      ) : ejecutivos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-surface-200 border-dashed">
          <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4 text-surface-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <p className="text-surface-900 font-bold text-lg">No se encontraron ejecutivos</p>
          <p className="text-surface-500 text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {ejecutivos.map((ejecutivo) => (
              <div
                key={ejecutivo.id}
                className="bg-white rounded-2xl border border-surface-200 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-surface-100 bg-surface-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-200 flex items-center justify-center text-surface-500 font-bold text-sm">
                        {ejecutivo.nombre.charAt(0)}{ejecutivo.apellido.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-surface-900 leading-tight">
                          {ejecutivo.nombre} {ejecutivo.apellido}
                        </h3>
                        <p className="text-xs text-surface-500">{ejecutivo.proveedor?.empresa}</p>
                      </div>
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${ejecutivo.activo
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                      {ejecutivo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1">
                  {ejecutivo.email && (
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg mt-0.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                      <div>
                        <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wide">Email</p>
                        <p className="text-surface-700 text-sm font-medium break-all">{ejecutivo.email}</p>
                      </div>
                    </div>
                  )}

                  {ejecutivo.telefono && (
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg mt-0.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
                      <div>
                        <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wide">Teléfono</p>
                        <p className="text-surface-700 text-sm font-medium">{ejecutivo.telefono}</p>
                      </div>
                    </div>
                  )}

                  {ejecutivo.tipoServicio && (
                    <div className="p-3 bg-surface-50 rounded-xl border border-surface-100">
                      <p className="text-xs text-surface-500 uppercase font-bold mb-1">Especialidad</p>
                      <span className="text-sm font-medium text-surface-700">{ejecutivo.tipoServicio.nombre}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-surface-50 border-t border-surface-100 flex gap-2">
                  <button
                    onClick={() => navigate(`/proveedores/${ejecutivo.proveedor_id}`)}
                    className="flex-1 px-3 py-2 bg-white border border-surface-200 text-surface-700 hover:border-primary-300 hover:text-primary-700 rounded-lg transition-all text-xs font-bold shadow-sm"
                  >
                    Ver Proveedor
                  </button>
                  {canUpdate('proveedores') && (
                    <button
                      onClick={() => navigate(`/proveedores/ejecutivos/${ejecutivo.id}/editar`)}
                      className="p-2 text-surface-500 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  )}
                  {canDelete('proveedores') && (
                    <button
                      onClick={() => eliminarEjecutivo(ejecutivo)}
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
