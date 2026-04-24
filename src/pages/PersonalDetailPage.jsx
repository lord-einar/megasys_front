import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { personalAPI, authAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'

export default function PersonalDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [personal, setPersonal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('general')
  const [currentUser, setCurrentUser] = useState(null)
  const { canUpdate } = usePermissions()

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
          <p className="text-surface-500 font-medium">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (error || !personal) {
    return (
      <div className="p-6 sm:p-8 bg-surface-50 min-h-screen">
        <div className="p-8 text-center bg-white rounded-2xl border border-surface-200 shadow-sm max-w-lg mx-auto mt-20">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-rose-800 mb-2">No se pudo cargar el personal</h3>
          <p className="text-rose-600 mb-6">{error || 'El personal solicitado no existe o fue eliminado.'}</p>
          <button
            onClick={() => navigate('/personal')}
            className="btn-primary w-full"
          >
            Volver a la Lista
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/personal')}
            className="text-surface-500 hover:text-primary-600 font-medium text-sm flex items-center gap-2 transition-colors w-fit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Personal
          </button>

          <div className="flex gap-3">
            {canUpdate('personal') && (
              <button
                onClick={() => navigate(`/personal/${id}/editar`)}
                className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-primary-900/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
            )}

            {currentUser && currentUser.role === 'super_admin' && (
              <button
                onClick={() => navigate(`/personal/${id}/asignar-sedes`)}
                className="px-4 py-2 bg-white border border-surface-200 text-surface-700 font-bold rounded-xl hover:bg-surface-50 hover:border-surface-300 transition-all text-sm shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Asignar Sedes
              </button>
            )}
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="card-base bg-white overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary-600 to-indigo-700 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          </div>
          <div className="px-8 pb-8">
            <div className="relative flex flex-col sm:flex-row items-end -mt-12 mb-6 gap-6">
              <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-xl">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-surface-100 to-surface-200 flex items-center justify-center text-3xl font-bold text-surface-400">
                  {personal.nombre?.[0]}{personal.apellido?.[0]}
                </div>
              </div>

              <div className="flex-1 mb-2">
                <h1 className="text-3xl font-bold text-surface-900 tracking-tight">{personal.nombre} {personal.apellido}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-surface-500 font-medium flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {personal.rol?.nombre || 'Sin rol asignado'}
                  </p>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${personal.activo ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                    {personal.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  {personal.color && (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border border-surface-200 bg-surface-50 text-surface-600" title="Color en el calendario">
                      <span
                        className="w-3 h-3 rounded-full shadow-sm border border-black/10"
                        style={{ backgroundColor: personal.color }}
                      />
                      Calendario
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-surface-100 mb-8">
              <TabButton
                active={activeTab === 'general'}
                onClick={() => setActiveTab('general')}
                label="Información General"
              />
              <TabButton
                active={activeTab === 'sedes'}
                onClick={() => setActiveTab('sedes')}
                label={`Sedes Asignadas (${personal.sedesAsignadas?.length || 0})`}
              />
              <TabButton
                active={activeTab === 'remitos'}
                onClick={() => setActiveTab('remitos')}
                label="Estadísticas"
              />
            </div>

            {/* Tab Panels */}
            <div className="animate-fade-in">
              {activeTab === 'general' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-surface-900 border-b border-surface-100 pb-3 uppercase tracking-wide flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Datos Personales
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <InfoItem label="Email" value={personal.email} />
                      <InfoItem label="Teléfono" value={personal.telefono} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-surface-900 border-b border-surface-100 pb-3 uppercase tracking-wide flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      Ubicación y Empresa
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <InfoItem label="Empresa" value={personal.sede?.empresa?.nombre_empresa} />
                      <InfoItem label="Sede Principal" value={personal.sede?.nombre_sede} />
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-6 border-t border-surface-100 mt-2">
                    <div className="flex items-center gap-6 text-xs text-surface-400">
                      <span>Registrado: <span className="font-medium text-surface-600">{formatDate(personal.created_at)}</span></span>
                      <span>Actualizado: <span className="font-medium text-surface-600">{formatDate(personal.updated_at)}</span></span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sedes' && (
                <div className="space-y-6">
                  {personal.sedesAsignadas && personal.sedesAsignadas.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {personal.sedesAsignadas.map((asignacion) => (
                        <div key={asignacion.id} className="p-4 rounded-xl border border-surface-200 bg-surface-50 hover:bg-white hover:border-primary-200 hover:shadow-sm transition-all group">
                          <div className="flex justify-between items-start mb-2">
                            <div className="w-8 h-8 rounded-lg bg-surface-200 text-surface-500 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <button
                              onClick={() => navigate(`/sedes/${asignacion.sede_id}`)}
                              className="text-primary-600 hover:text-primary-800 text-xs font-bold bg-primary-50 px-2 py-1 rounded group-hover:bg-primary-100 transition-colors"
                            >
                              Ver Sede
                            </button>
                          </div>
                          <h4 className="font-bold text-surface-900">{asignacion.sede?.nombre_sede || 'Sede Desconocida'}</h4>
                          <p className="text-surface-500 text-sm mt-0.5">{asignacion.sede?.localidad}, {asignacion.sede?.provincia}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-surface-50 rounded-xl border border-dashed border-surface-200">
                      <p className="text-surface-500 font-medium">No hay sedes asignadas a este personal</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'remitos' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <StatBox
                    label="Remitos Solicitados"
                    value={personal.estadisticas?.remitosSolicitados || 0}
                    color="blue"
                  />
                  <StatBox
                    label="Remitos Asignados"
                    value={personal.estadisticas?.remitosAsignados || 0}
                    color="emerald"
                  />
                  <StatBox
                    label="Total Movimientos"
                    value={(personal.estadisticas?.remitosSolicitados || 0) + (personal.estadisticas?.remitosAsignados || 0)}
                    color="violet"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors relative ${active
        ? 'border-primary-600 text-primary-600'
        : 'border-transparent text-surface-500 hover:text-surface-900 hover:border-surface-300'
        }`}
    >
      {label}
    </button>
  )
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-1 opacity-80">{label}</p>
      {value ? (
        <p className="text-surface-900 font-medium text-base">
          {value}
        </p>
      ) : (
        <p className="text-surface-400 text-sm italic">No especificado</p>
      )}
    </div>
  )
}

function StatBox({ label, value, color }) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100'
  }

  return (
    <div className={`p-6 rounded-xl border flex flex-col items-center justify-center text-center ${colorStyles[color]}`}>
      <span className="text-4xl font-extrabold tracking-tight mb-2">{value}</span>
      <span className="text-xs font-bold uppercase tracking-wide opacity-80">{label}</span>
    </div>
  )
}
