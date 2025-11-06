import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sedesAPI, authAPI } from '../services/api'

export default function AsignarTecnicoPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [sede, setSede] = useState(null)
  const [tecnicos, setTecnicos] = useState([])
  const [tecnicoActual, setTecnicoActual] = useState(null)
  const [selectedTecnico, setSelectedTecnico] = useState('')
  const [notas, setNotas] = useState('')
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
      setCurrentUser(userResponse?.data || userResponse)

      // Load sede details
      const sedeResponse = await sedesAPI.getById(id)
      setSede(sedeResponse?.data || sedeResponse)

      // Load available technicians
      const tecnicosResponse = await sedesAPI.getTecnicosDisponibles()
      const tecnicosData = tecnicosResponse?.data || tecnicosResponse
      setTecnicos(Array.isArray(tecnicosData) ? tecnicosData : [])

      // Load current assigned technician
      try {
        const tecnicoResponse = await sedesAPI.getTecnicoActivo(id)
        setTecnicoActual(tecnicoResponse?.data || tecnicoResponse)
        setSelectedTecnico((tecnicoResponse?.data || tecnicoResponse)?.personal_id || '')
      } catch (err) {
        // No technician assigned yet, that's ok
        setTecnicoActual(null)
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los datos')
      console.error('Error cargando datos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAsignar = async (e) => {
    e.preventDefault()

    if (!selectedTecnico) {
      setError('Por favor selecciona un técnico')
      return
    }

    try {
      setEnviando(true)
      setError(null)
      setSuccess(false)

      // If there's a current technician, unassign them first
      if (tecnicoActual?.personal_id) {
        await sedesAPI.desasignarTecnico(id, tecnicoActual.personal_id)
      }

      // Assign the new technician
      await sedesAPI.asignarTecnico(id, {
        personal_id: selectedTecnico,
        notas: notas || null
      })

      setSuccess(true)
      // Reload data after successful assignment
      setTimeout(() => {
        navigate(`/sedes/${id}`)
      }, 2000)
    } catch (err) {
      setError(err.message || 'Error al asignar el técnico')
      console.error('Error asignando técnico:', err)
    } finally {
      setEnviando(false)
    }
  }

  const handleDesasignar = async () => {
    if (!tecnicoActual) return

    if (!window.confirm('¿Estás seguro de que quieres desasignar al técnico?')) {
      return
    }

    try {
      setEnviando(true)
      setError(null)

      await sedesAPI.desasignarTecnico(id, tecnicoActual.personal_id)

      setSuccess(true)
      setSelectedTecnico('')
      setNotas('')
      // Reload data
      setTimeout(() => {
        navigate(`/sedes/${id}`)
      }, 2000)
    } catch (err) {
      setError(err.message || 'Error al desasignar el técnico')
      console.error('Error desasignando técnico:', err)
    } finally {
      setEnviando(false)
    }
  }

  // Verify permissions
  if (currentUser && currentUser.role !== 'super_admin') {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/sedes')}
            className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Volver a Sedes
          </button>
          <div className="p-6 bg-red-50 border-l-4 border-red-600 rounded-lg">
            <p className="text-red-800 font-medium">Acceso Denegado</p>
            <p className="text-red-600 text-sm mt-1">
              Solo los administradores de infraestructura pueden asignar técnicos
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

  if (!sede) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/sedes')}
            className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Volver a Sedes
          </button>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontró la sede</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(`/sedes/${id}`)}
          className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          ← Volver a {sede.nombre_sede}
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
            <h1 className="text-3xl font-bold">Asignar Técnico de Soporte</h1>
            <p className="text-blue-100 text-lg mt-2">{sede.nombre_sede}</p>
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
                  Técnico asignado correctamente. Redirigiendo...
                </p>
              </div>
            )}

            {/* Current Technician Info */}
            {tecnicoActual?.personal && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-2">Técnico Actual</h3>
                <p className="text-blue-800">
                  {tecnicoActual.personal.nombre} {tecnicoActual.personal.apellido}
                </p>
                <p className="text-blue-600 text-sm">{tecnicoActual.personal.email}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAsignar} className="space-y-6">
              {/* Select Technician */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Seleccionar Técnico de Soporte *
                </label>
                <select
                  value={selectedTecnico}
                  onChange={(e) => setSelectedTecnico(e.target.value)}
                  disabled={enviando}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">-- Selecciona un técnico --</option>
                  {tecnicos.map((tecnico) => (
                    <option key={tecnico.id} value={tecnico.id}>
                      {tecnico.nombre} {tecnico.apellido} ({tecnico.email})
                    </option>
                  ))}
                </select>
                {tecnicos.length === 0 && (
                  <p className="text-yellow-600 text-sm mt-2">
                    No hay técnicos disponibles en el sistema
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Notas (Opcional)
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  disabled={enviando}
                  placeholder="Agregá cualquier información adicional sobre esta asignación..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={enviando || !selectedTecnico}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {enviando ? 'Asignando...' : 'Asignar Técnico'}
                </button>

                {tecnicoActual && (
                  <button
                    type="button"
                    onClick={handleDesasignar}
                    disabled={enviando}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Desasignar
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => navigate(`/sedes/${id}`)}
                  disabled={enviando}
                  className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
