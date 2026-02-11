import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { proveedoresAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { useListData } from '../hooks/useListData'
import { usePermissionError } from '../hooks/usePermissionError'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'
import { getPaginationNumbers } from '../utils/paginationHelper'
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
    limit,
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

  const eliminarProveedor = async (proveedor) => {
    const result = await Swal.fire({
      title: 'Confirmar eliminación',
      html: `¿Está seguro de que desea eliminar el proveedor <strong>${proveedor.empresa}</strong>?<br/><br/><span style="color: #ef4444; font-size: 0.875rem;">Esta acción no puede ser deshecha.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
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
              await proveedoresAPI.delete(proveedor.id)
              await Swal.fire({
                title: '¡Eliminado!',
                text: 'El proveedor ha sido eliminado correctamente.',
                icon: 'success',
                confirmButtonColor: '#3b82f6'
              })
              reload()
              cargarEstadisticas()
            } catch (err) {
              await Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el proveedor: ' + (err.message || 'Error desconocido'),
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
        <h1 className="text-4xl font-bold text-gray-900">Gestión de Proveedores y Servicios</h1>
        <p className="text-gray-600 mt-2">Administra proveedores, servicios, equipos y reclamos</p>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{estadisticas.proveedores?.total || 0}</div>
            <div className="text-sm text-gray-600">Proveedores Totales</div>
            <div className="text-xs text-gray-500 mt-1">{estadisticas.proveedores?.activos || 0} activos</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{estadisticas.servicios?.total || 0}</div>
            <div className="text-sm text-gray-600">Servicios Registrados</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/proveedores/reclamos')}>
            <div className="text-2xl font-bold text-orange-600">Ver Reclamos</div>
            <div className="text-sm text-gray-600">Gestión de Reclamos</div>
            <div className="text-xs text-blue-500 mt-1">Click para acceder →</div>
          </div>
        </div>
      )}

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => navigate('/proveedores/servicios')}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow hover:shadow-xl transition-all"
        >
          <div className="text-3xl mb-2">🔧</div>
          <div className="font-bold text-lg">Servicios</div>
          <div className="text-sm opacity-90">Ver todos los servicios</div>
        </button>

        <button
          onClick={() => navigate('/proveedores/equipos')}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-lg shadow hover:shadow-xl transition-all"
        >
          <div className="text-3xl mb-2">💻</div>
          <div className="font-bold text-lg">Equipos</div>
          <div className="text-sm opacity-90">Gestionar equipos</div>
        </button>

        <button
          onClick={() => navigate('/proveedores/ejecutivos')}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-6 rounded-lg shadow hover:shadow-xl transition-all"
        >
          <div className="text-3xl mb-2">👔</div>
          <div className="font-bold text-lg">Ejecutivos</div>
          <div className="text-sm opacity-90">Ejecutivos de cuentas</div>
        </button>

        <button
          onClick={() => navigate('/proveedores/tipos-servicio')}
          className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-lg shadow hover:shadow-xl transition-all"
        >
          <div className="text-3xl mb-2">📋</div>
          <div className="font-bold text-lg">Tipos</div>
          <div className="text-sm opacity-90">Tipos de servicio</div>
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleBuscar} className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar proveedores por nombre o email..."
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
          {canCreate('proveedores') && (
            <button
              type="button"
              onClick={() => navigate('/proveedores/nuevo')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              + Nuevo Proveedor
            </button>
          )}
        </form>
      </div>

      {/* Grid de Proveedores */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando proveedores...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border-l-4 border-red-600 rounded-lg">
          <p className="text-red-800 font-medium">Error al cargar proveedores</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      ) : proveedores.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron proveedores</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {proveedores.map((proveedor) => (
              <div
                key={proveedor.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100"
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                  <h3 className="text-xl font-bold">{proveedor.empresa}</h3>
                  <p className="text-blue-100 text-sm mt-1">{proveedor.ejecutivos?.length || 0} ejecutivo(s)</p>
                </div>

                <div className="p-4 space-y-3">
                  {proveedor.email && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                      <p className="text-gray-700 text-sm">{proveedor.email}</p>
                    </div>
                  )}

                  {proveedor.telefono && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Teléfono</p>
                      <p className="text-gray-700 text-sm">{proveedor.telefono}</p>
                    </div>
                  )}

                  {proveedor.direccion && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Dirección</p>
                      <p className="text-gray-700 text-sm">{proveedor.direccion}</p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      proveedor.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {proveedor.activo ? '✓ Activo' : '✗ Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 flex gap-2 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/proveedores/${proveedor.id}`)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => navigate(`/proveedores/${proveedor.id}/editar`)}
                    disabled={!canUpdate('proveedores')}
                    className={`flex-1 px-3 py-2 rounded transition-colors text-sm font-medium ${
                      canUpdate('proveedores')
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                    title={!canUpdate('proveedores') ? 'No tienes permiso para editar proveedores' : ''}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarProveedor(proveedor)}
                    disabled={!canDelete('proveedores')}
                    className={`flex-1 px-3 py-2 rounded transition-colors text-sm font-medium ${
                      canDelete('proveedores')
                        ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                    title={!canDelete('proveedores') ? 'No tienes permiso para eliminar proveedores' : ''}
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
