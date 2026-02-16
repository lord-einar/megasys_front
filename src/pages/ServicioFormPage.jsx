import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { serviciosAPI, proveedoresAPI, tiposServicioAPI, sedesAPI, equiposServicioAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { normalizeApiResponse, normalizeItemResponse } from '../utils/apiResponseNormalizer'
import Swal from 'sweetalert2'

export default function ServicioFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canCreate, canUpdate } = usePermissions()
  const isEditing = !!id

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [proveedores, setProveedores] = useState([])
  const [tiposServicio, setTiposServicio] = useState([])
  const [sedes, setSedes] = useState([])
  const [sedesSeleccionadas, setSedesSeleccionadas] = useState([])
  const [sedesFilter, setSedesFilter] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      nombre: '',
      id_servicio: '',
      descripcion: '',
      proveedor_id: '',
      tipo_servicio_id: '',
      activo: true
    }
  })

  const activo = watch('activo')

  useEffect(() => {
    cargarDatosIniciales()
  }, [])

  useEffect(() => {
    if (!isEditing && !canCreate('proveedores')) {
      Swal.fire({
        title: 'Acceso Denegado',
        text: 'No tienes permiso para crear servicios',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      navigate('/proveedores/servicios')
    } else if (isEditing && !canUpdate('proveedores')) {
      Swal.fire({
        title: 'Acceso Denegado',
        text: 'No tienes permiso para editar servicios',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      navigate('/proveedores/servicios')
    }
  }, [isEditing, canCreate, canUpdate, navigate])

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true)

      const [provResponse, tiposResponse, sedesResponse] = await Promise.all([
        proveedoresAPI.list({ limit: 100, activo: true }),
        tiposServicioAPI.list({ limit: 100, activo: true }),
        sedesAPI.list({ limit: 100, activo: true })
      ])

      const provNormalized = normalizeApiResponse(provResponse)
      const tiposNormalized = normalizeApiResponse(tiposResponse)
      const sedesNormalized = normalizeApiResponse(sedesResponse)

      setProveedores(provNormalized.data || [])
      setTiposServicio(tiposNormalized.data || [])
      setSedes(sedesNormalized.data || [])

      if (isEditing) {
        await cargarServicio()
      }
    } catch (err) {
      console.error('Error cargando datos:', err)
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los datos necesarios',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setLoading(false)
    }
  }

  const cargarServicio = async () => {
    try {
      const response = await serviciosAPI.getById(id)
      const servicio = normalizeItemResponse(response)

      reset({
        nombre: servicio.nombre || '',
        id_servicio: servicio.id_servicio || '',
        descripcion: servicio.descripcion || '',
        proveedor_id: servicio.proveedor_id || '',
        tipo_servicio_id: servicio.tipo_servicio_id || '',
        activo: servicio.activo ?? true
      })
    } catch (err) {
      console.error('Error cargando servicio:', err)
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el servicio',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      navigate('/proveedores/servicios')
    }
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)

      const servicioData = {
        nombre: data.nombre.trim(),
        id_servicio: data.id_servicio?.trim() || null,
        descripcion: data.descripcion?.trim() || null,
        proveedor_id: data.proveedor_id,
        tipo_servicio_id: data.tipo_servicio_id,
        activo: data.activo
      }

      if (isEditing) {
        await serviciosAPI.update(id, servicioData)
        await Swal.fire({
          title: 'Actualizado',
          text: 'El servicio ha sido actualizado correctamente',
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
        navigate('/proveedores/servicios')
      } else {
        const response = await serviciosAPI.create(servicioData)
        const servicio = normalizeItemResponse(response)
        const nuevoServicioId = servicio.id

        if (sedesSeleccionadas.length > 0) {
          const promesasAsignacion = sedesSeleccionadas.map(sedeId =>
            sedesAPI.assignService(sedeId, {
              servicio_id: nuevoServicioId,
              fecha_contratacion: new Date().toISOString().split('T')[0],
              activo: true
            }).catch(err => {
              console.error(`Error asignando servicio a sede ${sedeId}:`, err)
              return null
            })
          )

          const promesasEquipos = sedesSeleccionadas.map(sedeId =>
            equiposServicioAPI.create({
              servicio_id: nuevoServicioId,
              sede_id: sedeId,
              observaciones: 'Equipo creado automáticamente - Pendiente de configurar',
              activo: true
            }).catch(err => {
              console.error(`Error creando equipo en sede ${sedeId}:`, err)
              return null
            })
          )

          await Promise.all([...promesasAsignacion, ...promesasEquipos])
        }

        const mensaje = sedesSeleccionadas.length > 0
          ? `Servicio creado y asignado a ${sedesSeleccionadas.length} sede(s)`
          : 'Servicio creado correctamente'

        await Swal.fire({
          title: 'Creado',
          text: mensaje,
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
        navigate('/proveedores/servicios')
      }
    } catch (err) {
      console.error('Error guardando servicio:', err)
      Swal.fire({
        title: 'Error',
        text: err.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el servicio`,
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setSubmitting(false)
    }
  }

  const toggleSedeSelection = (sedeId) => {
    if (sedesSeleccionadas.includes(sedeId)) {
      setSedesSeleccionadas(sedesSeleccionadas.filter(id => id !== sedeId))
    } else {
      setSedesSeleccionadas([...sedesSeleccionadas, sedeId])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
          <p className="text-surface-500 font-medium">Cargando formulario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
              {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h1>
            <p className="text-surface-500 mt-1 font-medium">
              {isEditing ? 'Actualiza la información del servicio contratado' : 'Registra un nuevo servicio en el catálogo'}
            </p>
          </div>
          <button
            onClick={() => navigate('/proveedores/servicios')}
            className="text-surface-500 hover:text-surface-700 font-medium text-sm transition-colors flex items-center gap-2 w-fit bg-white px-4 py-2 rounded-xl border border-surface-200 shadow-sm hover:bg-surface-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Volver
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información Principal */}
          <div className="card-base p-6 sm:p-8 bg-white space-y-8">
            <div className="border-b border-surface-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-surface-900">Datos del Servicio</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="md:col-span-2 space-y-1.5">
                <label htmlFor="nombre" className="text-sm font-bold text-surface-700">
                  Nombre del Servicio <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <input
                    type="text"
                    id="nombre"
                    {...register('nombre', {
                      required: 'El nombre del servicio es requerido',
                      minLength: { value: 2, message: 'Debe tener al menos 2 caracteres' },
                      maxLength: { value: 100, message: 'No puede exceder 100 caracteres' }
                    })}
                    placeholder="Ej: Conexión Internet Fibra 300Mb"
                    className={`w-full pl-10 pr-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${errors.nombre ? 'border-rose-500' : 'border-surface-200'}`}
                  />
                </div>
                {errors.nombre && <p className="text-xs text-rose-500 font-medium mt-1">{errors.nombre.message}</p>}
              </div>

              {/* Proveedor */}
              <div className="space-y-1.5">
                <label htmlFor="proveedor_id" className="text-sm font-bold text-surface-700">
                  Proveedor <span className="text-rose-500">*</span>
                </label>
                <select
                  id="proveedor_id"
                  {...register('proveedor_id', {
                    required: 'Debe seleccionar un proveedor'
                  })}
                  className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none ${errors.proveedor_id ? 'border-rose-500' : 'border-surface-200'}`}
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map((proveedor) => (
                    <option key={proveedor.id} value={proveedor.id}>
                      {proveedor.empresa}
                    </option>
                  ))}
                </select>
                {errors.proveedor_id && <p className="text-xs text-rose-500 font-medium mt-1">{errors.proveedor_id.message}</p>}
              </div>

              {/* Tipo de Servicio */}
              <div className="space-y-1.5">
                <label htmlFor="tipo_servicio_id" className="text-sm font-bold text-surface-700">
                  Tipo de Servicio <span className="text-rose-500">*</span>
                </label>
                <select
                  id="tipo_servicio_id"
                  {...register('tipo_servicio_id', {
                    required: 'Debe seleccionar un tipo de servicio'
                  })}
                  className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none ${errors.tipo_servicio_id ? 'border-rose-500' : 'border-surface-200'}`}
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposServicio.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
                {errors.tipo_servicio_id && <p className="text-xs text-rose-500 font-medium mt-1">{errors.tipo_servicio_id.message}</p>}
              </div>

              {/* ID Servicio */}
              <div className="space-y-1.5">
                <label htmlFor="id_servicio" className="text-sm font-bold text-surface-700">ID Externo</label>
                <input
                  type="text"
                  id="id_servicio"
                  {...register('id_servicio', {
                    maxLength: { value: 50, message: 'No puede exceder 50 caracteres' }
                  })}
                  placeholder="Ej: SRV-12345"
                  className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${errors.id_servicio ? 'border-rose-500' : 'border-surface-200'}`}
                />
                {errors.id_servicio && <p className="text-xs text-rose-500 font-medium mt-1">{errors.id_servicio.message}</p>}
              </div>

              {/* Descripción - Full Width */}
              <div className="md:col-span-2 space-y-1.5">
                <label htmlFor="descripcion" className="text-sm font-bold text-surface-700">Descripción Detallada</label>
                <textarea
                  id="descripcion"
                  {...register('descripcion', {
                    maxLength: { value: 500, message: 'No puede exceder 500 caracteres' }
                  })}
                  placeholder="Describe las características técnicas o comerciales del servicio..."
                  rows={3}
                  className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none ${errors.descripcion ? 'border-rose-500' : 'border-surface-200'}`}
                />
                {errors.descripcion && <p className="text-xs text-rose-500 font-medium mt-1">{errors.descripcion.message}</p>}
              </div>

              {/* Estado Activo - Custom Switch */}
              <div className="md:col-span-2 pt-4 border-t border-surface-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-surface-900">Estado del Servicio</p>
                  <p className="text-xs text-surface-500">Un servicio inactivo no aparecerá en nuevas selecciones.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    {...register('activo')}
                  />
                  <div className="w-14 h-7 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className={`ml-3 text-sm font-bold ${activo ? 'text-emerald-700' : 'text-surface-500'}`}>
                    {activo ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Selección de Sedes (Solo Crear) */}
          {!isEditing && (
            <div className="card-base p-6 sm:p-8 bg-white space-y-6">
              <div className="border-b border-surface-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-surface-900">Asignar a Sedes</h2>
                  <p className="text-sm text-surface-500">Selecciona las sedes donde se implementará este servicio.</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar sede..."
                    value={sedesFilter}
                    onChange={(e) => setSedesFilter(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {sedes.filter(s =>
                  s.nombre_sede.toLowerCase().includes(sedesFilter.toLowerCase()) ||
                  s.localidad?.toLowerCase().includes(sedesFilter.toLowerCase())
                ).map(sede => {
                  const isSelected = sedesSeleccionadas.includes(sede.id)
                  return (
                    <div
                      key={sede.id}
                      onClick={() => toggleSedeSelection(sede.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${isSelected
                          ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-500/50'
                          : 'bg-white border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                        }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors mt-0.5 ${isSelected ? 'bg-primary-600 border-primary-600' : 'bg-white border-surface-300'
                        }`}>
                        {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${isSelected ? 'text-primary-900' : 'text-surface-700'}`}>{sede.nombre_sede}</p>
                        {sede.localidad && <p className="text-xs text-surface-500">{sede.localidad}</p>}
                      </div>
                    </div>
                  )
                })}

                {sedes.filter(s => s.nombre_sede.toLowerCase().includes(sedesFilter.toLowerCase())).length === 0 && (
                  <div className="col-span-full py-8 text-center text-surface-500 bg-surface-50 rounded-xl border border-dashed border-surface-200">
                    No se encontraron sedes con ese criterio
                  </div>
                )}
              </div>

              {sedesSeleccionadas.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-primary-50 text-primary-700 text-sm font-bold rounded-xl border border-primary-100">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {sedesSeleccionadas.length} sede(s) seleccionada(s)
                </div>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate('/proveedores/servicios')}
              className="btn-secondary w-full sm:w-auto"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full sm:w-auto shadow-lg shadow-primary-900/10"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Guardando...
                </span>
              ) : (
                isEditing ? 'Guardar Cambios' : 'Crear Servicio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
