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
      title: 'Confirmar eliminación',
      html: `¿Está seguro de que desea eliminar al ejecutivo <strong>${ejecutivo.nombre} ${ejecutivo.apellido}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await ejecutivosAPI.delete(ejecutivo.id)
        await Swal.fire('¡Eliminado!', 'El ejecutivo ha sido eliminado correctamente.', 'success')
        reload()
      } catch (err) {
        Swal.fire('Error', err.message || 'No se pudo eliminar el ejecutivo', 'error')
      }
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Gestión de Ejecutivos de Cuentas</h1>
            <p className="text-gray-600 mt-2">Administra los ejecutivos de los proveedores</p>
          </div>
          {canCreate('proveedores') && (
            <button
              onClick={() => navigate('/proveedores/ejecutivos/nuevo')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Nuevo Ejecutivo
            </button>
          )}
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleBuscar} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={() => {
                setFiltro('')
                updateFilters({ search: '' })
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Limpiar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
              <select
                name="proveedor_id"
                value={proveedorFiltro}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los proveedores</option>
                {proveedores.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.empresa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Servicio</label>
              <select
                name="tipo_servicio_id"
                value={tipoFiltro}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                {tiposServicio.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Grid de Ejecutivos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border-l-4 border-red-600 rounded-lg">
          <p className="text-red-800 font-medium">Error al cargar ejecutivos</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      ) : ejecutivos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No se encontraron ejecutivos</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {ejecutivos.map((ejecutivo) => (
              <div
                key={ejecutivo.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100"
              >
                <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-4 text-white">
                  <h3 className="text-xl font-bold">
                    {ejecutivo.nombre} {ejecutivo.apellido}
                  </h3>
                  {ejecutivo.proveedor && (
                    <p className="text-cyan-100 text-sm mt-1">{ejecutivo.proveedor.empresa}</p>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  {ejecutivo.email && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                      <p className="text-gray-700 text-sm">{ejecutivo.email}</p>
                    </div>
                  )}

                  {ejecutivo.telefono && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Teléfono</p>
                      <p className="text-gray-700 text-sm">{ejecutivo.telefono}</p>
                    </div>
                  )}

                  {ejecutivo.tipoServicio && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Tipo de Servicio</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {ejecutivo.tipoServicio.nombre}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      ejecutivo.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {ejecutivo.activo ? '✓ Activo' : '✗ Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 flex gap-2 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/proveedores/ejecutivos/${ejecutivo.id}/editar`)}
                    disabled={!canUpdate('proveedores')}
                    className={`flex-1 px-3 py-2 rounded transition-colors text-sm font-medium ${
                      canUpdate('proveedores')
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarEjecutivo(ejecutivo)}
                    disabled={!canDelete('proveedores')}
                    className={`flex-1 px-3 py-2 rounded transition-colors text-sm font-medium ${
                      canDelete('proveedores')
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginador */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={previousPage}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                ← Anterior
              </button>

              <div className="flex gap-1">
                {getPaginationNumbers(page, totalPages).map((num, i) =>
                  num === '...' ? (
                    <span key={`dots-${i}`} className="px-2 py-2 text-gray-600">...</span>
                  ) : (
                    <button
                      key={num}
                      onClick={() => goToPage(num)}
                      className={`px-3 py-2 rounded-lg font-medium text-sm ${
                        page === num
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
