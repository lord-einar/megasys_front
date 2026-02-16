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
      disponible: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      en_uso: 'bg-blue-50 text-blue-700 border-blue-100',
      en_prestamo: 'bg-purple-50 text-purple-700 border-purple-100',
      mantenimiento: 'bg-amber-50 text-amber-700 border-amber-100',
      dado_de_baja: 'bg-rose-50 text-rose-700 border-rose-100'
    }
    return colores[estado] || 'bg-surface-100 text-surface-600 border-surface-200'
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
    return labels[estado] || estado.replace('_', ' ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600"></div>
          <p className="mt-4 text-surface-500 font-medium text-sm">Cargando inventario...</p>
        </div>
      </div>
    )
  }

  if (articulos.length === 0) {
    return (
      <div className="bg-surface-50 rounded-xl border border-dashed border-surface-200 p-12 text-center">
        <svg className="w-12 h-12 text-surface-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-surface-500 font-medium">No hay artículos registrados en esta sede</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-surface-500 mb-1.5 uppercase tracking-wide">
            Buscar artículo
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400 group-focus-within:text-primary-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Marca, modelo, serie..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400 text-surface-900"
            />
          </div>
        </div>

        <div className="w-full md:w-64">
          <label className="block text-xs font-bold text-surface-500 mb-1.5 uppercase tracking-wide">
            Estado
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-surface-900"
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

      {/* Tabla de artículos */}
      <div className="overflow-hidden rounded-xl border border-surface-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                  Artículo
                </th>
                <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                  Identificación
                </th>
                <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                  Adquisición
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-surface-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {articulosFiltrados.map((articulo) => (
                <tr key={articulo.id} className="hover:bg-surface-50/60 transition-colors bg-white">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-50 border border-surface-100 flex items-center justify-center text-surface-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-surface-900 text-sm">{articulo.tipoArticulo?.nombre || 'Artículo'}</p>
                        <p className="text-xs text-surface-500">{articulo.marca} {articulo.modelo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {articulo.numero_serie ? (
                        <p className="text-xs font-mono text-surface-600 bg-surface-100 px-1.5 py-0.5 rounded w-fit border border-surface-200">
                          SN: {articulo.numero_serie}
                        </p>
                      ) : (
                        <span className="text-xs text-surface-400 italic">Sin S/N</span>
                      )}
                      {articulo.service_tag && (
                        <p className="text-[10px] text-surface-500">TAG: {articulo.service_tag}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getEstadoBadgeColor(articulo.estado)}`}>
                      {getEstadoLabel(articulo.estado)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600">
                    {articulo.fecha_adquisicion
                      ? new Date(articulo.fecha_adquisicion).toLocaleDateString('es-AR')
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => navigate(`/inventario/${articulo.id}`)}
                      className="text-surface-500 hover:text-primary-600 font-medium text-xs hover:underline transition-colors inline-flex items-center gap-1"
                    >
                      <span>Ver detalles</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {articulosFiltrados.length === 0 && (
          <div className="text-center py-12 bg-white">
            <p className="text-surface-500 text-sm">No se encontraron artículos que coincidan con los filtros</p>
          </div>
        )}

        <div className="bg-surface-50 px-6 py-3 border-t border-surface-200">
          <p className="text-xs text-surface-500">
            Mostrando <span className="font-medium text-surface-900">{articulosFiltrados.length}</span> de <span className="font-medium text-surface-900">{articulos.length}</span> artículos
          </p>
        </div>
      </div>
    </div>
  )
}
