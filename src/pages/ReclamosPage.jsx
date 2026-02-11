import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { reclamosAPI, serviciosAPI, sedesAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { useListData } from '../hooks/useListData'
import { usePermissionError } from '../hooks/usePermissionError'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'
import { getPaginationNumbers } from '../utils/paginationHelper'

export default function ReclamosPage() {
  const navigate = useNavigate()
  const { canCreate, canUpdate } = usePermissions()

  usePermissionError()

  const [estadisticas, setEstadisticas] = useState(null)
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [prioridadFiltro, setPrioridadFiltro] = useState('')
  const [servicioFiltro, setServicioFiltro] = useState('')
  const [sedeFiltro, setSedeFiltro] = useState('')
  const [servicios, setServicios] = useState([])
  const [sedes, setSedes] = useState([])

  const {
    data: reclamos,
    loading,
    error,
    page,
    totalPages,
    updateFilters,
    goToPage,
    previousPage,
    nextPage,
    reload
  } = useListData(reclamosAPI.list, {
    initialLimit: 10,
    initialFilters: { estado: '', prioridad: '', servicio_id: '', sede_id: '' }
  })

  useEffect(() => {
    cargarEstadisticas()
    cargarServicios()
    cargarSedes()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      const response = await reclamosAPI.getEstadisticas()
      const normalized = normalizeApiResponse(response)
      setEstadisticas(normalized.data)
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    }
  }

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target

    if (name === 'estado') {
      setEstadoFiltro(value)
      updateFilters({ estado: value })
    } else if (name === 'prioridad') {
      setPrioridadFiltro(value)
      updateFilters({ prioridad: value })
    } else if (name === 'servicio_id') {
      setServicioFiltro(value)
      updateFilters({ servicio_id: value })
    } else if (name === 'sede_id') {
      setSedeFiltro(value)
      updateFilters({ sede_id: value })
    }
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      abierto: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      en_proceso: 'bg-blue-100 text-blue-800 border-blue-200',
      resuelto: 'bg-green-100 text-green-800 border-green-200',
      cerrado: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelado: 'bg-red-100 text-red-800 border-red-200'
    }
    return badges[estado] || 'bg-gray-100 text-gray-800'
  }

  const getEstadoLabel = (estado) => {
    const labels = {
      abierto: 'Abierto',
      en_proceso: 'En Proceso',
      resuelto: 'Resuelto',
      cerrado: 'Cerrado',
      cancelado: 'Cancelado'
    }
    return labels[estado] || estado
  }

  const getPrioridadBadge = (prioridad) => {
    const badges = {
      baja: 'bg-gray-100 text-gray-700',
      media: 'bg-blue-100 text-blue-700',
      alta: 'bg-orange-100 text-orange-700',
      critica: 'bg-red-100 text-red-700'
    }
    return badges[prioridad] || 'bg-gray-100 text-gray-700'
  }

  const getPrioridadLabel = (prioridad) => {
    const labels = {
      baja: 'Baja',
      media: 'Media',
      alta: 'Alta',
      critica: 'Crítica'
    }
    return labels[prioridad] || prioridad
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Gestión de Reclamos</h1>
            <p className="text-gray-600 mt-2">Administra reclamos de servicios</p>
          </div>
          {canCreate('proveedores') && (
            <button
              onClick={() => navigate('/proveedores/reclamos/nuevo')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Nuevo Reclamo
            </button>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xl font-bold text-yellow-600">{estadisticas.porEstado?.abierto || 0}</div>
            <div className="text-sm text-gray-600">Abiertos</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xl font-bold text-blue-600">{estadisticas.porEstado?.en_proceso || 0}</div>
            <div className="text-sm text-gray-600">En Proceso</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xl font-bold text-green-600">{estadisticas.porEstado?.resuelto || 0}</div>
            <div className="text-sm text-gray-600">Resueltos</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xl font-bold text-red-600">{estadisticas.porPrioridad?.critica || 0}</div>
            <div className="text-sm text-gray-600">Críticos</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xl font-bold text-orange-600">{estadisticas.porPrioridad?.alta || 0}</div>
            <div className="text-sm text-gray-600">Alta Prioridad</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              name="estado"
              value={estadoFiltro}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="abierto">Abierto</option>
              <option value="en_proceso">En Proceso</option>
              <option value="resuelto">Resuelto</option>
              <option value="cerrado">Cerrado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
            <select
              name="prioridad"
              value={prioridadFiltro}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Servicio</label>
            <select
              name="servicio_id"
              value={servicioFiltro}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {servicios.map((servicio) => (
                <option key={servicio.id} value={servicio.id}>
                  {servicio.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sede</label>
            <select
              name="sede_id"
              value={sedeFiltro}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {sedes.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre_sede}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Reclamos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border-l-4 border-red-600 rounded-lg">
          <p className="text-red-800 font-medium">Error al cargar reclamos</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      ) : reclamos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No hay reclamos para mostrar</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Número</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Servicio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Sede</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Prioridad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reclamos.map((reclamo) => (
                    <tr key={reclamo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {reclamo.numero_reclamo}
                      </td>
                      <td className="px-6 py-4 text-gray-900 max-w-xs truncate">
                        {reclamo.titulo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {reclamo.servicio?.nombre || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {reclamo.sede?.nombre_sede || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoBadge(reclamo.estado)}`}>
                          {getEstadoLabel(reclamo.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPrioridadBadge(reclamo.prioridad)}`}>
                          {getPrioridadLabel(reclamo.prioridad)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(reclamo.fecha_apertura).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/proveedores/reclamos/${reclamo.id}`)}
                          className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
