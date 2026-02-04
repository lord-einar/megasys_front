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
      allowOutsideClick: false
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
                confirmButtonColor: '#3b82f6'
              })
              reload()
            } catch (err) {
              console.error('Error eliminando sede:', err)
              await Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar la sede: ' + (err.message || 'Error desconocido'),
                icon: 'error',
                confirmButtonColor: '#ef4444'
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Gestión de Sedes</h1>
        <p className="text-gray-600 mt-2">Administra todas las sedes de la empresa</p>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{estadisticas.sedes?.total || 0}</div>
            <div className="text-sm text-gray-600">Sedes Totales</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{estadisticas.sedes?.activas || 0}</div>
            <div className="text-sm text-gray-600">Sedes Activas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{estadisticas.personal?.total || 0}</div>
            <div className="text-sm text-gray-600">Personal Total</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">{estadisticas.inventario?.total || 0}</div>
            <div className="text-sm text-gray-600">Items Inventario</div>
          </div>
        </div>
      )}

      {/* Buscador y Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleBuscar} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar sedes por nombre, localidad..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Toggle de Empresas */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Filtrar por empresa:</p>
            <div className="flex gap-3 flex-wrap">
              {empresas.map((empresa) => (
                <button
                  key={empresa.id}
                  onClick={() => cambiarEmpresa(empresa.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    empresaSeleccionada === empresa.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {empresa.nombre_empresa}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Grid de Cards de Sedes */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando sedes...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border-l-4 border-red-600 rounded-lg">
          <p className="text-red-800 font-medium">Error al cargar sedes</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      ) : sedes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron sedes</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sedes.map((sede) => (
              <div
                key={sede.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100"
              >
                {/* Header de la tarjeta */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                  <h3 className="text-xl font-bold">{sede.nombre_sede}</h3>
                  <p className="text-blue-100 text-sm mt-1">{sede.empresa?.nombre_empresa || 'Sin empresa'}</p>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-4 space-y-3">
                  {/* Ubicación */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Ubicación</p>
                    <p className="text-gray-700 font-medium">{sede.localidad}, {sede.provincia}</p>
                    <p className="text-gray-600 text-sm">{sede.direccion}</p>
                  </div>

                  {/* Detalles */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Personal</p>
                      <p className="text-2xl font-bold text-blue-600">{sede.estadisticas?.totalPersonal || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Inventario</p>
                      <p className="text-2xl font-bold text-green-600">{sede.estadisticas?.totalInventario || 0}</p>
                    </div>
                  </div>

                  {/* Contacto */}
                  {(sede.telefono || sede.ip_sede) && (
                    <div className="pt-3 border-t border-gray-200 space-y-2">
                      {sede.telefono && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-semibold mr-2">Tel:</span>
                          {sede.telefono}
                        </div>
                      )}
                      {sede.ip_sede && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-semibold mr-2">IP:</span>
                          {sede.ip_sede}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Estado */}
                  <div className="pt-3 border-t border-gray-200">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      sede.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {sede.activo ? '✓ Activa' : '✗ Inactiva'}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="bg-gray-50 px-4 py-3 flex gap-2 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/sedes/${sede.id}`)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => navigate(`/sedes/${sede.id}/editar`)}
                    disabled={!canUpdate('sedes')}
                    className={`flex-1 px-3 py-2 rounded transition-colors text-sm font-medium ${
                      canUpdate('sedes')
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                    title={!canUpdate('sedes') ? 'No tienes permiso para editar sedes' : ''}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarSede(sede)}
                    disabled={!canDelete('sedes')}
                    className={`flex-1 px-3 py-2 rounded transition-colors text-sm font-medium ${
                      canDelete('sedes')
                        ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                    title={!canDelete('sedes') ? 'No tienes permiso para eliminar sedes' : ''}
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
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                ← Anterior
              </button>

              <div className="flex gap-1">
                {getPaginationNumbers(page, totalPages).map((num, i) =>
                  num === '...' ? (
                    <span key={`dots-${i}`} className="px-2 py-2 text-gray-600">
                      ...
                    </span>
                  ) : (
                    <button
                      key={num}
                      onClick={() => goToPage(num)}
                      className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                        page === num
                          ? 'bg-blue-600 text-white shadow-md'
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
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
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
