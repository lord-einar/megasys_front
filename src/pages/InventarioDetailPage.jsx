import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { inventarioAPI } from '../services/api'
import Swal from 'sweetalert2'
import { usePermissions } from '../hooks/usePermissions'

export default function InventarioDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [changingState, setChangingState] = useState(false)
  const [newState, setNewState] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const { canUpdate, canDelete } = usePermissions()

  useEffect(() => {
    cargarDetalle()
    cargarHistorial()
  }, [id])

  const cargarDetalle = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await inventarioAPI.getById(id)
      // Backend returns { success, data: {...} }
      const data = response?.data || response
      setItem(data)
    } catch (err) {
      setError(err.message || 'Error al cargar el artículo')
      Swal.fire('Error', err.message || 'No se pudo cargar el artículo', 'error')
    } finally {
      setLoading(false)
    }
  }

  const cargarHistorial = async () => {
    try {
      const response = await inventarioAPI.getHistorial(id, { limite: 100 })
      // Backend returns { success, data: {...} }
      const data = response?.data || response
      setHistorial(data?.historial || data || [])
    } catch (err) {
      console.error('Error cargando historial:', err)
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

  const handleCambiarEstado = async () => {
    if (!newState) {
      Swal.fire('Error', 'Selecciona un nuevo estado', 'error')
      return
    }

    try {
      setChangingState(true)
      await inventarioAPI.cambiarEstado(id, newState, observaciones)
      Swal.fire('Éxito', 'Estado actualizado correctamente', 'success')
      setNewState('')
      setObservaciones('')
      await cargarDetalle()
      await cargarHistorial()
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al cambiar el estado', 'error')
    } finally {
      setChangingState(false)
    }
  }

  const handleEliminar = async () => {
    const result = await Swal.fire({
      title: 'Confirmar eliminación',
      html: `¿Está seguro de que desea dar de baja este artículo?<br/><br/><span style="color: #ef4444; font-size: 0.875rem;">Esta acción no puede ser deshecha.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, dar de baja',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await inventarioAPI.delete(id)
        Swal.fire({
          title: 'Eliminado',
          text: 'El artículo ha sido dado de baja correctamente.',
          icon: 'success',
          timer: 1500,
          timerProgressBar: true
        }).then(() => {
          navigate('/inventario')
        })
      } catch (err) {
        // Verificar si es un error de autenticación
        const isAuthError = err.message && err.message.includes('Token')
        Swal.fire({
          title: 'Error',
          text: err.message || 'Error al dar de baja el artículo.',
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

  const handleEditar = () => {
    navigate(`/inventario/${id}/editar`)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatCurrency = (value) => {
    if (!value) return '$0.00'
    return `$${parseFloat(value).toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Cargando artículo...</p>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded">
          <p className="text-red-800 font-medium">Error al cargar artículo</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => navigate('/inventario')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Volver a Inventario
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{item.descripcionCompleta}</h1>
          <p className="text-gray-600 mt-2">
            {item.marca} {item.modelo}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEditar}
            disabled={!canUpdate('inventario')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              canUpdate('inventario')
                ? 'bg-yellow-600 text-white hover:bg-yellow-700 cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
            title={!canUpdate('inventario') ? 'No tienes permiso para editar' : ''}
          >
            Editar
          </button>
          <button
            onClick={handleEliminar}
            disabled={!canDelete('inventario')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              canDelete('inventario')
                ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
            title={!canDelete('inventario') ? 'No tienes permiso para dar de baja' : ''}
          >
            Dar de Baja
          </button>
          <button
            onClick={() => navigate('/inventario')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Principal */}
        <div className="lg:col-span-2">
          {/* Información General */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Información General</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Marca</p>
                <p className="text-gray-900 font-semibold">{item.marca}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Modelo</p>
                <p className="text-gray-900 font-semibold">{item.modelo}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Número de Serie</p>
                <p className="text-gray-900 font-mono text-sm">{item.numero_serie || 'N/A'}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Service Tag</p>
                <p className="text-gray-900 font-mono text-sm">{item.service_tag || 'N/A'}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Fecha de Adquisición</p>
                <p className="text-gray-900 font-semibold">{formatDate(item.fecha_adquisicion)}</p>
              </div>
            </div>

            {item.observaciones && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-600 text-sm">Observaciones</p>
                <p className="text-gray-900">{item.observaciones}</p>
              </div>
            )}
          </div>

          {/* Historial de Movimientos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de Movimientos</h2>

            {historial.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay movimientos registrados</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {historial.map((mov, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-gray-900 font-semibold">
                          {mov.tipo_movimiento || 'Movimiento'}
                        </p>
                        <p className="text-gray-600 text-sm">{formatDate(mov.fecha_movimiento || mov.created_at)}</p>
                      </div>
                      {mov.descripcion && (
                        <p className="text-gray-600 text-sm mt-1">{mov.descripcion}</p>
                      )}
                      {mov.usuario_email && (
                        <p className="text-gray-500 text-xs mt-1">Por: {mov.usuario_email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel Lateral */}
        <div>
          {/* Estado Actual */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Estado Actual</h2>

            <div className={`px-4 py-3 rounded-lg mb-4 text-center ${estadoColor(item.estado)}`}>
              <p className="font-semibold uppercase text-sm">{item.estado}</p>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-gray-600 text-sm">Sede</p>
                <p className="text-gray-900 font-semibold">{item.sedePrincipal?.nombre_sede || 'N/A'}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Tipo de Artículo</p>
                <p className="text-gray-900 font-semibold">{item.tipoArticulo?.nombre || 'N/A'}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Registrado el</p>
                <p className="text-gray-900 text-sm">{formatDate(item.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Información de Préstamo Activo */}
          {item.prestamoActivo && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg shadow p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <h2 className="text-xl font-bold text-purple-900">Préstamo Activo</h2>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded p-3">
                  <p className="text-gray-600 text-sm">En uso en</p>
                  <p className="text-purple-900 font-bold text-lg">
                    {item.prestamoActivo.sedeDestino?.nombre_sede}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {item.prestamoActivo.sedeDestino?.localidad}, {item.prestamoActivo.sedeDestino?.provincia}
                  </p>
                </div>

                <div>
                  <p className="text-gray-700 text-sm">Remito</p>
                  <p className="text-purple-900 font-semibold font-mono">
                    {item.prestamoActivo.numeroRemito}
                  </p>
                </div>

                <div>
                  <p className="text-gray-700 text-sm">Estado del remito</p>
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                    {item.prestamoActivo.estado}
                  </span>
                </div>

                {item.prestamoActivo.fechaDevolucionEsperada && (
                  <div>
                    <p className="text-gray-700 text-sm">Fecha de devolución esperada</p>
                    <p className="text-purple-900 font-semibold">
                      {formatDate(item.prestamoActivo.fechaDevolucionEsperada)}
                    </p>
                  </div>
                )}

                {item.prestamoActivo.observaciones && (
                  <div>
                    <p className="text-gray-700 text-sm">Observaciones</p>
                    <p className="text-gray-800 text-sm italic">{item.prestamoActivo.observaciones}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cambiar Estado */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cambiar Estado</h2>

            <div className="space-y-3">
              <select
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={changingState}
              >
                <option value="">Selecciona nuevo estado</option>
                <option value="disponible">Disponible</option>
                <option value="en_uso">En Uso</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="dado_de_baja">Dado de Baja</option>
                <option value="en_prestamo">En Préstamo</option>
              </select>

              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Observaciones (opcional)"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={changingState}
              />

              <button
                onClick={handleCambiarEstado}
                disabled={!newState || changingState}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {changingState ? 'Actualizando...' : 'Actualizar Estado'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
