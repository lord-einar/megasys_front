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
      title: '¿Eliminar categoría?',
      text: `Se eliminará el tipo de servicio "${tipo.nombre}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'bg-rose-600 text-white px-4 py-2 rounded-lg',
        cancelButton: 'bg-surface-200 text-surface-700 px-4 py-2 rounded-lg ml-2'
      },
      buttonsStyling: false
    })

    if (result.isConfirmed) {
      try {
        await tiposServicioAPI.delete(tipo.id)
        await Swal.fire({
          title: 'Eliminado',
          text: 'El tipo de servicio ha sido eliminado correctamente.',
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
        reload()
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: err.message || 'No se pudo eliminar el tipo de servicio',
          icon: 'error',
          customClass: { popup: 'rounded-2xl' }
        })
      }
    }
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Tipos de Servicio</h1>
          <p className="text-surface-500 mt-1 font-medium">Categorías de clasificación de servicios</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/proveedores/servicios')}
            className="px-4 py-2.5 bg-white border border-surface-200 text-surface-700 rounded-xl font-bold text-sm hover:bg-surface-50 transition-colors shadow-sm"
          >
            Ver Servicios
          </button>
          {canCreate('proveedores') && (
            <button
              onClick={() => navigate('/proveedores/tipos-servicio/nuevo')}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-900/20 transition-all transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Tipo
            </button>
          )}
        </div>
      </div>

      {/* Buscador */}
      <div className="card-base p-4 bg-white border border-surface-200 shadow-sm mb-8">
        <form onSubmit={handleBuscar} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors shadow-lg shadow-primary-900/10"
          >
            Buscar
          </button>
          {filtro && (
            <button
              type="button"
              onClick={() => {
                setFiltro('')
                updateFilters({ search: '' })
              }}
              className="px-4 py-2.5 bg-white border border-surface-200 text-surface-600 rounded-xl hover:bg-surface-50 transition-colors font-medium text-sm"
            >
              Limpiar
            </button>
          )}
        </form>
      </div>

      {/* Grid de Tipos */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
          <p className="text-surface-500 font-medium">Cargando tipos...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-full">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <h3 className="text-rose-900 font-bold">Error de carga</h3>
            <p className="text-rose-700 text-sm">{error}</p>
          </div>
        </div>
      ) : tiposServicio.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-surface-200 border-dashed">
          <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4 text-surface-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
          </div>
          <p className="text-surface-900 font-bold text-lg">No se encontraron tipos de servicio</p>
          <p className="text-surface-500 text-sm mt-1">Intenta crear uno nuevo</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {tiposServicio.map((tipo) => (
              <div
                key={tipo.id}
                className="bg-white rounded-2xl border border-surface-200 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-surface-100 bg-surface-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-surface-900 line-clamp-1" title={tipo.nombre}>{tipo.nombre}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${tipo.activo
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                      {tipo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1">
                  {tipo.descripcion ? (
                    <div className="p-3 bg-surface-50 rounded-xl border border-surface-100">
                      <p className="text-xs text-surface-600 line-clamp-3 italic">"{tipo.descripcion}"</p>
                    </div>
                  ) : <div className="h-12 flex items-center justify-center text-surface-400 text-xs italic">Sin descripción</div>}
                </div>

                <div className="p-4 bg-surface-50 border-t border-surface-100 flex gap-2">
                  <button
                    onClick={() => navigate(`/proveedores/tipos-servicio/${tipo.id}/editar`)}
                    disabled={!canUpdate('proveedores')}
                    className={`flex-1 px-3 py-2 border rounded-lg transition-all text-xs font-bold shadow-sm flex items-center justify-center gap-2 ${canUpdate('proveedores')
                        ? 'bg-white border-surface-200 text-surface-700 hover:border-primary-300 hover:text-primary-700'
                        : 'bg-surface-100 border-surface-200 text-surface-400 cursor-not-allowed hidden'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Editar
                  </button>
                  {canDelete('proveedores') && (
                    <button
                      onClick={() => eliminarTipo(tipo)}
                      className="px-3 py-2 bg-white border border-surface-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-lg transition-colors font-bold text-xs"
                      title="Eliminar"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Paginador */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <button
                onClick={previousPage}
                disabled={page === 1}
                className="p-2 rounded-lg border border-surface-200 text-surface-500 hover:bg-white hover:text-surface-900 disabled:opacity-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>

              <div className="flex gap-1.5">
                {getPaginationNumbers(page, totalPages).map((num, i) =>
                  num === '...' ? (
                    <span key={`dots-${i}`} className="px-2 py-1 text-surface-400">...</span>
                  ) : (
                    <button
                      key={num}
                      onClick={() => goToPage(num)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${page === num
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                          : 'bg-white text-surface-600 border border-surface-200 hover:border-primary-300'
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
                className="p-2 rounded-lg border border-surface-200 text-surface-500 hover:bg-white hover:text-surface-900 disabled:opacity-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
