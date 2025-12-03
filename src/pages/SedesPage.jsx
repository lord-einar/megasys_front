import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sedesAPI, empresasAPI } from '../services/api'
import Swal from 'sweetalert2'

export default function SedesPage() {
  const navigate = useNavigate()
  const [sedes, setSedes] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(9)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    cargarEmpresas()
    cargarSedes()
    cargarEstadisticas()
  }, [page, empresaSeleccionada])

  const cargarEmpresas = async () => {
    try {
      const response = await empresasAPI.getActivas()
      const empresasArray = response?.data || response || []
      setEmpresas(Array.isArray(empresasArray) ? empresasArray : [])
    } catch (err) {
      console.error('Error cargando empresas:', err)
      setEmpresas([])
    }
  }

  const cargarSedes = async () => {
    try {
      setLoading(true)
      setError(null)

      // Construir parámetros de la consulta incluyendo empresa_id si está seleccionada
      const params = { page, limit, search: filtro }
      if (empresaSeleccionada) {
        params.empresa_id = empresaSeleccionada
      }

      const data = await sedesAPI.list(params)
      const sedesFiltradas = data.data || []

      setSedes(sedesFiltradas)

      // Calcular total de páginas basado en la respuesta
      const total = data.pagination?.total || data.total || 0
      const calculatedPages = Math.max(1, Math.ceil(total / limit))
      setTotalPages(calculatedPages)
    } catch (err) {
      setError(err.message)
      console.error('Error cargando sedes:', err)
    } finally {
      setLoading(false)
    }
  }

  const cargarEstadisticas = async () => {
    try {
      const response = await sedesAPI.getEstadisticas()
      const estadisticasData = response?.data || response
      setEstadisticas(estadisticasData)
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  const handleBuscar = (e) => {
    e.preventDefault()
    setPage(1)
    cargarSedes()
  }

  const cambiarEmpresa = (empresaId) => {
    setEmpresaSeleccionada(empresaId === empresaSeleccionada ? null : empresaId)
    setPage(1)
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
              cargarSedes()
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
    <div className="page-container">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="page-title">Gestión de Sedes</h1>
        <p className="page-subtitle">Administra todas las sedes de la empresa</p>
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
      <div className="card p-6 mb-8">
        <form onSubmit={handleBuscar} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar sedes por nombre, localidad..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="input flex-1"
            />
            <button
              type="submit"
              className="btn btn-primary"
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={() => {
                setFiltro('')
                setPage(1)
              }}
              className="btn btn-secondary"
            >
              Limpiar
            </button>
          </div>

          {/* Toggle de Empresas */}
          <div className="border-t border-slate-200 pt-4">
            <p className="text-sm font-medium text-slate-700 mb-3">Filtrar por empresa:</p>
            <div className="flex gap-3 flex-wrap">
              {empresas.map((empresa) => (
                <button
                  key={empresa.id}
                  type="button"
                  onClick={() => cambiarEmpresa(empresa.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    empresaSeleccionada === empresa.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
            <p className="mt-4 text-slate-600">Cargando sedes...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border-l-4 border-red-600 rounded-lg">
          <p className="text-red-800 font-medium">Error al cargar sedes</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      ) : sedes.length === 0 ? (
        <div className="card p-12">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-slate-500 text-lg mt-4">No se encontraron sedes</p>
            <p className="text-slate-400 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sedes.map((sede) => (
              <div
                key={sede.id}
                className="card card-hover overflow-hidden"
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
                    <p className="text-xs text-slate-500 uppercase font-semibold">Ubicación</p>
                    <p className="text-slate-700 font-medium">{sede.localidad}, {sede.provincia}</p>
                    <p className="text-slate-600 text-sm">{sede.direccion}</p>
                  </div>

                  {/* Detalles */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Personal</p>
                      <p className="text-2xl font-bold text-blue-600">{sede.estadisticas?.totalPersonal || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Inventario</p>
                      <p className="text-2xl font-bold text-emerald-600">{sede.estadisticas?.totalInventario || 0}</p>
                    </div>
                  </div>

                  {/* Contacto */}
                  {(sede.telefono || sede.ip_sede) && (
                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      {sede.telefono && (
                        <div className="flex items-center text-sm text-slate-600">
                          <span className="font-semibold mr-2">Tel:</span>
                          {sede.telefono}
                        </div>
                      )}
                      {sede.ip_sede && (
                        <div className="flex items-center text-sm text-slate-600">
                          <span className="font-semibold mr-2">IP:</span>
                          {sede.ip_sede}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Estado */}
                  <div className="pt-3 border-t border-slate-200">
                    <span className={`badge ${
                      sede.activo ? 'badge-success' : 'badge-danger'
                    }`}>
                      {sede.activo ? '✓ Activa' : '✗ Inactiva'}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="bg-slate-50 px-4 py-3 flex gap-2 border-t border-slate-200">
                  <button
                    onClick={() => navigate(`/sedes/${sede.id}`)}
                    className="btn btn-primary flex-1 text-sm"
                  >
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => navigate(`/sedes/${sede.id}/editar`)}
                    className="btn btn-warning flex-1 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarSede(sede)}
                    className="btn btn-danger flex-1 text-sm"
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
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn btn-secondary"
              >
                ← Anterior
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // Mostrar solo páginas cercanas para no saturar
                  const showPage =
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)

                  if (!showPage && pageNum === page - 2) {
                    return <span key="dots-left" className="px-2 py-2 text-slate-400">...</span>
                  }
                  if (!showPage && pageNum === page + 2) {
                    return <span key="dots-right" className="px-2 py-2 text-slate-400">...</span>
                  }
                  if (!showPage) return null

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 rounded-lg font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        page === pageNum
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary"
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
