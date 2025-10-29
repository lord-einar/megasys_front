import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { remitosAPI } from '../services/api'
import Swal from 'sweetalert2'

function RemitoDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [remito, setRemito] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [changingState, setChangingState] = useState(false)
  const [newState, setNewState] = useState('')
  const [selectedDetalles, setSelectedDetalles] = useState([])
  const [showDevolucionModal, setShowDevolucionModal] = useState(false)
  const [devolviendoArticulos, setDevolviendoArticulos] = useState(false)

  useEffect(() => {
    cargarDetalle()
  }, [id])

  const cargarDetalle = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await remitosAPI.getById(id)
      setRemito(response.data)
    } catch (err) {
      console.error('Error cargando remito:', err)
      setError(err.message || 'Error al cargar remito')
      Swal.fire('Error', err.message || 'No se pudo cargar el remito', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadgeClass = (estado) => {
    const baseClass = 'px-3 py-1 rounded-full text-sm font-medium'
    switch (estado) {
      case 'preparado':
        return `${baseClass} bg-yellow-100 text-yellow-800`
      case 'en_transito':
        return `${baseClass} bg-blue-100 text-blue-800`
      case 'entregado':
        return `${baseClass} bg-green-100 text-green-800`
      case 'confirmado':
        return `${baseClass} bg-purple-100 text-purple-800`
      default:
        return baseClass
    }
  }

  const getEstadoLabel = (estado) => {
    const labels = {
      preparado: 'Preparado',
      en_transito: 'En Tránsito',
      entregado: 'Entregado',
      confirmado: 'Confirmado'
    }
    return labels[estado] || estado
  }

  const getTransicionesValidas = () => {
    if (!remito) return []
    const transiciones = {
      'preparado': ['en_transito'],
      'en_transito': ['entregado'],
      'entregado': ['confirmado'],
      'confirmado': []
    }
    return transiciones[remito.estado] || []
  }

  const handleCambiarEstado = async () => {
    if (!newState) {
      Swal.fire('Error', 'Selecciona un nuevo estado', 'error')
      return
    }

    try {
      setChangingState(true)
      await remitosAPI.cambiarEstado(id, newState)
      Swal.fire('Éxito', 'Estado del remito actualizado correctamente', 'success')
      setNewState('')
      await cargarDetalle()
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al cambiar el estado', 'error')
    } finally {
      setChangingState(false)
    }
  }

  const handleSeleccionarDetalle = (detalleId) => {
    if (selectedDetalles.includes(detalleId)) {
      setSelectedDetalles(selectedDetalles.filter(id => id !== detalleId))
    } else {
      setSelectedDetalles([...selectedDetalles, detalleId])
    }
  }

  const handleGenerarDevolucion = async () => {
    if (selectedDetalles.length === 0) {
      Swal.fire('Error', 'Selecciona al menos un artículo para devolver', 'error')
      return
    }

    try {
      setDevolviendoArticulos(true)
      const response = await remitosAPI.devolver(id, selectedDetalles)

      const remitoDevolucion = response.data
      Swal.fire({
        title: 'Éxito',
        html: `Remito de devolución <strong>${remitoDevolucion.numero_remito}</strong> creado correctamente`,
        icon: 'success'
      })

      setShowDevolucionModal(false)
      setSelectedDetalles([])
      await cargarDetalle()
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al generar remito de devolución', 'error')
    } finally {
      setDevolviendoArticulos(false)
    }
  }

  const canGenerarDevolucion = () => {
    if (!remito) return false
    // Solo se pueden devolver artículos de remitos en estado 'en_transito'
    return remito.estado === 'en_transito' && remito.es_prestamo
  }

  const getPrestamosNoDevueltos = () => {
    if (!remito || !remito.detalles) return []
    return remito.detalles.filter(d => d.es_prestamo && !d.devuelto)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando remito...</p>
        </div>
      </div>
    )
  }

  if (error || !remito) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'El remito no existe'}
        </div>
        <button
          onClick={() => navigate('/remitos')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Volver a Lista
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Remito {remito.numero_remito}
          </h1>
          <span className={`inline-block mt-2 ${getEstadoBadgeClass(remito.estado)}`}>
            {getEstadoLabel(remito.estado)}
          </span>
        </div>
        <button
          onClick={() => navigate('/remitos')}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
        >
          Volver
        </button>
      </div>

      {/* Información General */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Información General</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Número Remito</p>
            <p className="text-lg font-semibold text-gray-900">{remito.numero_remito}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">Fecha</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(remito.fecha).toLocaleDateString('es-AR')}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">Tipo</p>
            <p className="text-lg font-semibold">
              {remito.es_prestamo ? (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                  Préstamo
                </span>
              ) : (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                  Transferencia
                </span>
              )}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">Cantidad Artículos</p>
            <p className="text-lg font-semibold text-gray-900">{remito.detalles?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Personal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Solicitante</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Nombre:</span> {remito.solicitante?.nombre} {remito.solicitante?.apellido}</p>
            <p><span className="font-medium">Email:</span> {remito.solicitante?.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Técnico Asignado</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Nombre:</span> {remito.tecnicoAsignado?.nombre} {remito.tecnicoAsignado?.apellido}</p>
            <p><span className="font-medium">Email:</span> {remito.tecnicoAsignado?.email}</p>
          </div>
        </div>
      </div>

      {/* Sedes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Sede de Origen</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Nombre:</span> {remito.sedeOrigen?.nombre_sede}</p>
            <p><span className="font-medium">Localidad:</span> {remito.sedeOrigen?.localidad}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Sede de Destino</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Nombre:</span> {remito.sedeDestino?.nombre_sede}</p>
            <p><span className="font-medium">Localidad:</span> {remito.sedeDestino?.localidad}</p>
          </div>
        </div>
      </div>

      {/* Artículos */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Artículos ({remito.detalles?.length || 0})</h2>
        </div>

        {remito.detalles && remito.detalles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Marca/Modelo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Serie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Préstamo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Fecha Devolución</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Devuelto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {remito.detalles.map(detalle => (
                  <tr key={detalle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {detalle.inventarioDetalle?.marca} {detalle.inventarioDetalle?.modelo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {detalle.inventarioDetalle?.numero_serie || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {detalle.inventarioDetalle?.tipoArticulo?.nombre || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {detalle.es_prestamo ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Sí</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {detalle.es_prestamo && detalle.fecha_devolucion ? (
                        new Date(detalle.fecha_devolucion).toLocaleDateString('es-AR')
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {detalle.devuelto ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Devuelto</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">No hay artículos en este remito</div>
        )}
      </div>

      {/* Cambiar Estado */}
      {getTransicionesValidas().length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Cambiar Estado</h2>
          <div className="flex gap-4">
            <select
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar nuevo estado...</option>
              {getTransicionesValidas().map(estado => (
                <option key={estado} value={estado}>
                  {getEstadoLabel(estado)}
                </option>
              ))}
            </select>
            <button
              onClick={handleCambiarEstado}
              disabled={!newState || changingState}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded transition-colors"
            >
              {changingState ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      )}

      {/* Generar Devolución */}
      {canGenerarDevolucion() && getPrestamosNoDevueltos().length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Devolver Artículos Préstamo</h2>
          <p className="text-gray-600 mb-4">
            Tienes {getPrestamosNoDevueltos().length} artículos no devueltos para este remito de préstamo
          </p>
          <button
            onClick={() => setShowDevolucionModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded transition-colors"
          >
            Generar Remito de Devolución
          </button>
        </div>
      )}

      {/* Modal de Devolución */}
      {showDevolucionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Seleccionar Artículos para Devolver</h3>

            <div className="space-y-3 mb-6">
              {getPrestamosNoDevueltos().map(detalle => (
                <label key={detalle.id} className="flex items-center p-3 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDetalles.includes(detalle.id)}
                    onChange={() => handleSeleccionarDetalle(detalle.id)}
                    className="mr-3"
                  />
                  <span className="flex-1">
                    <p className="font-medium">{detalle.inventarioDetalle?.marca} {detalle.inventarioDetalle?.modelo}</p>
                    <p className="text-sm text-gray-600">
                      Devolución esperada: {new Date(detalle.fecha_devolucion).toLocaleDateString('es-AR')}
                    </p>
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDevolucionModal(false)
                  setSelectedDetalles([])
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerarDevolucion}
                disabled={selectedDetalles.length === 0 || devolviendoArticulos}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                {devolviendoArticulos ? 'Generando...' : 'Generar Devolución'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RemitoDetailPage
