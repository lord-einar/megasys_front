import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { remitosAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { useListData } from '../hooks/useListData'
import { usePermissionError } from '../hooks/usePermissionError'
import { getPaginationNumbers, getRecordRange } from '../utils/paginationHelper'

function RemitoListPage() {
  const navigate = useNavigate()
  const { canCreate } = usePermissions()

  // Hook para manejar errores de permisos
  usePermissionError()

  // Estados de filtros específicos
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [esPrestamoFiltro, setEsPrestamoFiltro] = useState('')

  // Hook para manejar listado con paginación
  const {
    data: remitos,
    loading,
    error,
    page,
    totalPages,
    totalRecords,
    updateFilters,
    previousPage,
    nextPage,
    goToPage
  } = useListData(remitosAPI.list, {
    initialLimit: 10,
    initialFilters: { estado: '', es_prestamo: '' }
  })

  const handleFilterChange = (e) => {
    const { name, value } = e.target

    if (name === 'estado') {
      setEstadoFiltro(value)
      updateFilters({ estado: value })
    } else if (name === 'es_prestamo') {
      setEsPrestamoFiltro(value)
      updateFilters({ es_prestamo: value })
    }
  }

  const getEstadoBadgeClass = (estado) => {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border'
    switch (estado) {
      case 'borrador':
        return `${baseClass} bg-amber-50 text-amber-700 border-amber-100`
      case 'en_transito':
        return `${baseClass} bg-blue-50 text-blue-700 border-blue-100`
      case 'entregado':
        return `${baseClass} bg-emerald-50 text-emerald-700 border-emerald-100`
      case 'devuelto':
        return `${baseClass} bg-violet-50 text-violet-700 border-violet-100`
      case 'cancelado':
        return `${baseClass} bg-rose-50 text-rose-700 border-rose-100`
      default:
        return `${baseClass} bg-surface-100 text-surface-600 border-surface-200`
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

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Gestión de Remitos</h1>
          <p className="text-surface-500 mt-1 font-medium">Administra envíos y préstamos de equipos</p>
        </div>

        <button
          onClick={() => navigate('/remitos/crear')}
          disabled={!canCreate('remitos')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary-900/10 transition-all ${canCreate('remitos')
              ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-900/20'
              : 'bg-surface-200 text-surface-400 cursor-not-allowed'
            }`}
          title={!canCreate('remitos') ? 'No tienes permiso para crear remitos' : ''}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Remito
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card-base p-6 mb-8 bg-white border border-surface-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-surface-500 mb-1.5 uppercase tracking-wide">
              Estado
            </label>
            <div className="relative">
              <select
                name="estado"
                value={estadoFiltro}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none text-surface-900"
              >
                <option value="">Todos los estados</option>
                <option value="borrador">Borrador</option>
                <option value="en_transito">En Tránsito</option>
                <option value="entregado">Entregado</option>
                <option value="devuelto">Devuelto</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-surface-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-bold text-surface-500 mb-1.5 uppercase tracking-wide">
              Tipo de Operación
            </label>
            <div className="relative">
              <select
                name="es_prestamo"
                value={esPrestamoFiltro}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none text-surface-900"
              >
                <option value="">Todos</option>
                <option value="true">Préstamos</option>
                <option value="false">Transferencias</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-surface-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setEstadoFiltro('')
                setEsPrestamoFiltro('')
                updateFilters({ estado: '', es_prestamo: '' })
              }}
              className="px-4 py-2.5 bg-white border border-surface-200 text-surface-600 rounded-xl hover:bg-surface-50 hover:text-surface-900 transition-colors font-medium text-sm flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-base bg-white border border-surface-200 shadow-sm overflow-hidden">
        {loading && remitos.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
            <p className="text-surface-500 font-medium">Cargando remitos...</p>
          </div>
        ) : remitos.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4 text-surface-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-surface-900 font-medium text-lg">No hay remitos para mostrar</p>
            <p className="text-surface-500 text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Devolución
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Solicitante
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {remitos.map(remito => (
                  <tr key={remito.id} className="hover:bg-surface-50/60 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-surface-900 font-mono text-sm shadow-sm px-1.5 py-0.5 rounded bg-surface-100 border border-surface-200">
                        {remito.numero_remito}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600 font-medium">
                      {new Date(remito.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getEstadoBadgeClass(remito.estado)}>
                        {getEstadoLabel(remito.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600">
                      {remito.es_prestamo ? (
                        <div className="flex items-center gap-1.5 text-violet-700 bg-violet-50 px-2 py-1 rounded-md text-xs font-bold w-fit">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Préstamo
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-surface-600 bg-surface-100 px-2 py-1 rounded-md text-xs font-bold w-fit">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                          Transferencia
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-surface-600 text-sm">
                      {remito.es_prestamo && remito.fecha_devolucion_estimada ? (
                        <span className="font-medium text-surface-900">
                          {new Date(remito.fecha_devolucion_estimada).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                        </span>
                      ) : (
                        <span className="text-surface-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600 font-medium">
                      {remito.solicitante ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-surface-100 flex items-center justify-center text-[10px] font-bold text-surface-500">
                            {remito.solicitante.nombre?.[0]}{remito.solicitante.apellido?.[0]}
                          </div>
                          {remito.solicitante.nombre} {remito.solicitante.apellido}
                        </div>
                      ) : (
                        <span className="text-surface-400 italic">No especificado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => navigate(`/remitos/${remito.id}`)}
                        className="text-surface-500 hover:text-primary-600 transition-colors p-1.5 hover:bg-primary-50 rounded-lg group"
                        title="Ver Detalles"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
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
      {!loading && remitos.length > 0 && (
        <div className="px-6 py-4 border-t border-surface-200 bg-surface-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-surface-500">
            Mostrando <span className="font-bold text-surface-900">{getRecordRange(page, 10, totalRecords).start}</span> a <span className="font-bold text-surface-900">{getRecordRange(page, 10, totalRecords).end}</span> de <span className="font-bold text-surface-900">{totalRecords}</span> registros
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={previousPage}
              disabled={page === 1}
              className="p-2 border border-surface-200 rounded-lg bg-white text-surface-500 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <div className="flex gap-1">
              {getPaginationNumbers(page, totalPages).map((num, i) =>
                num === '...' ? (
                  <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-surface-500">...</span>
                ) : (
                  <button
                    key={num}
                    onClick={() => goToPage(num)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${num === page
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
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
              className="p-2 border border-surface-200 rounded-lg bg-white text-surface-500 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RemitoListPage
