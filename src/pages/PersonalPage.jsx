import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { personalAPI } from '../services/api'
import Swal from 'sweetalert2'
import { usePermissions } from '../hooks/usePermissions'

export default function PersonalPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [personal, setPersonal] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const { canCreate, canUpdate, canDelete } = usePermissions()

  useEffect(() => {
    cargarPersonal()
    cargarEstadisticas()
  }, [page])

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

  const cargarPersonal = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await personalAPI.list({ page, limit, search: filtro })
      const datos = response?.data || response || []
      setPersonal(Array.isArray(datos) ? datos : [])

      // Calcular paginación desde la respuesta
      if (response?.pagination) {
        setTotalRecords(response.pagination.total || 0)
        setTotalPages(Math.ceil(response.pagination.total / limit) || 1)
      } else if (response?.meta) {
        setTotalRecords(response.meta.total || 0)
        setTotalPages(response.meta.pages || 1)
      }
    } catch (err) {
      setError(err.message)
      console.error('Error cargando personal:', err)
    } finally {
      setLoading(false)
    }
  }

  const cargarEstadisticas = async () => {
    try {
      const response = await personalAPI.getEstadisticas()
      const datos = response?.data || response
      setEstadisticas(datos)
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  const handleBuscar = (e) => {
    e.preventDefault()
    setPage(1)
    cargarPersonal()
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

  const eliminarPersona = async (persona) => {
    const result = await Swal.fire({
      title: 'Confirmar eliminación',
      html: `¿Está seguro de que desea eliminar a <strong>${persona.nombre} ${persona.apellido}</strong>?<br/><br/><span style="color: #ef4444; font-size: 0.875rem;">Esta acción no puede ser deshecha.</span>`,
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
              await personalAPI.delete(persona.id)
              await Swal.fire({
                title: '¡Eliminado!',
                text: 'El personal ha sido eliminado correctamente.',
                icon: 'success',
                confirmButtonColor: '#3b82f6'
              })
              cargarPersonal()
            } catch (err) {
              console.error('Error eliminando personal:', err)
              await Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el personal: ' + (err.message || 'Error desconocido'),
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
    <div className="p-6">
      {/* Encabezado */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Personal</h1>
          <p className="text-gray-600 mt-2">Administra el personal de la empresa</p>
        </div>
        <button
          onClick={() => navigate('/personal/crear')}
          disabled={!canCreate('personal')}
          className={`px-6 py-2 rounded-lg transition-colors font-medium ${
            canCreate('personal')
              ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
          title={!canCreate('personal') ? 'No tienes permiso para crear personal' : ''}
        >
          + Nuevo Personal
        </button>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 border-l-4 border-blue-600">
            <div className="text-2xl font-bold text-blue-600">{estadisticas.totalPersonal || estadisticas.resumen?.totalPersonal || 0}</div>
            <div className="text-sm text-gray-700">Personal Total</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6 border-l-4 border-green-600">
            <div className="text-2xl font-bold text-green-600">{estadisticas.totalSedesUnicas || estadisticas.resumen?.totalSedes || 0}</div>
            <div className="text-sm text-gray-700">Sedes Asignadas</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6 border-l-4 border-purple-600">
            <div className="text-2xl font-bold text-purple-600">{estadisticas.totalRolesUnicos || estadisticas.resumen?.totalRoles || 0}</div>
            <div className="text-sm text-gray-700">Roles Diferentes</div>
          </div>
        </div>
      )}

      {/* Buscador y Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleBuscar} className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar personal por nombre, email, teléfono..."
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
              setPage(1)
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Limpiar
          </button>
        </form>
      </div>

      {/* Tabla de Personal */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando personal...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border-l-4 border-red-600">
            <p className="text-red-800 font-medium">Error al cargar personal</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        ) : personal.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No se encontró personal</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Sede
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Remitos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {personal.map((persona) => (
                  <tr key={persona.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {persona.nombre} {persona.apellido}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {persona.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {persona.telefono || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {persona.sede?.nombre_sede || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {persona.rol?.nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {persona.estadisticas?.remitosSolicitados || 0} solicitados
                      <br />
                      {persona.estadisticas?.remitosAsignados || 0} asignados
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => navigate(`/personal/${persona.id}`)}
                        className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => navigate(`/personal/${persona.id}/editar`)}
                        disabled={!canUpdate('personal')}
                        className={`transition-colors font-medium ${
                          canUpdate('personal')
                            ? 'text-yellow-600 hover:text-yellow-800 cursor-pointer'
                            : 'text-slate-400 cursor-not-allowed'
                        }`}
                        title={!canUpdate('personal') ? 'No tienes permiso' : ''}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarPersona(persona)}
                        disabled={!canDelete('personal')}
                        className={`transition-colors font-medium ${
                          canDelete('personal')
                            ? 'text-red-600 hover:text-red-800 cursor-pointer'
                            : 'text-slate-400 cursor-not-allowed'
                        }`}
                        title={!canDelete('personal') ? 'No tienes permiso' : ''}
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
      {!loading && personal.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-medium">{(page - 1) * limit + 1}</span> a{' '}
            <span className="font-medium">{Math.min(page * limit, totalRecords)}</span> de{' '}
            <span className="font-medium">{totalRecords}</span> registros
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>

            <div className="flex gap-1">
              {getPaginacionNumeros().map((num, i) =>
                num === '...' ? (
                  <span key={`dots-${i}`} className="px-2 py-2 text-gray-600">
                    ...
                  </span>
                ) : (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      page === num
                        ? 'bg-blue-600 text-white font-medium'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {num}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
