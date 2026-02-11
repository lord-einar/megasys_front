import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { reclamosAPI, personalAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'
import Swal from 'sweetalert2'

export default function ReclamoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canUpdate } = usePermissions()

  const [reclamo, setReclamo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tecnicos, setTecnicos] = useState([])
  const [mostrarCambioEstado, setMostrarCambioEstado] = useState(false)
  const [mostrarAsignarTecnico, setMostrarAsignarTecnico] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState('')

  useEffect(() => {
    cargarReclamo()
    cargarTecnicos()
  }, [id])

  const cargarReclamo = async () => {
    try {
      setLoading(true)
      const response = await reclamosAPI.getById(id)
      const normalized = normalizeApiResponse(response)
      setReclamo(normalized.data)
    } catch (err) {
      console.error('Error cargando reclamo:', err)
      Swal.fire('Error', 'No se pudo cargar el reclamo', 'error')
    } finally {
      setLoading(false)
    }
  }

  const cargarTecnicos = async () => {
    try {
      const response = await personalAPI.list({ limit: 100, activo: true })
      const normalized = normalizeApiResponse(response)
      setTecnicos(normalized.data || [])
    } catch (err) {
      console.error('Error cargando técnicos:', err)
    }
  }

  const handleCambiarEstado = async () => {
    if (!nuevoEstado) {
      Swal.fire('Error', 'Debe seleccionar un estado', 'error')
      return
    }

    try {
      await reclamosAPI.cambiarEstado(id, nuevoEstado)
      await Swal.fire('Éxito', 'Estado actualizado correctamente', 'success')
      setMostrarCambioEstado(false)
      cargarReclamo()
    } catch (err) {
      Swal.fire('Error', err.message || 'No se pudo cambiar el estado', 'error')
    }
  }

  const handleAsignarTecnico = async () => {
    if (!tecnicoSeleccionado) {
      Swal.fire('Error', 'Debe seleccionar un técnico', 'error')
      return
    }

    try {
      await reclamosAPI.asignarTecnico(id, tecnicoSeleccionado)
      await Swal.fire('Éxito', 'Técnico asignado correctamente', 'success')
      setMostrarAsignarTecnico(false)
      cargarReclamo()
    } catch (err) {
      Swal.fire('Error', err.message || 'No se pudo asignar el técnico', 'error')
    }
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      abierto: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      en_proceso: 'bg-blue-100 text-blue-800 border-blue-300',
      resuelto: 'bg-green-100 text-green-800 border-green-300',
      cerrado: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelado: 'bg-red-100 text-red-800 border-red-300'
    }
    return badges[estado] || 'bg-gray-100 text-gray-800'
  }

  const getPrioridadBadge = (prioridad) => {
    const badges = {
      baja: 'bg-gray-100 text-gray-700 border-gray-300',
      media: 'bg-blue-100 text-blue-700 border-blue-300',
      alta: 'bg-orange-100 text-orange-700 border-orange-300',
      critica: 'bg-red-100 text-red-700 border-red-300'
    }
    return badges[prioridad] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!reclamo) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Reclamo no encontrado
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/proveedores/reclamos')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          ← Volver a Reclamos
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{reclamo.numero_reclamo}</h1>
            <p className="text-xl text-gray-700 mt-2">{reclamo.titulo}</p>
          </div>
          <div className="flex gap-3">
            <span className={`px-4 py-2 rounded-lg border-2 font-semibold ${getEstadoBadge(reclamo.estado)}`}>
              {reclamo.estado.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`px-4 py-2 rounded-lg border-2 font-semibold ${getPrioridadBadge(reclamo.prioridad)}`}>
              {reclamo.prioridad.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descripción */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Descripción</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{reclamo.descripcion}</p>
          </div>

          {/* Observaciones */}
          {reclamo.observaciones && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Observaciones</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{reclamo.observaciones}</p>
            </div>
          )}

          {/* Equipo */}
          {reclamo.equipo && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Equipo Relacionado</h2>
              <div className="grid grid-cols-2 gap-4">
                {reclamo.equipo.mac && (
                  <div>
                    <p className="text-sm text-gray-500">MAC</p>
                    <p className="font-medium">{reclamo.equipo.mac}</p>
                  </div>
                )}
                {reclamo.equipo.modelo && (
                  <div>
                    <p className="text-sm text-gray-500">Modelo</p>
                    <p className="font-medium">{reclamo.equipo.modelo}</p>
                  </div>
                )}
                {reclamo.equipo.marca && (
                  <div>
                    <p className="text-sm text-gray-500">Marca</p>
                    <p className="font-medium">{reclamo.equipo.marca}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Acciones */}
          {canUpdate('proveedores') && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setMostrarCambioEstado(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cambiar Estado
                </button>
                <button
                  onClick={() => setMostrarAsignarTecnico(true)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Asignar Técnico
                </button>
              </div>
            </div>
          )}

          {/* Información */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Información</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Servicio</p>
                <p className="font-medium">{reclamo.servicio?.nombre || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sede</p>
                <p className="font-medium">{reclamo.sede?.nombre_sede || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha Apertura</p>
                <p className="font-medium">
                  {new Date(reclamo.fecha_apertura).toLocaleString('es-AR')}
                </p>
              </div>
              {reclamo.fecha_resolucion && (
                <div>
                  <p className="text-sm text-gray-500">Fecha Resolución</p>
                  <p className="font-medium">
                    {new Date(reclamo.fecha_resolucion).toLocaleString('es-AR')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Creado Por</p>
                <p className="font-medium">
                  {reclamo.creador ? `${reclamo.creador.nombre} ${reclamo.creador.apellido}` : 'N/A'}
                </p>
              </div>
              {reclamo.tecnicoAsignado && (
                <div>
                  <p className="text-sm text-gray-500">Técnico Asignado</p>
                  <p className="font-medium">
                    {`${reclamo.tecnicoAsignado.nombre} ${reclamo.tecnicoAsignado.apellido}`}
                  </p>
                  <p className="text-sm text-gray-500">{reclamo.tecnicoAsignado.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Cambiar Estado */}
      {mostrarCambioEstado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Cambiar Estado</h3>
            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            >
              <option value="">Seleccionar estado...</option>
              <option value="abierto">Abierto</option>
              <option value="en_proceso">En Proceso</option>
              <option value="resuelto">Resuelto</option>
              <option value="cerrado">Cerrado</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={handleCambiarEstado}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirmar
              </button>
              <button
                onClick={() => setMostrarCambioEstado(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Técnico */}
      {mostrarAsignarTecnico && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Asignar Técnico</h3>
            <select
              value={tecnicoSeleccionado}
              onChange={(e) => setTecnicoSeleccionado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            >
              <option value="">Seleccionar técnico...</option>
              {tecnicos.map((tecnico) => (
                <option key={tecnico.id} value={tecnico.id}>
                  {tecnico.nombre} {tecnico.apellido} - {tecnico.email}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={handleAsignarTecnico}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Asignar
              </button>
              <button
                onClick={() => setMostrarAsignarTecnico(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
