import { useState, useEffect } from 'react'
import { inventarioAPI } from '../services/api'

export default function InventarioPage() {
  const [inventario, setInventario] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [estado, setEstado] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  useEffect(() => {
    cargarInventario()
    cargarEstadisticas()
  }, [page])

  const cargarInventario = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = { page, limit, search: filtro }
      if (estado) params.estado = estado
      const data = await inventarioAPI.list(params)
      setInventario(data.data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error cargando inventario:', err)
    } finally {
      setLoading(false)
    }
  }

  const cargarEstadisticas = async () => {
    try {
      const data = await inventarioAPI.getEstadisticas()
      setEstadisticas(data)
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  const handleBuscar = (e) => {
    e.preventDefault()
    setPage(1)
    cargarInventario()
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
        <p className="text-gray-600 mt-2">Administra los activos de la empresa</p>
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
                    Valor
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
                      {item.sede?.nombre_sede || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoColor(item.estado)}`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      ${item.valor_adquisicion?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 transition-colors">
                        Ver
                      </button>
                      <button className="text-yellow-600 hover:text-yellow-800 transition-colors">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
