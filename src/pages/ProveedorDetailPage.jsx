import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { proveedoresAPI, nivelesServiciosAPI, tiposServicioAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { normalizeItemResponse } from '../utils/apiResponseNormalizer'
import Swal from 'sweetalert2'

export default function ProveedorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canUpdate, canDelete } = usePermissions()

  const [proveedor, setProveedor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [serviciosExpandidos, setServiciosExpandidos] = useState({})
  const [soporteExpandido, setSoporteExpandido] = useState({})
  const [modalNivel, setModalNivel] = useState(false)
  const [nivelEditando, setNivelEditando] = useState(null)
  const [formNivel, setFormNivel] = useState({ tipoServicioId: '', nivel: 1, email: '', telefono: '', web: '' })
  const [savingNivel, setSavingNivel] = useState(false)
  const [tiposServicio, setTiposServicio] = useState([])

  useEffect(() => {
    cargarProveedor()
    cargarTiposServicio()
  }, [id])

  const cargarTiposServicio = async () => {
    try {
      const response = await tiposServicioAPI.list({ limit: 100 })
      const data = response?.data?.rows || response?.data || []
      setTiposServicio(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error cargando tipos de servicio:', err)
    }
  }

  const cargarProveedor = async () => {
    try {
      setLoading(true)
      const response = await proveedoresAPI.getById(id)
      const proveedor = normalizeItemResponse(response)
      setProveedor(proveedor)
    } catch (err) {
      console.error('Error cargando proveedor:', err)
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el proveedor',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setLoading(false)
    }
  }

  const eliminarProveedor = async () => {
    const result = await Swal.fire({
      title: '¿Eliminar proveedor?',
      html: `Se eliminará todo registro de <strong>${proveedor.empresa}</strong>.<br>Esta acción es irreversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'bg-rose-600 text-white px-4 py-2 rounded-lg',
        cancelButton: 'bg-surface-200 text-surface-700 px-4 py-2 rounded-lg ml-2'
      },
      buttonsStyling: false
    })

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Eliminando...',
          text: 'Por favor espere',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
          customClass: { popup: 'rounded-2xl' }
        })

        await proveedoresAPI.delete(proveedor.id)

        await Swal.fire({
          title: 'Eliminado',
          text: 'Proveedor eliminado correctamente',
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
        navigate('/proveedores')
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar: ' + (err.message || 'Error desconocido'),
          icon: 'error',
          customClass: { popup: 'rounded-2xl' }
        })
      }
    }
  }

  const toggleServicio = (servicioId) => {
    setServiciosExpandidos(prev => ({
      ...prev,
      [servicioId]: !prev[servicioId]
    }))
  }

  const toggleSoporte = (tipoId) => {
    setSoporteExpandido(prev => ({
      ...prev,
      [tipoId]: !prev[tipoId]
    }))
  }

  // Agrupar soporteNiveles por tipo de servicio
  const getSoportePorTipo = () => {
    if (!proveedor?.soporteNiveles) return {}
    const agrupado = {}
    proveedor.soporteNiveles.forEach(nivel => {
      const tipoId = nivel.tipo_servicio_id
      const tipoNombre = nivel.tipoServicio?.nombre || 'Sin tipo'
      if (!agrupado[tipoId]) {
        agrupado[tipoId] = { tipoServicio: { id: tipoId, nombre: tipoNombre }, niveles: [] }
      }
      agrupado[tipoId].niveles.push(nivel)
    })
    // Ordenar niveles dentro de cada grupo
    Object.values(agrupado).forEach(grupo => {
      grupo.niveles.sort((a, b) => a.nivel - b.nivel)
    })
    return agrupado
  }

  // Obtener los tipos de servicio disponibles (de los servicios del proveedor)
  const getTiposServicioDisponibles = () => {
    if (!proveedor?.servicios) return []
    const tipos = new Map()
    proveedor.servicios.forEach(s => {
      if (s.tipoServicio && !tipos.has(s.tipoServicio.id)) {
        tipos.set(s.tipoServicio.id, s.tipoServicio)
      }
    })
    return Array.from(tipos.values())
  }

  const abrirModalNivel = (tipoServicio = null, nivel = null) => {
    setNivelEditando(nivel)

    if (nivel) {
      setFormNivel({
        tipoServicioId: nivel.tipo_servicio_id || tipoServicio?.id || '',
        nivel: nivel.nivel,
        email: nivel.email || '',
        telefono: nivel.telefono || '',
        web: nivel.web || ''
      })
    } else {
      setFormNivel({
        tipoServicioId: tipoServicio?.id || '',
        nivel: 1,
        email: '',
        telefono: '',
        web: ''
      })
    }
    setModalNivel(true)
  }

  const cerrarModalNivel = () => {
    setModalNivel(false)
    setNivelEditando(null)
    setFormNivel({ tipoServicioId: '', nivel: 1, email: '', telefono: '', web: '' })
  }

  const guardarNivel = async () => {
    if (!formNivel.tipoServicioId && !nivelEditando) {
      Swal.fire({
        title: 'Datos Incompletos',
        text: 'Debe seleccionar un tipo de servicio',
        icon: 'warning',
        customClass: { popup: 'rounded-2xl' }
      })
      return
    }

    if (!formNivel.email && !formNivel.telefono && !formNivel.web) {
      Swal.fire({
        title: 'Datos Incompletos',
        text: 'Debe proporcionar al menos un medio de contacto: email, teléfono o web',
        icon: 'warning',
        customClass: { popup: 'rounded-2xl' }
      })
      return
    }

    if (!formNivel.nivel) {
      Swal.fire({
        title: 'Datos Incompletos',
        text: 'El nivel es obligatorio',
        icon: 'warning',
        customClass: { popup: 'rounded-2xl' }
      })
      return
    }

    try {
      setSavingNivel(true)
      const nivelData = {
        nivel: parseInt(formNivel.nivel),
        email: formNivel.email?.trim() || null,
        telefono: formNivel.telefono?.trim() || null,
        web: formNivel.web?.trim() || null
      }

      if (nivelEditando) {
        await nivelesServiciosAPI.update(proveedor.id, nivelEditando.id, nivelData)
        await Swal.fire({
          title: 'Actualizado',
          text: 'Nivel de soporte actualizado',
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
      } else {
        await nivelesServiciosAPI.create(proveedor.id, formNivel.tipoServicioId, nivelData)
        await Swal.fire({
          title: 'Creado',
          text: 'Nivel de soporte agregado',
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
      }

      cerrarModalNivel()
      cargarProveedor()
    } catch (err) {
      console.error('Error guardando nivel:', err)
      Swal.fire({
        title: 'Error',
        text: err.message || 'No se pudo guardar el nivel',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setSavingNivel(false)
    }
  }

  const eliminarNivel = async (nivel) => {
    const result = await Swal.fire({
      title: '¿Eliminar nivel?',
      text: `Nivel ${nivel.nivel} - ${nivel.email || nivel.telefono || nivel.web}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'bg-rose-600 text-white px-4 py-2 rounded-lg',
        cancelButton: 'bg-surface-200 text-surface-700 px-4 py-2 rounded-lg ml-2'
      },
      buttonsStyling: false
    })

    if (result.isConfirmed) {
      try {
        await nivelesServiciosAPI.delete(proveedor.id, nivel.id)
        await Swal.fire({
          title: 'Eliminado',
          text: 'Nivel eliminado correctamente',
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
        cargarProveedor()
      } catch (err) {
        console.error('Error eliminando nivel:', err)
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el nivel',
          icon: 'error',
          customClass: { popup: 'rounded-2xl' }
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
          <p className="text-surface-500 font-medium">Cargando detalles...</p>
        </div>
      </div>
    )
  }

  if (!proveedor) {
    return (
      <div className="p-6 sm:p-8 bg-surface-50 min-h-screen">
        <div className="p-8 text-center bg-white rounded-2xl border border-surface-200 shadow-sm max-w-lg mx-auto mt-20">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-rose-800 mb-2">Proveedor no encontrado</h3>
          <p className="text-rose-600 mb-6">El proveedor solicitado no existe o fue eliminado.</p>
          <button
            onClick={() => navigate('/proveedores')}
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
        {/* Header & Nav */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/proveedores')}
            className="text-surface-500 hover:text-primary-600 font-medium text-sm flex items-center gap-2 transition-colors w-fit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Proveedores
          </button>
        </div>

        {/* Main Header Card */}
        <div className="card-base p-6 md:p-8 bg-white flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-surface-900 tracking-tight">
                {proveedor.empresa}
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${proveedor.activo ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                }`}>
                {proveedor.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            {proveedor.direccion && (
              <p className="text-surface-500 font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {proveedor.direccion}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {canUpdate('proveedores') && (
              <button
                onClick={() => navigate(`/proveedores/${proveedor.id}/editar`)}
                className="px-4 py-2 bg-white border border-surface-200 text-surface-700 font-bold rounded-xl hover:bg-surface-50 hover:border-primary-200 hover:text-primary-700 transition-colors text-sm shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Editar
              </button>
            )}
            {canDelete('proveedores') && (
              <button
                onClick={eliminarProveedor}
                className="px-4 py-2 bg-white border border-surface-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-colors text-sm shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Eliminar
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Info & Stats */}
          <div className="space-y-6">
            {/* Information */}
            <div className="card-base p-6 bg-white space-y-4">
              <h3 className="text-sm font-bold text-surface-900 border-b border-surface-100 pb-3 uppercase tracking-wide">
                Información
              </h3>
              <div className="space-y-4">
                {proveedor.direccion && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-surface-50 rounded-lg text-surface-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-surface-500 uppercase">Dirección</p>
                      <p className="text-surface-900 font-medium">{proveedor.direccion}</p>
                    </div>
                  </div>
                )}
                {!proveedor.direccion && (
                  <p className="text-surface-400 text-sm italic">Sin dirección registrada</p>
                )}
              </div>
            </div>

            {/* Related Actions */}
            <div className="card-base p-6 bg-white space-y-3">
              <button
                onClick={() => navigate('/proveedores/servicios', { state: { proveedorId: proveedor.id } })}
                className="w-full text-left px-4 py-3 bg-surface-50 hover:bg-surface-100 rounded-xl transition-colors flex items-center justify-between group"
              >
                <span className="font-bold text-surface-700 text-sm">Ver Servicios</span>
                <span className="text-surface-400 group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <button
                onClick={() => navigate('/proveedores/ejecutivos', { state: { proveedorId: proveedor.id } })}
                className="w-full text-left px-4 py-3 bg-surface-50 hover:bg-surface-100 rounded-xl transition-colors flex items-center justify-between group"
              >
                <span className="font-bold text-surface-700 text-sm">Ver Ejecutivos</span>
                <span className="text-surface-400 group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <button
                onClick={() => navigate('/proveedores/equipos', { state: { proveedorId: proveedor.id } })}
                className="w-full text-left px-4 py-3 bg-surface-50 hover:bg-surface-100 rounded-xl transition-colors flex items-center justify-between group"
              >
                <span className="font-bold text-surface-700 text-sm">Ver Inventario Asociado</span>
                <span className="text-surface-400 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>

          {/* Right Column: Services & Levels + Executives */}
          <div className="lg:col-span-2 space-y-6">
            {/* Services */}
            <div className="card-base bg-white overflow-hidden">
              <div className="p-6 border-b border-surface-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-surface-900">Servicios</h3>
                <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded text-xs font-bold">
                  {proveedor.servicios?.length || 0} Servicios
                </span>
              </div>

              {proveedor.servicios && proveedor.servicios.length > 0 ? (() => {
                // Agrupar servicios por nombre + tipo
                const grupos = {}
                proveedor.servicios.forEach(servicio => {
                  const key = `${servicio.nombre}__${servicio.tipoServicio?.id || 'sin-tipo'}`
                  if (!grupos[key]) {
                    grupos[key] = {
                      nombre: servicio.nombre,
                      tipoServicio: servicio.tipoServicio,
                      servicios: []
                    }
                  }
                  grupos[key].servicios.push(servicio)
                })

                return (
                  <div className="divide-y divide-surface-100">
                    {Object.entries(grupos).map(([key, grupo]) => (
                      <div key={key} className="bg-white">
                        <div
                          className="p-5 flex items-center justify-between cursor-pointer hover:bg-surface-50 transition-colors"
                          onClick={() => toggleServicio(key)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div>
                              <p className="font-bold text-surface-900 text-sm">{grupo.nombre}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-surface-500">{grupo.tipoServicio?.nombre}</span>
                                {grupo.servicios.length > 1 && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-surface-300"></span>
                                    <span className="text-xs text-primary-600 font-semibold">{grupo.servicios.length} instancias</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <svg className={`w-5 h-5 text-surface-400 transition-transform ${serviciosExpandidos[key] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {/* Detalle expandido */}
                        {serviciosExpandidos[key] && (
                          <div className="px-6 pb-6 pt-2 bg-surface-50/50 border-t border-surface-100 shadow-inner">
                            <div className="space-y-3">
                              {grupo.servicios.map(servicio => (
                                <div key={servicio.id} className="bg-white border border-surface-200 rounded-xl p-4 hover:border-primary-200 transition-colors">
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                    {/* ID del servicio */}
                                    {servicio.id_servicio && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-surface-500 uppercase">ID:</span>
                                        <span className="text-sm font-mono text-surface-800 bg-surface-100 px-2 py-0.5 rounded">{servicio.id_servicio}</span>
                                      </div>
                                    )}

                                    {/* Sedes asociadas */}
                                    {servicio.sedesServicio && servicio.sedesServicio.length > 0 ? (
                                      <div className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <div className="flex flex-wrap gap-1">
                                          {servicio.sedesServicio.map(sede => (
                                            <span
                                              key={sede.id}
                                              onClick={() => navigate(`/sedes/${sede.id}`)}
                                              className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium cursor-pointer hover:bg-blue-100 transition-colors"
                                            >
                                              {sede.empresa ? `${sede.empresa.nombre_empresa} - ` : ''}{sede.nombre_sede}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-surface-400 italic">Sin sede asignada</span>
                                    )}
                                  </div>

                                  {/* Descripción */}
                                  {servicio.descripcion && (
                                    <p className="text-xs text-surface-500 mt-2">{servicio.descripcion}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-surface-400 mt-3">
                              Los datos de soporte se gestionan por tipo de servicio en la sección inferior.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })() : (
                <div className="p-8 text-center text-surface-500 bg-surface-50">
                  <p>No se han registrado servicios para este proveedor.</p>
                </div>
              )}
            </div>

            {/* Soporte por Tipo de Servicio */}
            <div className="card-base bg-white overflow-hidden">
              <div className="p-6 border-b border-surface-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-surface-900">Datos de Soporte</h3>
                <div className="flex items-center gap-3">
                  <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-bold">
                    Por Tipo de Servicio
                  </span>
                  <button
                    onClick={() => abrirModalNivel()}
                    className="text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              {(() => {
                const soportePorTipo = getSoportePorTipo()
                const tiposDisponibles = getTiposServicioDisponibles()
                const tiposConSoporte = Object.keys(soportePorTipo)
                const tiposSinSoporte = tiposDisponibles.filter(t => !tiposConSoporte.includes(t.id))

                return (
                  <div className="divide-y divide-surface-100">
                    {/* Tipos CON soporte configurado */}
                    {Object.values(soportePorTipo).map(({ tipoServicio, niveles }) => (
                      <div key={tipoServicio.id} className="bg-white">
                        <div
                          className="p-5 flex items-center justify-between cursor-pointer hover:bg-surface-50 transition-colors"
                          onClick={() => toggleSoporte(tipoServicio.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <div>
                              <p className="font-bold text-surface-900 text-sm">{tipoServicio.nombre}</p>
                              <span className="text-xs text-surface-500">{niveles.length} nivel(es)</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); abrirModalNivel(tipoServicio); }}
                              className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-white border border-primary-200 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                            >
                              + Nivel
                            </button>
                            <svg className={`w-5 h-5 text-surface-400 transition-transform ${soporteExpandido[tipoServicio.id] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {soporteExpandido[tipoServicio.id] && (
                          <div className="px-6 pb-6 pt-2 bg-surface-50/50 border-t border-surface-100 shadow-inner">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {niveles.map(nivel => (
                                <div key={nivel.id} className="bg-white border border-surface-200 p-4 rounded-xl shadow-sm hover:border-primary-200 transition-colors group">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="px-2 py-0.5 bg-surface-900 text-white text-[10px] font-bold uppercase rounded tracking-wider">
                                      Nivel {nivel.nivel}
                                    </span>
                                    <div className="flex gap-1">
                                      <button onClick={() => abrirModalNivel(tipoServicio, nivel)} className="p-1 text-surface-400 hover:bg-amber-50 hover:text-amber-600 group-hover:text-surface-500 rounded transition-colors">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                      </button>
                                      <button onClick={() => eliminarNivel(nivel)} className="p-1 text-surface-400 hover:bg-rose-50 hover:text-rose-600 group-hover:text-surface-500 rounded transition-colors">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    {nivel.email && (
                                      <div className="flex items-center gap-2 text-sm text-surface-600 font-medium">
                                        <svg className="w-3.5 h-3.5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        <span className="truncate">{nivel.email}</span>
                                      </div>
                                    )}
                                    {nivel.telefono && (
                                      <div className="flex items-center gap-2 text-sm text-surface-600">
                                        <svg className="w-3.5 h-3.5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        <span>{nivel.telefono}</span>
                                      </div>
                                    )}
                                    {nivel.web && (
                                      <div className="flex items-center gap-2 text-sm text-surface-600">
                                        <svg className="w-3.5 h-3.5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                        <a href={nivel.web.startsWith('http') ? nivel.web : `https://${nivel.web}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline truncate">{nivel.web}</a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Tipos SIN soporte - invitar a configurar */}
                    {tiposSinSoporte.map(tipo => (
                      <div key={tipo.id} className="p-5 flex items-center justify-between hover:bg-surface-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-surface-100 text-surface-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                          </div>
                          <div>
                            <p className="font-bold text-surface-500 text-sm">{tipo.nombre}</p>
                            <span className="text-xs text-surface-400">Sin soporte configurado</span>
                          </div>
                        </div>
                        <button
                          onClick={() => abrirModalNivel(tipo)}
                          className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-white border border-primary-200 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                        >
                          Configurar
                        </button>
                      </div>
                    ))}

                    {tiposConSoporte.length === 0 && tiposSinSoporte.length === 0 && (
                      <div className="p-8 text-center text-surface-500 bg-surface-50">
                        <p>Agregue servicios primero para poder configurar los datos de soporte.</p>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Executives */}
            <div className="card-base bg-white">
              <div className="p-6 border-b border-surface-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-surface-900">Ejecutivos Asignados</h3>
                <span className="bg-surface-100 text-surface-600 px-2 py-1 rounded text-xs font-bold">
                  {proveedor.ejecutivos?.length || 0}
                </span>
              </div>

              {proveedor.ejecutivos && proveedor.ejecutivos.length > 0 ? (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {proveedor.ejecutivos.map(exec => (
                    <div key={exec.id} className="p-4 rounded-xl border border-surface-200 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center text-surface-500 font-bold text-sm shrink-0">
                        {exec.nombre.charAt(0)}{exec.apellido.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-surface-900 text-sm">{exec.nombre} {exec.apellido}</p>
                        <p className="text-xs text-surface-500 mt-0.5">{exec.email}</p>
                        {exec.telefono && <p className="text-xs text-surface-500">{exec.telefono}</p>}
                        {exec.tipoServicio && (
                          <span className="inline-block mt-2 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                            {exec.tipoServicio.nombre}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-surface-500">
                  <p className="text-sm">No hay ejecutivos de cuenta asignados.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nivel */}
      {modalNivel && (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-surface-900 mb-1">
              {nivelEditando ? 'Editar Nivel de Soporte' : 'Nuevo Nivel de Soporte'}
            </h3>
            <p className="text-sm text-surface-400 mb-6">
              Complete al menos un medio de contacto (email, teléfono o web)
            </p>

            <div className="space-y-4 mb-6">
              {/* Tipo de Servicio dropdown */}
              <div>
                <label className="text-xs font-bold text-surface-700 uppercase mb-1 block">
                  Tipo de Servicio <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formNivel.tipoServicioId}
                  onChange={(e) => setFormNivel({ ...formNivel, tipoServicioId: e.target.value })}
                  disabled={!!nivelEditando}
                  className={`w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm ${nivelEditando ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <option value="">Seleccionar tipo de servicio...</option>
                  {tiposServicio.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Nivel dropdown */}
              <div>
                <label className="text-xs font-bold text-surface-700 uppercase mb-1 block">
                  Nivel de Escalado <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formNivel.nivel}
                  onChange={(e) => setFormNivel({ ...formNivel, nivel: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                >
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Nivel {n}</option>)}
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-surface-700 uppercase mb-1 block">
                  Email <span className="text-surface-400 normal-case font-medium">(opcional)</span>
                </label>
                <input
                  type="email"
                  value={formNivel.email}
                  onChange={(e) => setFormNivel({ ...formNivel, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                  placeholder="soporte@proveedor.com"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="text-xs font-bold text-surface-700 uppercase mb-1 block">
                  Teléfono <span className="text-surface-400 normal-case font-medium">(opcional)</span>
                </label>
                <input
                  type="tel"
                  value={formNivel.telefono}
                  onChange={(e) => setFormNivel({ ...formNivel, telefono: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                  placeholder="(011) 1234-5678"
                />
              </div>

              {/* Web */}
              <div>
                <label className="text-xs font-bold text-surface-700 uppercase mb-1 block">
                  Web <span className="text-surface-400 normal-case font-medium">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={formNivel.web}
                  onChange={(e) => setFormNivel({ ...formNivel, web: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                  placeholder="soporte.proveedor.com"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cerrarModalNivel}
                className="px-4 py-2.5 bg-white border border-surface-200 text-surface-700 font-bold rounded-xl hover:bg-surface-50 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={guardarNivel}
                disabled={savingNivel}
                className="px-4 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 text-sm shadow-lg shadow-primary-900/10 flex items-center gap-2"
              >
                {savingNivel ? 'Guardando...' : 'Guardar Nivel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
