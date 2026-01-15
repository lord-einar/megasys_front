import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sedesAPI, personalAPI, authAPI } from '../services/api'

export default function AsignarSedesPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [personal, setPersonal] = useState(null)
  const [sedes, setSedes] = useState([])
  const [sedesAsignadas, setSedesAsignadas] = useState([])
  const [selectedSedes, setSelectedSedes] = useState([])
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [id])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load current user to verify permissions
      const userResponse = await authAPI.getMe()
      setCurrentUser(userResponse?.data?.user || userResponse?.user)

      // Load personal details
      const personalResponse = await personalAPI.getById(id)
      const personalData = personalResponse?.data || personalResponse
      setPersonal(personalData)

      // Load all sedes
      const sedesResponse = await sedesAPI.list({ limit: 100 })
      const sedesData = sedesResponse?.data?.data || sedesResponse?.data || []
      setSedes(Array.isArray(sedesData) ? sedesData : [])

      // Load sedes assigned to this person
      const asignacionesResponse = await sedesAPI.getSedesAsignadas(id)
      const asignacionesData = asignacionesResponse?.data || asignacionesResponse || []
      const sedesIds = Array.isArray(asignacionesData)
        ? asignacionesData.map(a => a.sede_id)
        : []
      setSedesAsignadas(sedesIds)
      setSelectedSedes(sedesIds)
    } catch (err) {
      setError(err.message || 'Error al cargar los datos')
      console.error('Error cargando datos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSede = (sedeId) => {
    setSelectedSedes(prev =>
      prev.includes(sedeId)
        ? prev.filter(id => id !== sedeId)
        : [...prev, sedeId]
    )
  }

  const handleGuardar = async (e) => {
    e.preventDefault()

    try {
      setEnviando(true)
      setError(null)
      setSuccess(false)

      // Sedes to remove (were assigned, now not selected)
      const sedesToRemove = sedesAsignadas.filter(
        id => !selectedSedes.includes(id)
      )

      // Sedes to add (are selected, were not assigned)
      const sedesToAdd = selectedSedes.filter(
        id => !sedesAsignadas.includes(id)
      )

      // Remove assignments
      for (const sedeId of sedesToRemove) {
        await sedesAPI.desasignarTecnico(sedeId, id)
      }

      // Add new assignments
      for (const sedeId of sedesToAdd) {
        await sedesAPI.asignarTecnico(sedeId, {
          personal_id: id,
          notas: `Asignado a través de Personal`
        })
      }

      setSuccess(true)
      setSedesAsignadas(selectedSedes)

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/personal/${id}`)
      }, 2000)
    } catch (err) {
      setError(err.message || 'Error al guardar las asignaciones')
      console.error('Error guardando asignaciones:', err)
    } finally {
      setEnviando(false)
    }
  }

  // Verify permissions
  if (currentUser && currentUser.role !== 'super_admin') {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(`/personal/${id}`)}
            className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Volver
          </button>
          <div className="p-6 bg-red-50 border-l-4 border-red-600 rounded-lg">
            <p className="text-red-800 font-medium">Acceso Denegado</p>
            <p className="text-red-600 text-sm mt-1">
              Solo los administradores de infraestructura pueden asignar sedes
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (!personal) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/personal')}
            className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Volver a Personal
          </button>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontró el personal</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(`/personal/${id}`)}
          className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          ← Volver a {personal.nombre} {personal.apellido}
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
            <h1 className="text-3xl font-bold">Asignar Sedes</h1>
            <p className="text-blue-100 text-lg mt-2">
              {personal.nombre} {personal.apellido}
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">¡Éxito!</p>
                <p className="text-green-600 text-sm mt-1">
                  Asignaciones guardadas correctamente. Redirigiendo...
                </p>
              </div>
            )}

            {/* Sedes List */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Selecciona las sedes para asignar
              </h2>

              {sedes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay sedes disponibles
                </div>
              ) : (
                <div className="space-y-2">
                  {sedes.map(sede => (
                    <label
                      key={sede.id}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSedes.includes(sede.id)}
                        onChange={() => handleToggleSede(sede.id)}
                        disabled={enviando}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-gray-900">
                          {sede.nombre_sede}
                        </p>
                        <p className="text-sm text-gray-600">
                          {sede.direccion}, {sede.localidad}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedSedes.includes(sede.id)
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {selectedSedes.includes(sede.id) ? '✓ Seleccionado' : 'No seleccionado'}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900 font-medium">
                Sedes a asignar: <span className="text-lg font-bold">{selectedSedes.length}</span>
              </p>
              {selectedSedes.length > 0 && (
                <div className="mt-2 text-sm text-blue-700">
                  <p className="font-semibold mb-1">Sedes seleccionadas:</p>
                  <ul className="list-disc list-inside">
                    {selectedSedes.map(sedeId => {
                      const sede = sedes.find(s => s.id === sedeId)
                      return (
                        <li key={sedeId}>
                          {sede?.nombre_sede}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={handleGuardar}
                disabled={enviando || selectedSedes.length === sedesAsignadas.length &&
                          selectedSedes.every(id => sedesAsignadas.includes(id))}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {enviando ? 'Guardando...' : 'Guardar Asignaciones'}
              </button>

              <button
                type="button"
                onClick={() => navigate(`/personal/${id}`)}
                disabled={enviando}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
