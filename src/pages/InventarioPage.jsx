import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { inventarioAPI } from '../services/api'
import Swal from 'sweetalert2'
import { usePermissions } from '../hooks/usePermissions'

export default function InventarioPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [inventario, setInventario] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [estado, setEstado] = useState(searchParams.get('estado') || '')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const { canCreate, canUpdate, canDelete } = usePermissions()

  useEffect(() => {
    // Update estado when URL query params change
    const estadoParam = searchParams.get('estado')
    if (estadoParam) {
      setEstado(estadoParam)
      setPage(1)
    }
  }, [searchParams])

  useEffect(() => {
    cargarInventario()
    cargarEstadisticas()
  }, [page, estado])

  // Mostrar mensaje de error si fue redirigido por falta de permisos
  useEffect(() => {
    if (location.state?.error) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: location.state.error,
        confirmButtonColor: '#3b82f6'
      })
      // Limpiar el state para que no se muestre de nuevo
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate, location.pathname])

  const cargarInventario = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = { page, limit, search: filtro }
      if (estado) params.estado = estado
      const response = await inventarioAPI.list(params)

      // El backend devuelve { success, data: { rows, pagination } }
      const datos = response?.data?.rows || response?.rows || response?.data || response || []
      setInventario(Array.isArray(datos) ? datos : [])

      // Calcular paginación desde la respuesta
      if (response?.data?.pagination) {
        setTotalRecords(response.data.pagination.total || 0)
        setTotalPages(Math.ceil(response.data.pagination.total / limit) || 1)
      } else if (response?.pagination) {
        setTotalRecords(response.pagination.total || 0)
        setTotalPages(Math.ceil(response.pagination.total / limit) || 1)
      } else if (response?.meta) {
        setTotalRecords(response.meta.total || 0)
        setTotalPages(response.meta.pages || 1)
      }
    } catch (err) {
      setError(err.message)
      console.error('Error cargando inventario:', err)
    } finally {
      setLoading(false)
    }
  }

  const cargarEstadisticas = async () => {
    try {
      const response = await inventarioAPI.getEstadisticas()
      const datos = response?.data || response
      setEstadisticas(datos)
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  const getPaginacionNumeros = () => {
    const numeros = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        numeros.push(i)
      }
    } else {
      numeros.push(1)

      if (page > 3) numeros.push('...')

      const inicio = Math.max(2, page - 1)
      const fin = Math.min(totalPages - 1, page + 1)
      for (let i = inicio; i <= fin; i++) {
        if (!numeros.includes(i)) numeros.push(i)
      }

      if (page < totalPages - 2) numeros.push('...')

      if (!numeros.includes(totalPages)) {
        numeros.push(totalPages)
      }
    }

    return numeros
  }

  const handleBuscar = (e) => {
    e.preventDefault()
    setPage(1)
    cargarInventario()
  }

  const eliminarItem = async (item) => {
    const result = await Swal.fire({
      title: 'Confirmar eliminación',
      html: `¿Está seguro de que desea dar de baja <strong>${item.descripcionCompleta}</strong>?<br/><br/><span style="color: #ef4444; font-size: 0.875rem;">Esta acción no puede ser deshecha.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, dar de baja',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await inventarioAPI.delete(item.id)
        Swal.fire({
          title: 'Eliminado',
          text: 'El item ha sido dado de baja correctamente.',
          icon: 'success',
          timer: 1500,
          timerProgressBar: true
        }).then(() => {
          cargarInventario()
        })
      } catch (err) {
        // Verificar si es un error de autenticación
        const isAuthError = err.message && err.message.includes('Token')
        Swal.fire({
          title: 'Error',
          text: err.message || 'Error al dar de baja el item.',
          icon: 'error',
          didClose: () => {
            if (isAuthError) {
              // El redirect a login ocurrirá automáticamente en api.js después de 2 segundos
            }
          }
        })
      }
    }
  }

  const estadoColor = (estado) => {
    const colores = {
      'disponible': 'bg-green-100 text-green-800',
      'en_uso': 'bg-blue-100 text-blue-800',
      'mantenimiento': 'bg-yellow-100 text-yellow-800',
      'dado_de_baja': 'bg-red-100 text-red-800',
      'en_prestamo': 'bg-purple-100 text-purple-800'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
          <p className="text-gray-600 mt-2">Administra los activos de la empresa</p>
        </div>
        <button
          onClick={() => navigate('/inventario/crear')}
          disabled={!canCreate('inventario')}
          className={`px-6 py-3 rounded-lg transition-colors font-medium ${
            canCreate('inventario')
              ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
          title={!canCreate('inventario') ? 'No tienes permiso para crear artículos' : ''}
        >
          + Nuevo Artículo
        </button>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{estadisticas.resumen?.total || 0}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{estadisticas.resumen?.disponible || 0}</div>
            <div className="text-sm text-gray-600">Disponible</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{estadisticas.resumen?.enUso || 0}</div>
            <div className="text-sm text-gray-600">En Uso</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">{estadisticas.resumen?.mantenimiento || 0}</div>
            <div className="text-sm text-gray-600">Mantenimiento</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">{estadisticas.resumen?.dadoDeBaja || 0}</div>
            <div className="text-sm text-gray-600">Dado de Baja</div>
          </div>
        </div>
      )}

      {/* Buscador y Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleBuscar} className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Buscar por marca, modelo, serial..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="flex-1 min-w-[250px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="en_uso">En Uso</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="dado_de_baja">Dado de Baja</option>
            <option value="en_prestamo">En Préstamo</option>
          </select>
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
              setEstado('')
              setPage(1)
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Limpiar
          </button>
        </form>
      </div>

      {/* Tabla de Inventario */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando inventario...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border-l-4 border-red-600">
            <p className="text-red-800 font-medium">Error al cargar inventario</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        ) : inventario.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No se encontraron items de inventario</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Marca/Modelo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Serie/TAG
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Sede
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventario.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.descripcionCompleta}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.marca} {item.modelo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono text-xs">
                      {item.numero_serie || item.service_tag || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.sedePrincipal?.nombre_sede || item.sede?.nombre_sede || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoColor(item.estado)}`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 flex">
                      <button
                        onClick={() => navigate(`/inventario/${item.id}`)}
                        className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => navigate(`/inventario/${item.id}/editar`)}
                        disabled={!canUpdate('inventario')}
                        className={`transition-colors font-medium ${
                          canUpdate('inventario')
                            ? 'text-yellow-600 hover:text-yellow-800 cursor-pointer'
                            : 'text-slate-400 cursor-not-allowed'
                        }`}
                        title={!canUpdate('inventario') ? 'No tienes permiso' : ''}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarItem(item)}
                        disabled={!canDelete('inventario')}
                        className={`transition-colors font-medium ${
                          canDelete('inventario')
                            ? 'text-red-600 hover:text-red-800 cursor-pointer'
                            : 'text-slate-400 cursor-not-allowed'
                        }`}
                        title={!canDelete('inventario') ? 'No tienes permiso' : ''}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Mostrando <strong>{(page - 1) * limit + 1}</strong> a <strong>{Math.min(page * limit, totalRecords)}</strong> de <strong>{totalRecords}</strong> registros
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Primera
            </button>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>

            {getPaginacionNumeros().map((num, idx) => (
              <button
                key={idx}
                onClick={() => typeof num === 'number' && setPage(num)}
                disabled={typeof num !== 'number'}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  num === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                } disabled:cursor-not-allowed`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Última
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
