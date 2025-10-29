import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function RemitoListPage() {
  const [remitos, setRemitos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    estado: '',
    solicitante_id: '',
    tecnico_id: '',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchRemitos()
  }, [filters])

  const fetchRemitos = async () => {
    try {
      setLoading(true)
      const response = await api.get('/remitos', { params: filters })
      setRemitos(response.data.data || [])
      setPagination(response.data.pagination || {})
      setError(null)
    } catch (err) {
      console.error('Error fetching remitos:', err)
      setError(err.response?.data?.message || 'Error al cargar remitos')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }))
  }

  const getEstadoBadgeClass = (estado) => {
    const baseClass = 'px-3 py-1 rounded-full text-sm font-medium'
    switch (estado) {
      case 'borrador':
        return `${baseClass} bg-gray-100 text-gray-800`
      case 'en_transito':
        return `${baseClass} bg-blue-100 text-blue-800`
      case 'entregado':
        return `${baseClass} bg-green-100 text-green-800`
      case 'devuelto':
        return `${baseClass} bg-purple-100 text-purple-800`
      case 'cancelado':
        return `${baseClass} bg-red-100 text-red-800`
      default:
        return baseClass
    }
  }

  const getEstadoLabel = (estado) => {
    const labels = {
      borrador: 'Borrador',
      en_transito: 'En Tránsito',
      entregado: 'Entregado',
      devuelto: 'Devuelto',
      cancelado: 'Cancelado'
    }
    return labels[estado] || estado
  }

  if (loading && remitos.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando remitos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Remitos</h1>
        <button
          onClick={() => navigate('/remitos/crear')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          + Nuevo Remito
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              name="estado"
              value={filters.estado}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="en_transito">En Tránsito</option>
              <option value="entregado">Entregado</option>
              <option value="devuelto">Devuelto</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {remitos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay remitos para mostrar
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Solicitante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Técnico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {remitos.map(remito => (
                <tr key={remito.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {remito.numero_remito}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(remito.fecha).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getEstadoBadgeClass(remito.estado)}>
                      {getEstadoLabel(remito.estado)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {remito.solicitante?.nombre} {remito.solicitante?.apellido}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {remito.tecnico?.nombre} {remito.tecnico?.apellido}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/remitos/${remito.id}`)}
                      className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={filters.page === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-gray-600">
            Página {pagination.currentPage} de {pagination.pages}
          </span>
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
            disabled={filters.page === pagination.pages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}

export default RemitoListPage
