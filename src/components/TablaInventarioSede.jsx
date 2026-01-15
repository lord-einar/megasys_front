import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TablaInventarioSede({ articulos = [], loading = false }) {
  const navigate = useNavigate()
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [busqueda, setBusqueda] = useState('')

  // Filtrar artículos
  const articulosFiltrados = articulos.filter(art => {
    const cumpleFiltro = filtroEstado === 'todos' || art.estado === filtroEstado
    const cumpleBusqueda = busqueda === '' ||
      art.marca?.toLowerCase().includes(busqueda.toLowerCase()) ||
      art.modelo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      art.numero_serie?.toLowerCase().includes(busqueda.toLowerCase()) ||
      art.tipoArticulo?.nombre?.toLowerCase().includes(busqueda.toLowerCase())

    return cumpleFiltro && cumpleBusqueda
  })

  // Función para obtener color del badge de estado
  const getEstadoBadgeColor = (estado) => {
    const colores = {
      disponible: 'bg-green-100 text-green-800',
      en_uso: 'bg-blue-100 text-blue-800',
      en_prestamo: 'bg-purple-100 text-purple-800',
      mantenimiento: 'bg-yellow-100 text-yellow-800',
      dado_de_baja: 'bg-red-100 text-red-800'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800'
  }

  // Función para obtener etiqueta del estado
  const getEstadoLabel = (estado) => {
    const labels = {
      disponible: 'Disponible',
      en_uso: 'En Uso',
      en_prestamo: 'En Préstamo',
      mantenimiento: 'Mantenimiento',
      dado_de_baja: 'Dado de Baja'
    }
    return labels[estado] || estado
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando artículos...</p>
        </div>
      </div>
    )
  }

  if (articulos.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-gray-600 text-lg">No hay artículos en esta sede</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar artículo
            </label>
            <input
              type="text"
              placeholder="Marca, modelo, serie..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro de estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="en_uso">En Uso</option>
              <option value="en_prestamo">En Préstamo</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="dado_de_baja">Dado de Baja</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="text-sm text-gray-600">
          Mostrando {articulosFiltrados.length} de {articulos.length} artículos
        </div>
      </div>

      {/* Tabla de artículos */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Tipo de Artículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Marca / Modelo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Serie / TAG
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Fecha Adquisición
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {articulosFiltrados.map((articulo, idx) => (
                <tr key={articulo.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="font-medium text-gray-900">
                      {articulo.tipoArticulo?.nombre || 'Sin especificar'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="text-gray-900 font-medium">{articulo.marca}</div>
                    <div className="text-gray-600 text-xs">{articulo.modelo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {articulo.numero_serie ? `S/N: ${articulo.numero_serie}` : '-'}
                    {articulo.service_tag && (
                      <div className="text-xs text-gray-500">TAG: {articulo.service_tag}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getEstadoBadgeColor(articulo.estado)}`}>
                      {getEstadoLabel(articulo.estado)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {articulo.fecha_adquisicion
                      ? new Date(articulo.fecha_adquisicion).toLocaleDateString('es-AR')
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => navigate(`/inventario/${articulo.id}`)}
                      className="text-blue-600 hover:text-blue-900 hover:underline transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {articulosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No se encontraron artículos que coincidan con los filtros</p>
          </div>
        )}
      </div>
    </div>
  )
}
