import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sedesAPI, authAPI } from '../services/api'
import TablaInventarioSede from '../components/TablaInventarioSede'

export default function SedeDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sede, setSede] = useState(null)
  const [tecnico, setTecnico] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tecnicoLoading, setTecnicoLoading] = useState(false)
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
      setCurrentUser(userResponse?.data || userResponse)

      // Load sede
      const response = await sedesAPI.getById(id)
      const sedeData = response?.data || response
      setSede(sedeData)

      // Load assigned technician
      cargarTecnico()
    } catch (err) {
      setError(err.message || 'Error al cargar la sede')
      console.error('Error cargando sede:', err)
    } finally {
      setLoading(false)
    }
  }

  const cargarTecnico = async () => {
    try {
      setTecnicoLoading(true)
      const response = await sedesAPI.getTecnicoActivo(id)
      setTecnico(response?.data || response)
    } catch (err) {
      // It's ok if there's no assigned technician
      console.log('No hay técnico asignado a esta sede:', err.message)
      setTecnico(null)
    } finally {
      setTecnicoLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando detalles de la sede...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/sedes')}
            className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Volver a Sedes
          </button>
          <div className="p-6 bg-red-50 border-l-4 border-red-600 rounded-lg">
            <p className="text-red-800 font-medium">Error al cargar la sede</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!sede) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/sedes')}
          className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          ← Volver a Sedes
        </button>

        {/* Información Principal */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Header Gradiente */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
            <h1 className="text-4xl font-bold">{sede.nombre_sede}</h1>
            <p className="text-blue-100 text-lg mt-2">{sede.empresa?.nombre_empresa || 'Sin empresa'}</p>
            <div className="mt-4 flex items-center gap-4">
              <span className={`px-4 py-2 rounded-full font-semibold ${
                sede.activo
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {sede.activo ? '✓ Activa' : '✗ Inactiva'}
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
                onClick={() => setActiveTab('personal')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'personal'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Personal ({sede.personalSede?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('inventario')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'inventario'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Inventario
              </button>
            </div>
          </div>

          {/* Contenido de Tabs */}
          <div className="p-8">
            {/* Tab: Información General */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Ubicación */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      📍 Ubicación
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Dirección</p>
                        <p className="text-gray-900 font-medium">{sede.direccion}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Localidad</p>
                        <p className="text-gray-900">{sede.localidad}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Provincia</p>
                        <p className="text-gray-900">{sede.provincia}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">País</p>
                        <p className="text-gray-900">{sede.pais}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contacto e Infraestructura */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      ☎️ Contacto e Infraestructura
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      {sede.telefono && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Teléfono</p>
                          <p className="text-gray-900">{sede.telefono}</p>
                        </div>
                      )}
                      {sede.ip_sede && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">IP de la Sede</p>
                          <p className="text-gray-900 font-mono">{sede.ip_sede}</p>
                        </div>
                      )}
                      {!sede.telefono && !sede.ip_sede && (
                        <p className="text-gray-500 italic">Sin información de contacto registrada</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Técnico de Soporte Asignado */}
                {(currentUser?.roles?.some(r => r.nombre === 'super_admin') || currentUser?.roles?.some(r => r.nombre === 'support')) && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      👨‍💼 Técnico de Soporte
                    </h3>
                    {tecnicoLoading ? (
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500 text-sm mt-2">Cargando...</p>
                      </div>
                    ) : tecnico?.personal ? (
                      <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div>
                          <p className="text-xs text-blue-600 uppercase font-semibold">Nombre</p>
                          <p className="text-gray-900 font-medium">
                            {tecnico.personal.nombre} {tecnico.personal.apellido}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-600 uppercase font-semibold">Email</p>
                          <p className="text-gray-900 break-all">{tecnico.personal.email}</p>
                        </div>
                        {tecnico.personal.telefono && (
                          <div>
                            <p className="text-xs text-blue-600 uppercase font-semibold">Teléfono</p>
                            <p className="text-gray-900">{tecnico.personal.telefono}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-blue-600 uppercase font-semibold">Asignado desde</p>
                          <p className="text-gray-900">
                            {new Date(tecnico.fecha_asignacion).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                        {currentUser?.roles?.some(r => r.nombre === 'super_admin') && (
                          <button
                            onClick={() => navigate(`/sedes/${id}/asignar-tecnico`)}
                            className="w-full mt-4 px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors font-medium text-sm"
                          >
                            Cambiar Técnico
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <p className="text-yellow-800 text-sm">
                          No hay un técnico de soporte asignado a esta sede
                        </p>
                        {currentUser?.roles?.some(r => r.nombre === 'super_admin') && (
                          <button
                            onClick={() => navigate(`/sedes/${id}/asignar-tecnico`)}
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium text-sm"
                          >
                            + Asignar Técnico
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <p className="text-xs text-blue-600 uppercase font-semibold mb-2">Personal Activo</p>
                    <p className="text-4xl font-bold text-blue-600">{sede.personalSede?.length || 0}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <p className="text-xs text-green-600 uppercase font-semibold mb-2">Items Inventario</p>
                    <p className="text-4xl font-bold text-green-600">{sede.inventario?.total || 0}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                    <p className="text-xs text-purple-600 uppercase font-semibold mb-2">Disponibles</p>
                    <p className="text-4xl font-bold text-purple-600">{sede.inventario?.disponible || 0}</p>
                  </div>
                </div>

                {/* Información de Auditoría */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Información de Auditoría</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Creado el</p>
                      <p>{new Date(sede.created_at).toLocaleString('es-AR')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Actualizado el</p>
                      <p>{new Date(sede.updated_at).toLocaleString('es-AR')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Personal */}
            {activeTab === 'personal' && (
              <div>
                {sede.personalSede && sede.personalSede.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nombre</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rol</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sede.personalSede.map((person) => (
                          <tr key={person.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-900">{person.nombre} {person.apellido}</p>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{person.email}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {person.rol?.nombre || 'Sin rol'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                Ver Perfil
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay personal asignado a esta sede</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Inventario */}
            {activeTab === 'inventario' && (
              <div className="space-y-6">
                {/* Estadísticas de inventario */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <p className="text-xs text-blue-600 uppercase font-semibold mb-2">Total de Items</p>
                    <p className="text-3xl font-bold text-blue-600">{sede.inventario?.total || 0}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <p className="text-xs text-green-600 uppercase font-semibold mb-2">Disponibles</p>
                    <p className="text-3xl font-bold text-green-600">{sede.inventario?.disponible || 0}</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <p className="text-xs text-yellow-600 uppercase font-semibold mb-2">En Uso</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {(sede.inventario?.total || 0) - (sede.inventario?.disponible || 0)}
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                    <p className="text-xs text-purple-600 uppercase font-semibold mb-2">En Préstamo</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {sede.inventario?.prestamosEnEstaSede || sede.prestamosEnSede?.length || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Otros</p>
                    <p className="text-3xl font-bold text-gray-600">
                      {(sede.inventario?.total || 0) - (sede.inventario?.disponible || 0) - (sede.inventario?.enUso || 0)}
                    </p>
                  </div>
                </div>

                {/* Tabla de artículos del inventario propio */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Inventario de la Sede</h3>
                  <TablaInventarioSede
                    articulos={sede.inventarioSede || []}
                    loading={loading}
                  />
                </div>

                {/* Artículos en préstamo EN esta sede */}
                {sede.prestamosEnSede && sede.prestamosEnSede.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <h3 className="text-lg font-bold text-purple-900">Artículos en Préstamo en esta Sede</h3>
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                        {sede.prestamosEnSede.length}
                      </span>
                    </div>
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                      <div className="grid grid-cols-1 gap-4">
                        {sede.prestamosEnSede.map((prestamo, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-4 shadow">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-bold text-gray-900">
                                  {prestamo.inventario?.tipoArticulo?.nombre} - {prestamo.inventario?.marca} {prestamo.inventario?.modelo}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  SN: {prestamo.inventario?.numero_serie || 'N/A'}
                                </p>
                                <div className="mt-2 flex gap-4 text-xs text-gray-600">
                                  <span>Remito: <span className="font-mono font-semibold text-purple-700">{prestamo.remito?.numero_remito}</span></span>
                                  <span>Desde: <span className="font-semibold">{prestamo.remito?.sedeOrigen?.nombre_sede}</span></span>
                                </div>
                                {prestamo.fechaDevolucionEsperada && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Devolución esperada: {new Date(prestamo.fechaDevolucionEsperada).toLocaleDateString('es-AR')}
                                  </p>
                                )}
                              </div>
                              <span className="ml-4 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                                {prestamo.remito?.estado}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-4">
          <button className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold">
            Editar Sede
          </button>
          <button
            onClick={() => navigate('/sedes')}
            className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
          >
            Volver a Lista
          </button>
        </div>
      </div>
    </div>
  )
}
