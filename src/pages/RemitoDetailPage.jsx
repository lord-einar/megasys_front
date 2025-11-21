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
  const [editingLoanId, setEditingLoanId] = useState(null)
  const [editingDate, setEditingDate] = useState('')
  const [markingReturned, setMarkingReturned] = useState(false)
  const [reenviandoEmails, setReenviandoEmails] = useState(false)
  const [showReceptorModal, setShowReceptorModal] = useState(false)
  const [receptorNombre, setReceptorNombre] = useState('')
  const [receptorEmail, setReceptorEmail] = useState('')
  const [asignandoReceptor, setAsignandoReceptor] = useState(false)

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
      case 'completado':
        return `${baseClass} bg-purple-100 text-purple-800`
      case 'devuelto':
        return `${baseClass} bg-indigo-100 text-indigo-800`
      case 'cancelado':
        return `${baseClass} bg-red-100 text-red-800`
      default:
        return baseClass
    }
  }

  const getEstadoLabel = (estado) => {
    const labels = {
      preparado: 'Preparado',
      en_transito: 'En Tránsito',
      entregado: 'Entregado',
      completado: 'Completado',
      devuelto: 'Devuelto',
      cancelado: 'Cancelado'
    }
    return labels[estado] || estado
  }

  const getTransicionesValidas = () => {
    if (!remito) return []
    const transiciones = {
      'preparado': ['en_transito', 'cancelado'],
      'en_transito': ['entregado', 'cancelado'],
      'entregado': ['completado', 'devuelto', 'cancelado'],
      'completado': ['devuelto'],
      'devuelto': [],
      'cancelado': []
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

  const handleEditarFecha = (detalle) => {
    setEditingLoanId(detalle.id)
    setEditingDate(detalle.fecha_devolucion_esperada?.split('T')[0] || '')
  }

  const handleGuardarFecha = async () => {
    if (!editingDate) {
      Swal.fire('Error', 'Por favor selecciona una fecha', 'error')
      return
    }

    try {
      setMarkingReturned(true)
      await remitosAPI.actualizarFechaDevolucion(id, editingLoanId, editingDate)
      Swal.fire('Éxito', 'Fecha de devolución actualizada', 'success')
      setEditingLoanId(null)
      setEditingDate('')
      await cargarDetalle()
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al actualizar la fecha', 'error')
    } finally {
      setMarkingReturned(false)
    }
  }

  const handleMarcarDevuelto = async (detalleId) => {
    const confirm = await Swal.fire({
      title: '¿Marcar como devuelto?',
      text: 'Esta acción marcará el artículo como devuelto',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, devolver',
      cancelButtonText: 'Cancelar'
    })

    if (!confirm.isConfirmed) return

    try {
      setMarkingReturned(true)
      // Usar el endpoint de devolver con solo este detalle
      await remitosAPI.devolver(id, [detalleId])
      Swal.fire('Éxito', 'Artículo marcado como devuelto', 'success')
      await cargarDetalle()
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al marcar como devuelto', 'error')
    } finally {
      setMarkingReturned(false)
    }
  }

  const handleReenviarEmails = async () => {
    const confirm = await Swal.fire({
      title: '¿Reenviar emails?',
      text: 'Se reenviará el remito a infraestructura y al solicitante',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, reenviar',
      cancelButtonText: 'Cancelar'
    })

    if (!confirm.isConfirmed) return

    try {
      setReenviandoEmails(true)
      await remitosAPI.reenviarEmails(id)
      Swal.fire('Éxito', 'Emails reenviados exitosamente', 'success')
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al reenviar emails', 'error')
    } finally {
      setReenviandoEmails(false)
    }
  }

  const handleAsignarReceptor = async () => {
    if (!receptorNombre.trim() || !receptorEmail.trim()) {
      Swal.fire('Error', 'Por favor completa todos los campos', 'error')
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(receptorEmail)) {
      Swal.fire('Error', 'El email no es válido', 'error')
      return
    }

    try {
      setAsignandoReceptor(true)
      await remitosAPI.asignarReceptor(id, receptorNombre, receptorEmail)
      Swal.fire({
        title: 'Éxito',
        html: `Receptor asignado exitosamente.<br><br>Se han enviado emails a:<br>- ${receptorEmail} (receptor)<br>- ${remito.solicitante?.email} (solicitante)`,
        icon: 'success'
      })
      setShowReceptorModal(false)
      setReceptorNombre('')
      setReceptorEmail('')
      await cargarDetalle()
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al asignar receptor', 'error')
    } finally {
      setAsignandoReceptor(false)
    }
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
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Acciones</th>
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
                      {detalle.es_prestamo && detalle.fecha_devolucion_esperada ? (
                        new Date(detalle.fecha_devolucion_esperada).toLocaleDateString('es-AR')
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {detalle.es_prestamo ? (
                        detalle.devuelto ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Devuelto</span>
                        ) : (
                          <span className="text-gray-400">Pendiente</span>
                        )
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {detalle.es_prestamo && !detalle.devuelto ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEditarFecha(detalle)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            title="Editar fecha"
                          >
                            📅
                          </button>
                          <button
                            onClick={() => handleMarcarDevuelto(detalle.id)}
                            disabled={markingReturned}
                            className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                            title="Marcar como devuelto"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
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

      {/* Reenviar Emails - Solo visible si el remito no está en estado "preparado" ni "completado" */}
      {remito && remito.estado !== 'preparado' && remito.estado !== 'completado' && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Reenviar Emails</h2>
          <p className="text-gray-600 mb-4">
            Reenvía el remito por correo a infraestructura y al solicitante
          </p>
          <button
            onClick={handleReenviarEmails}
            disabled={reenviandoEmails}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded transition-colors"
          >
            {reenviandoEmails ? 'Reenviando...' : '📧 Reenviar Email'}
          </button>
        </div>
      )}

      {/* Receptor Asignado - Mostrar si ya tiene receptor */}
      {remito && remito.receptor_nombre && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-green-700">✓ Receptor Asignado</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Nombre:</span> {remito.receptor_nombre}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> {remito.receptor_email}
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Esta persona recibirá el remito y confirmará la recepción.
          </p>
        </div>
      )}

      {/* Asignar Receptor - Solo si está en tránsito y no tiene receptor */}
      {remito && remito.estado === 'en_transito' && !remito.receptor_nombre && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Asignar Receptor Alternativo</h2>
          <p className="text-gray-600 mb-4">
            Si el solicitante no puede recibir el remito, puedes asignar otra persona como receptor.
          </p>
          <button
            onClick={() => setShowReceptorModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded transition-colors"
          >
            👤 Asignar Receptor
          </button>
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

      {/* Modal de Editar Fecha */}
      {editingLoanId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Editar Fecha de Devolución</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva fecha de devolución
              </label>
              <input
                type="date"
                value={editingDate}
                onChange={(e) => setEditingDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setEditingLoanId(null)
                  setEditingDate('')
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarFecha}
                disabled={!editingDate || markingReturned}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded"
              >
                {markingReturned ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
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
                      Devolución esperada: {new Date(detalle.fecha_devolucion_esperada).toLocaleDateString('es-AR')}
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

      {/* Modal Asignar Receptor */}
      {showReceptorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Asignar Receptor Alternativo</h3>

            <p className="text-sm text-gray-600 mb-4">
              Esta persona recibirá el remito en lugar del solicitante original.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={receptorNombre}
                  onChange={(e) => setReceptorNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={asignandoReceptor}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={receptorEmail}
                  onChange={(e) => setReceptorEmail(e.target.value)}
                  placeholder="Ej: juan.perez@megatlon.com.ar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={asignandoReceptor}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Se enviará un email al receptor con un link para confirmar la recepción del remito.
                El solicitante original ({remito?.solicitante?.email}) recibirá una copia informativa.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowReceptorModal(false)
                  setReceptorNombre('')
                  setReceptorEmail('')
                }}
                disabled={asignandoReceptor}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleAsignarReceptor}
                disabled={asignandoReceptor || !receptorNombre.trim() || !receptorEmail.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded"
              >
                {asignandoReceptor ? 'Asignando...' : 'Asignar y Enviar Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RemitoDetailPage
