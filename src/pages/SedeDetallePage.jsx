import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sedesAPI, authAPI, sedeImagenesAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import TablaInventarioSede from '../components/TablaInventarioSede'

export default function SedeDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canUpdate } = usePermissions()
  const [sede, setSede] = useState(null)
  const [tecnico, setTecnico] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tecnicoLoading, setTecnicoLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('general')
  const [currentUser, setCurrentUser] = useState(null)
  // Imágenes
  const [imagenes, setImagenes] = useState([])
  const [imagenesLoading, setImagenesLoading] = useState(false)
  const [imagenLightbox, setImagenLightbox] = useState(null)
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [tituloImagen, setTituloImagen] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    cargarDatos()
  }, [id])

  useEffect(() => {
    if (activeTab === 'imagenes') cargarImagenes()
  }, [activeTab])

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

  const cargarImagenes = async () => {
    try {
      setImagenesLoading(true)
      const res = await sedeImagenesAPI.list(id)
      setImagenes(res?.data || res || [])
    } catch (err) {
      console.error('Error cargando imágenes:', err)
    } finally {
      setImagenesLoading(false)
    }
  }

  const handleSubirImagen = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setSubiendoImagen(true)
      const res = await sedeImagenesAPI.upload(id, file, tituloImagen)
      const nueva = res?.data || res
      setImagenes(prev => [...prev, nueva])
      setTituloImagen('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      alert(err.message || 'Error al subir la imagen')
    } finally {
      setSubiendoImagen(false)
    }
  }

  const handleEliminarImagen = async (imagenId) => {
    if (!confirm('¿Eliminar esta imagen?')) return
    try {
      await sedeImagenesAPI.delete(id, imagenId)
      setImagenes(prev => prev.filter(img => img.id !== imagenId))
      if (imagenLightbox?.id === imagenId) setImagenLightbox(null)
    } catch (err) {
      alert(err.message || 'Error al eliminar la imagen')
    }
  }

  const cargarTecnico = async () => {
    try {
      setTecnicoLoading(true)
      const response = await sedesAPI.getTecnicoActivo(id)
      setTecnico(response?.data || response)
    } catch (err) {
      // It's ok if there's no assigned technician
      setTecnico(null)
    } finally {
      setTecnicoLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-surface-200 border-t-primary-600 mb-4"></div>
          <p className="text-surface-500 font-medium">Cargando detalles...</p>
        </div>
      </div>
    )
  }

  if (error || !sede) {
    return (
      <div className="p-8 bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm border border-surface-200 text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-surface-900 mb-2">Error al cargar la sede</h2>
          <p className="text-surface-500 mb-6 text-sm">{error || 'No se encontró la sede solicitada.'}</p>
          <button
            onClick={() => navigate('/sedes')}
            className="btn-primary w-full justify-center"
          >
            Volver a Sedes
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/sedes')}
            className="text-surface-500 hover:text-primary-600 font-medium text-sm flex items-center gap-2 transition-colors w-fit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Sedes
          </button>

          <div className="flex items-center gap-3">
            {canUpdate('sedes') && (
              <button
                onClick={() => navigate(`/sedes/${id}/editar`)}
                className="btn-secondary text-sm py-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
            )}
          </div>
        </div>

        {/* Header Card */}
        <div className="card-base bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full translate-x-1/3 -translate-y-1/2 blur-3xl opacity-50 pointer-events-none"></div>

          <div className="p-8 relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 shrink-0 shadow-sm">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">{sede.nombre_sede}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="text-surface-500 font-medium flex items-center gap-1.5 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-surface-400"></span>
                    {sede.empresa?.nombre_empresa || 'Sin empresa'}
                  </span>
                  <span className="text-surface-300">|</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${sede.activo
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                    {sede.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 border-l border-surface-100 pl-6 md:ml-6">
              <div className="text-center">
                <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">Personal</p>
                <p className="text-2xl font-bold text-surface-900">{sede.personalSede?.length || 0}</p>
              </div>
              <div className="text-center pl-4 border-l border-surface-100">
                <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">Inventario</p>
                <p className="text-2xl font-bold text-surface-900">{sede.inventario?.total || 0}</p>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto border-t border-surface-200 px-6">
            <TabButton
              active={activeTab === 'general'}
              onClick={() => setActiveTab('general')}
              label="Información General"
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <TabButton
              active={activeTab === 'personal'}
              onClick={() => setActiveTab('personal')}
              label={`Personal (${sede.personalSede?.length || 0})`}
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>}
            />
            <TabButton
              active={activeTab === 'servicios'}
              onClick={() => setActiveTab('servicios')}
              label={`Servicios (${sede.servicios?.length || 0})`}
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
            <TabButton
              active={activeTab === 'inventario'}
              onClick={() => setActiveTab('inventario')}
              label="Inventario"
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
            />
            <TabButton
              active={activeTab === 'imagenes'}
              onClick={() => setActiveTab('imagenes')}
              label={`Imágenes${imagenes.length > 0 ? ` (${imagenes.length})` : ''}`}
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in-up">
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Ubicación Information */}
                <InfoCard title="Ubicación" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    <InfoItem label="Dirección" value={sede.direccion} />
                    <InfoItem label="Localidad" value={sede.localidad} />
                    <InfoItem label="Provincia" value={sede.provincia} />
                    <InfoItem label="País" value={sede.pais} />
                  </div>
                </InfoCard>

                {/* Contacto e Infraestructura */}
                <InfoCard title="Contacto e Infraestructura" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    <InfoItem label="Teléfono" value={sede.telefono || 'No registrado'} isMono={!!sede.telefono} />
                    <InfoItem label="IP de la Sede" value={sede.ip_sede || 'No registrada'} isMono={!!sede.ip_sede} />
                  </div>
                </InfoCard>

                {/* Audit Info */}
                <div className="text-xs text-surface-400 flex items-center justify-between px-2">
                  <span>Creado: {new Date(sede.created_at).toLocaleDateString('es-AR')}</span>
                  <span>Actualizado: {new Date(sede.updated_at).toLocaleDateString('es-AR')}</span>
                </div>
              </div>

              <div className="space-y-6">
                {/* Técnico de Soporte Asignado */}
                {(currentUser?.roles?.some(r => r.nombre === 'super_admin') || currentUser?.roles?.some(r => r.nombre === 'support')) && (
                  <div className="card-base p-6 border-l-4 border-l-primary-500">
                    <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Técnico Asignado
                    </h3>

                    {tecnicoLoading ? (
                      <div className="py-8 text-center bg-surface-50 rounded-lg">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-surface-300 border-t-primary-600"></div>
                      </div>
                    ) : tecnico?.personal ? (
                      <div className="bg-primary-50/50 rounded-xl p-4 border border-primary-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                            {tecnico.personal.nombre.charAt(0)}{tecnico.personal.apellido.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-surface-900">{tecnico.personal.nombre} {tecnico.personal.apellido}</p>
                            <p className="text-xs text-primary-600 font-medium">Soporte IT</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-surface-600 pl-1">
                          <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <span className="truncate">{tecnico.personal.email}</span>
                          </div>
                          {tecnico.personal.telefono && (
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                              <span>{tecnico.personal.telefono}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 pt-3 border-t border-primary-200/50">
                          <p className="text-[10px] text-surface-400 font-medium uppercase text-center">Asignado el {new Date(tecnico.fecha_asignacion).toLocaleDateString('es-AR')}</p>
                        </div>
                        {currentUser?.roles?.some(r => r.nombre === 'super_admin') && (
                          <button
                            onClick={() => navigate(`/sedes/${id}/asignar-tecnico`)}
                            className="mt-3 w-full py-1.5 text-xs font-bold text-primary-700 hover:text-primary-800 hover:underline transition-all"
                          >
                            Cambiar Técnico
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-surface-50 rounded-xl border border-dashed border-surface-200">
                        <p className="text-surface-500 text-sm mb-3">Sin técnico asignado</p>
                        {currentUser?.roles?.some(r => r.nombre === 'super_admin') && (
                          <button
                            onClick={() => navigate(`/sedes/${id}/asignar-tecnico`)}
                            className="btn-secondary text-xs py-1.5"
                          >
                            Asignar Ahora
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="card-base overflow-hidden">
              {sede.personalSede && sede.personalSede.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-50 border-b border-surface-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">Contacto</th>
                        <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">Rol</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-surface-400 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {sede.personalSede.map((person) => (
                        <tr key={person.id} className="hover:bg-surface-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center text-xs font-bold text-surface-600">
                                {person.nombre[0]}{person.apellido[0]}
                              </div>
                              <p className="font-semibold text-surface-900">{person.nombre} {person.apellido}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-surface-600">{person.email}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
                              {person.rol?.nombre || 'Sin rol'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-primary-600 hover:text-primary-800 font-medium text-sm hover:underline">
                              Ver Perfil
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4 text-surface-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <p className="text-surface-900 font-medium">Sin personal asignado</p>
                  <p className="text-surface-500 text-sm mt-1">No hay empleados registrados en esta sede.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'servicios' && (
            <div className="space-y-6">
              {sede.servicios && sede.servicios.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {sede.servicios.map((servicio) => (
                    <div key={servicio.id} className="card-base overflow-hidden border border-surface-200 hover:shadow-lg transition-all duration-300">
                      {/* Header del Servicio */}
                      <div className="bg-surface-50/50 p-6 border-b border-surface-100 flex flex-col md:flex-row gap-6 md:items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-surface-900">{servicio.nombre}</h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${servicio.SedeServicio?.activo !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-surface-100 text-surface-600 border-surface-200'
                              }`}>
                              {servicio.SedeServicio?.activo !== false ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-surface-600">
                            <p><span className="font-semibold text-surface-800">Proveedor:</span> {servicio.proveedor?.empresa || 'N/A'}</p>
                            <p><span className="font-semibold text-surface-800">Tipo:</span> {servicio.tipoServicio?.nombre || 'Generico'}</p>
                            {(servicio.SedeServicio?.fecha_vencimiento) && (
                              <p className="text-amber-600 font-medium bg-amber-50 px-2 rounded">Vence: {new Date(servicio.SedeServicio.fecha_vencimiento).toLocaleDateString('es-AR')}</p>
                            )}
                          </div>
                          {servicio.descripcion && (
                            <p className="text-sm text-surface-500 mt-2 italic">{servicio.descripcion}</p>
                          )}
                        </div>

                        {servicio.id_servicio && (
                          <div className="text-right">
                            <span className="text-xs font-mono bg-surface-100 text-surface-600 px-2 py-1 rounded border border-surface-200">ID: {servicio.id_servicio}</span>
                          </div>
                        )}
                      </div>

                      {/* Niveles de Soporte */}
                      <div className="p-6">
                        <h4 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          Canales de Soporte
                        </h4>
                        {servicio.proveedor?.soporteNiveles && servicio.proveedor.soporteNiveles.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {servicio.proveedor.soporteNiveles.sort((a, b) => a.nivel - b.nivel).map((nivel) => (
                              <div
                                key={nivel.id}
                                className="rounded-xl border border-surface-200 p-4 hover:border-primary-300 hover:shadow-md transition-all group bg-white"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-xs font-bold text-surface-500 uppercase">Soporte Nivel</span>
                                  <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold border border-primary-200">
                                    {nivel.nivel}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {nivel.email && (
                                    <a
                                      href={`mailto:${nivel.email}`}
                                      className="flex items-center gap-2 text-sm text-surface-600 hover:text-primary-600 transition-colors truncate group/link"
                                    >
                                      <svg className="w-4 h-4 text-surface-400 group-hover/link:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                      <span className="truncate">{nivel.email}</span>
                                    </a>
                                  )}
                                  {nivel.telefono && (
                                    <a
                                      href={`tel:${nivel.telefono}`}
                                      className="flex items-center gap-2 text-sm text-surface-600 hover:text-primary-600 transition-colors truncate group/link"
                                    >
                                      <svg className="w-4 h-4 text-surface-400 group-hover/link:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                      <span className="truncate">{nivel.telefono}</span>
                                    </a>
                                  )}
                                  {nivel.web && (
                                    <a
                                      href={nivel.web.startsWith('http') ? nivel.web : `https://${nivel.web}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-sm text-surface-600 hover:text-primary-600 transition-colors truncate group/link"
                                    >
                                      <svg className="w-4 h-4 text-surface-400 group-hover/link:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                      <span className="truncate">{nivel.web}</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                            <p className="text-amber-700 text-sm font-medium">
                              Sin escalamiento de soporte configurado
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 card-base">
                  <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4 text-surface-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <p className="text-surface-900 font-medium">Sin servicios activos</p>
                  <p className="text-surface-500 text-sm mt-1">Esta sede no cuenta con servicios o contratos registrados.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inventario' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCardSmall label="Total Items" value={sede.inventario?.total || 0} color="blue" />
                <StatCardSmall label="Disponibles" value={sede.inventario?.disponible || 0} color="emerald" />
                <StatCardSmall label="En Uso" value={(sede.inventario?.total || 0) - (sede.inventario?.disponible || 0)} color="amber" />
                <StatCardSmall label="En Préstamo" value={sede.inventario?.prestamosEnEstaSede || sede.prestamosEnSede?.length || 0} color="purple" />
              </div>

              {/* Main Inventory Table */}
              <div className="card-base p-6">
                <h3 className="text-lg font-bold text-surface-900 mb-6">Inventario Asignado</h3>
                <TablaInventarioSede
                  articulos={sede.inventarioSede || []}
                  loading={loading}
                />
              </div>
            </div>
          )}

          {activeTab === 'imagenes' && (
            <div className="space-y-6">
              {/* Upload section — solo soporte e infra */}
              {canUpdate('sedes') && (
                <div className="card-base p-6">
                  <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Subir imagen
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={tituloImagen}
                      onChange={e => setTituloImagen(e.target.value)}
                      placeholder="Título opcional (ej: Rack principal)"
                      className="flex-1 input-base text-sm"
                      disabled={subiendoImagen}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={subiendoImagen}
                      className="btn-primary text-sm py-2 px-4 flex items-center gap-2 shrink-0"
                    >
                      {subiendoImagen ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Agregar imagen
                        </>
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleSubirImagen}
                    />
                  </div>
                </div>
              )}

              {/* Grid de imágenes */}
              <div className="card-base p-6">
                {imagenesLoading ? (
                  <div className="py-12 flex justify-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-surface-200 border-t-primary-600"></div>
                  </div>
                ) : imagenes.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4 text-surface-300">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-surface-900 font-medium">Sin imágenes</p>
                    <p className="text-surface-500 text-sm mt-1">
                      {canUpdate('sedes') ? 'Usá el botón de arriba para subir la primera imagen.' : 'No hay imágenes cargadas para esta sede.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imagenes.map(img => (
                      <div key={img.id} className="group relative rounded-xl overflow-hidden bg-surface-100 aspect-square shadow-sm border border-surface-200 hover:shadow-md transition-all">
                        {/* Thumbnail */}
                        <img
                          src={img.url}
                          alt={img.titulo || img.nombre_original || 'Imagen'}
                          className="w-full h-full object-cover cursor-pointer transition-transform duration-200 group-hover:scale-105"
                          onClick={() => setImagenLightbox(img)}
                        />

                        {/* Fecha de subida — overlay inferior */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 pt-4 pb-1.5 pointer-events-none">
                          {img.titulo && (
                            <p className="text-white text-[11px] font-semibold truncate leading-tight">{img.titulo}</p>
                          )}
                          <p className="text-white/80 text-[10px] leading-tight">
                            {new Date(img.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                          </p>
                        </div>

                        {/* Botón eliminar — solo para soporte e infra */}
                        {canUpdate('sedes') && (
                          <button
                            onClick={() => handleEliminarImagen(img.id)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 shadow-md"
                            title="Eliminar imagen"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Lightbox */}
    {imagenLightbox && (
      <div
        className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
        onClick={() => setImagenLightbox(null)}
      >
        <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setImagenLightbox(null)}
            className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={imagenLightbox.url}
            alt={imagenLightbox.titulo || imagenLightbox.nombre_original || 'Imagen'}
            className="max-h-[80vh] max-w-full rounded-lg shadow-2xl object-contain"
          />
          <div className="mt-3 text-center">
            {imagenLightbox.titulo && (
              <p className="text-white font-medium text-sm">{imagenLightbox.titulo}</p>
            )}
            <p className="text-white/50 text-xs mt-0.5">
              {imagenLightbox.nombre_original} · {new Date(imagenLightbox.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

function InfoCard({ title, icon, children }) {
  return (
    <div className="card-base p-6 h-full bg-white">
      <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-6 flex items-center gap-2">
        <span className="p-1.5 bg-surface-100 rounded-lg text-surface-500">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  )
}

function InfoItem({ label, value, isMono = false }) {
  return (
    <div>
      <p className="text-[10px] uppercase font-bold text-surface-400 tracking-wider mb-1">{label}</p>
      <p className={`text-surface-900 font-medium ${isMono ? 'font-mono text-sm' : ''}`}>{value || '-'}</p>
    </div>
  )
}

function TabButton({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap ${active
        ? 'border-primary-500 text-primary-700 bg-primary-50/10'
        : 'border-transparent text-surface-500 hover:text-surface-800 hover:bg-surface-50'
        }`}
    >
      {icon}
      {label}
    </button>
  )
}

function StatCardSmall({ label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  }

  return (
    <div className={`p-4 rounded-xl border ${colors[color] || colors.blue} flex flex-col items-center justify-center shadow-sm`}>
      <span className="text-2xl font-bold tracking-tight">{value}</span>
      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 mt-1">{label}</span>
    </div>
  )
}
