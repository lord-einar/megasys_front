import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { personalAPI, authAPI } from '../services/api'

export default function PersonalDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [personal, setPersonal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('general')
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [id])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load current user
      const userResponse = await authAPI.getMe()
      setCurrentUser(userResponse?.data?.user || userResponse?.user)

      // Load personal details
      const response = await personalAPI.getById(id)
      const personalData = response?.data || response
      setPersonal(personalData)
    } catch (err) {
      setError(err.message || 'Error al cargar los datos')
      console.error('Error cargando datos:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando detalles del personal...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/personal')}
            className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Volver a Personal
          </button>
          <div className="p-6 bg-red-50 border-l-4 border-red-600 rounded-lg">
            <p className="text-red-800 font-medium">Error al cargar el personal</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/personal')}
          className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          ← Volver a Personal
        </button>

        {/* Información Principal */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Header Gradiente */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
            <h1 className="text-4xl font-bold">{personal.nombre} {personal.apellido}</h1>
            <p className="text-blue-100 text-lg mt-2">{personal.rol?.nombre || 'Sin rol asignado'}</p>
            <div className="mt-4 flex items-center gap-4">
              <span className={`px-4 py-2 rounded-full font-semibold ${
                personal.activo
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {personal.activo ? '✓ Activo' : '✗ Inactivo'}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex gap-8 px-8">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'general'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Información General
              </button>
              <button
                onClick={() => setActiveTab('sedes')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'sedes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Sedes Asignadas ({personal.sedesAsignadas?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('remitos')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'remitos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Remitos
              </button>
            </div>
          </div>

          {/* Contenido de Tabs */}
          <div className="p-8">
            {/* Tab: Información General */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Información Personal */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      👤 Información Personal
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Nombre Completo</p>
                        <p className="text-gray-900 font-medium">{personal.nombre} {personal.apellido}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                        <p className="text-gray-900">{personal.email}</p>
                      </div>
                      {personal.telefono && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Teléfono</p>
                          <p className="text-gray-900">{personal.telefono}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Asignación */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      🏢 Asignación
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Rol</p>
                        <p className="text-gray-900 font-medium">{personal.rol?.nombre || 'Sin rol'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Sede Principal</p>
                        <p className="text-gray-900">{personal.sede?.nombre_sede || 'Sin sede'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Sedes Asignadas</p>
                        <p className="text-gray-900">{personal.sedesAsignadas?.length || 0} sede(s)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <p className="text-xs text-blue-600 uppercase font-semibold mb-2">Remitos Solicitados</p>
                    <p className="text-4xl font-bold text-blue-600">{personal.estadisticas?.remitosSolicitados || 0}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <p className="text-xs text-green-600 uppercase font-semibold mb-2">Remitos Asignados</p>
                    <p className="text-4xl font-bold text-green-600">{personal.estadisticas?.remitosAsignados || 0}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                    <p className="text-xs text-purple-600 uppercase font-semibold mb-2">Total Remitos</p>
                    <p className="text-4xl font-bold text-purple-600">
                      {(personal.estadisticas?.remitosSolicitados || 0) + (personal.estadisticas?.remitosAsignados || 0)}
                    </p>
                  </div>
                </div>

                {/* Información de Auditoría */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Información de Auditoría</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Creado el</p>
                      <p>{personal.created_at ? new Date(personal.created_at).toLocaleString('es-AR') : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Actualizado el</p>
                      <p>{personal.updated_at ? new Date(personal.updated_at).toLocaleString('es-AR') : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Sedes */}
            {activeTab === 'sedes' && (
              <div>
                {personal.sedesAsignadas && personal.sedesAsignadas.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nombre de Sede</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Localidad</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Provincia</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {personal.sedesAsignadas.map((asignacion) => (
                          <tr key={asignacion.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-900">{asignacion.sede?.nombre_sede || 'N/A'}</p>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{asignacion.sede?.localidad || 'N/A'}</td>
                            <td className="px-6 py-4 text-gray-600">{asignacion.sede?.provincia || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => navigate(`/sedes/${asignacion.sede_id}`)}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                              >
                                Ver Detalles
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay sedes asignadas a este personal</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Remitos */}
            {activeTab === 'remitos' && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">Remitos del personal</p>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Solicitados</p>
                    <p className="text-3xl font-bold text-blue-600">{personal.estadisticas?.remitosSolicitados || 0}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Asignados</p>
                    <p className="text-3xl font-bold text-green-600">{personal.estadisticas?.remitosAsignados || 0}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {(personal.estadisticas?.remitosSolicitados || 0) + (personal.estadisticas?.remitosAsignados || 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/personal/${id}/editar`)}
            className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
          >
            Editar Personal
          </button>
          {currentUser && currentUser.role === 'super_admin' && (
            <button
              onClick={() => navigate(`/personal/${id}/asignar-sedes`)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Asignar Sedes
            </button>
          )}
          <button
            onClick={() => navigate('/personal')}
            className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
          >
            Volver a Lista
          </button>
        </div>
      </div>
    </div>
  )
}
