import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tiposServicioAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { useListData } from '../hooks/useListData'
import { usePermissionError } from '../hooks/usePermissionError'
import { getPaginationNumbers } from '../utils/paginationHelper'
import Swal from 'sweetalert2'

export default function TiposServicioPage() {
  const navigate = useNavigate()
  const { canCreate, canUpdate, canDelete } = usePermissions()

  usePermissionError()

  const [filtro, setFiltro] = useState('')

  const {
    data: tiposServicio,
    loading,
    error,
    page,
    totalPages,
    updateFilters,
    goToPage,
    previousPage,
    nextPage,
    reload
  } = useListData(tiposServicioAPI.list, {
    initialLimit: 12,
    initialFilters: { search: '' }
  })

  const handleBuscar = (e) => {
    e.preventDefault()
    updateFilters({ search: filtro })
  }

  const eliminarTipo = async (tipo) => {
    const result = await Swal.fire({
      title: 'Confirmar eliminación',
      html: `¿Está seguro de que desea eliminar el tipo de servicio <strong>${tipo.nombre}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await tiposServicioAPI.delete(tipo.id)
        await Swal.fire('¡Eliminado!', 'El tipo de servicio ha sido eliminado correctamente.', 'success')
        reload()
      } catch (err) {
        Swal.fire('Error', err.message || 'No se pudo eliminar el tipo de servicio', 'error')
      }
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Tipos de Servicio</h1>
            <p className="text-gray-600 mt-2">Administra las categorías de servicios</p>
          </div>
          {canCreate('proveedores') && (
            <button
              onClick={() => navigate('/proveedores/tipos-servicio/nuevo')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Nuevo Tipo
            </button>
          )}
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleBuscar} className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar tipos de servicio..."
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
        </form>
      </div>

      {/* Grid de Tipos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border-l-4 border-red-600 rounded-lg">
          <p className="text-red-800 font-medium">Error al cargar tipos de servicio</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      ) : tiposServicio.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No se encontraron tipos de servicio</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {tiposServicio.map((tipo) => (
              <div
                key={tipo.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100"
              >
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 text-white">
                  <h3 className="text-xl font-bold">{tipo.nombre}</h3>
                </div>

                <div className="p-4 space-y-3">
                  {tipo.descripcion && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Descripción</p>
                      <p className="text-gray-700 text-sm">{tipo.descripcion}</p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      tipo.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tipo.activo ? '✓ Activo' : '✗ Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 flex gap-2 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/proveedores/tipos-servicio/${tipo.id}/editar`)}
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
                    onClick={() => eliminarTipo(tipo)}
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
