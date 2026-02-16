import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { equiposServicioAPI, serviciosAPI, sedesAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { normalizeApiResponse, normalizeItemResponse } from '../utils/apiResponseNormalizer'
import Swal from 'sweetalert2'

export default function EquipoFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canCreate, canUpdate } = usePermissions()
  const isEditing = !!id

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [servicios, setServicios] = useState([])
  const [sedes, setSedes] = useState([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      servicio_id: '',
      sede_id: '',
      mac: '',
      modelo: '',
      marca: '',
      numero_serie: '',
      observaciones: '',
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
        text: 'No tienes permiso para crear equipos',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      navigate('/proveedores/equipos')
    } else if (isEditing && !canUpdate('proveedores')) {
      Swal.fire({
        title: 'Acceso Denegado',
        text: 'No tienes permiso para editar equipos',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      navigate('/proveedores/equipos')
    }
  }, [isEditing, canCreate, canUpdate, navigate])

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true)

      const [serviciosResponse, sedesResponse] = await Promise.all([
        serviciosAPI.list({ limit: 100, activo: true }),
        sedesAPI.list({ limit: 100, activo: true })
      ])

      const serviciosNormalized = normalizeApiResponse(serviciosResponse)
      const sedesNormalized = normalizeApiResponse(sedesResponse)

      setServicios(serviciosNormalized.data || [])
      setSedes(sedesNormalized.data || [])

      if (isEditing) {
        await cargarEquipo()
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

  const cargarEquipo = async () => {
    try {
      const response = await equiposServicioAPI.getById(id)
      const normalized = normalizeApiResponse(response)
      const equipo = normalized.data

      reset({
        servicio_id: equipo.servicio_id || '',
        sede_id: equipo.sede_id || '',
        mac: equipo.mac || '',
        modelo: equipo.modelo || '',
        marca: equipo.marca || '',
        numero_serie: equipo.numero_serie || '',
        observaciones: equipo.observaciones || '',
        activo: equipo.activo ?? true
      })
    } catch (err) {
      console.error('Error cargando equipo:', err)
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el equipo',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      navigate('/proveedores/equipos')
    }
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)

      const equipoData = {
        servicio_id: data.servicio_id,
        sede_id: data.sede_id,
        mac: data.mac?.trim() || null,
        modelo: data.modelo?.trim() || null,
        marca: data.marca?.trim() || null,
        numero_serie: data.numero_serie?.trim() || null,
        observaciones: data.observaciones?.trim() || null,
        activo: data.activo
      }

      if (isEditing) {
        await equiposServicioAPI.update(id, equipoData)
        await Swal.fire({
          title: 'Actualizado',
          text: 'El equipo ha sido actualizado correctamente',
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
        navigate('/proveedores/equipos')
      } else {
        await equiposServicioAPI.create(equipoData)
        await Swal.fire({
          title: 'Creado',
          text: 'El equipo ha sido creado correctamente',
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
        navigate('/proveedores/equipos')
      }
    } catch (err) {
      console.error('Error guardando equipo:', err)
      Swal.fire({
        title: 'Error',
        text: err.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el equipo`,
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setSubmitting(false)
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
              {isEditing ? 'Editar Equipo' : 'Nuevo Equipo'}
            </h1>
            <p className="text-surface-500 mt-1 font-medium">
              {isEditing ? 'Actualiza los datos del equipo' : 'Registra un nuevo equipo asociado a un servicio'}
            </p>
          </div>
          <button
            onClick={() => navigate('/proveedores/equipos')}
            className="text-surface-500 hover:text-surface-700 font-medium text-sm transition-colors flex items-center gap-2 w-fit bg-white px-4 py-2 rounded-xl border border-surface-200 shadow-sm hover:bg-surface-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Volver
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información de Ubicación y Servicio */}
          <div className="card-base p-6 sm:p-8 bg-white space-y-8">
            <div className="border-b border-surface-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-surface-900">Ubicación y Servicio</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sede */}
              <div className="space-y-1.5">
                <label htmlFor="sede_id" className="text-sm font-bold text-surface-700">
                  Sede de Instalación <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="sede_id"
                    {...register('sede_id', {
                      required: 'Debe seleccionar una sede'
                    })}
                    className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none ${errors.sede_id ? 'border-rose-500' : 'border-surface-200'}`}
                  >
                    <option value="">Seleccionar sede</option>
                    {sedes.map((sede) => (
                      <option key={sede.id} value={sede.id}>
                        {sede.nombre_sede} - {sede.localidad}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-surface-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                {errors.sede_id && <p className="text-xs text-rose-500 font-medium mt-1">{errors.sede_id.message}</p>}
              </div>

              {/* Servicio */}
              <div className="space-y-1.5">
                <label htmlFor="servicio_id" className="text-sm font-bold text-surface-700">
                  Servicio Asociado <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="servicio_id"
                    {...register('servicio_id', {
                      required: 'Debe seleccionar un servicio'
                    })}
                    className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none ${errors.servicio_id ? 'border-rose-500' : 'border-surface-200'}`}
                  >
                    <option value="">Seleccionar servicio</option>
                    {servicios.map((servicio) => (
                      <option key={servicio.id} value={servicio.id}>
                        {servicio.nombre} - {servicio.proveedor?.empresa || 'N/A'}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-surface-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                {errors.servicio_id && <p className="text-xs text-rose-500 font-medium mt-1">{errors.servicio_id.message}</p>}
              </div>
            </div>
          </div>

          {/* Detalles Técnicos */}
          <div className="card-base p-6 sm:p-8 bg-white space-y-8">
            <div className="border-b border-surface-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-surface-900">Detalles Técnicos</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Marca */}
              <div className="space-y-1.5">
                <label htmlFor="marca" className="text-sm font-bold text-surface-700">Marca</label>
                <input
                  type="text"
                  id="marca"
                  {...register('marca', {
                    maxLength: { value: 50, message: 'No puede exceder 50 caracteres' }
                  })}
                  placeholder="Ej: Cisco, Huawei"
                  className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${errors.marca ? 'border-rose-500' : 'border-surface-200'}`}
                />
                {errors.marca && <p className="text-xs text-rose-500 font-medium mt-1">{errors.marca.message}</p>}
              </div>

              {/* Modelo */}
              <div className="space-y-1.5">
                <label htmlFor="modelo" className="text-sm font-bold text-surface-700">Modelo</label>
                <input
                  type="text"
                  id="modelo"
                  {...register('modelo', {
                    maxLength: { value: 50, message: 'No puede exceder 50 caracteres' }
                  })}
                  placeholder="Ej: RV340"
                  className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${errors.modelo ? 'border-rose-500' : 'border-surface-200'}`}
                />
                {errors.modelo && <p className="text-xs text-rose-500 font-medium mt-1">{errors.modelo.message}</p>}
              </div>

              {/* MAC */}
              <div className="space-y-1.5">
                <label htmlFor="mac" className="text-sm font-bold text-surface-700">Dirección MAC</label>
                <input
                  type="text"
                  id="mac"
                  {...register('mac', {
                    pattern: {
                      value: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
                      message: 'Formato inválido (ej: AA:BB:CC:DD:EE:FF)'
                    },
                    maxLength: { value: 17, message: 'No puede exceder 17 caracteres' }
                  })}
                  placeholder="Ej: AA:BB:CC:DD:EE:FF"
                  className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-mono ${errors.mac ? 'border-rose-500' : 'border-surface-200'}`}
                />
                {errors.mac && <p className="text-xs text-rose-500 font-medium mt-1">{errors.mac.message}</p>}
              </div>

              {/* Número de Serie */}
              <div className="space-y-1.5">
                <label htmlFor="numero_serie" className="text-sm font-bold text-surface-700">Número de Serie</label>
                <input
                  type="text"
                  id="numero_serie"
                  {...register('numero_serie', {
                    maxLength: { value: 50, message: 'No puede exceder 50 caracteres' }
                  })}
                  placeholder="Ej: SN123456789"
                  className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${errors.numero_serie ? 'border-rose-500' : 'border-surface-200'}`}
                />
                {errors.numero_serie && <p className="text-xs text-rose-500 font-medium mt-1">{errors.numero_serie.message}</p>}
              </div>

              {/* Observaciones - Full Width */}
              <div className="md:col-span-2 space-y-1.5">
                <label htmlFor="observaciones" className="text-sm font-bold text-surface-700">Observaciones</label>
                <textarea
                  id="observaciones"
                  {...register('observaciones', {
                    maxLength: { value: 500, message: 'No puede exceder 500 caracteres' }
                  })}
                  placeholder="Información adicional sobre el equipo, ubicación específica, etc..."
                  rows={3}
                  className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none ${errors.observaciones ? 'border-rose-500' : 'border-surface-200'}`}
                />
                {errors.observaciones && <p className="text-xs text-rose-500 font-medium mt-1">{errors.observaciones.message}</p>}
              </div>

              {/* Estado Activo - Custom Switch */}
              <div className="md:col-span-2 pt-4 border-t border-surface-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-surface-900">Estado del Equipo</p>
                  <p className="text-xs text-surface-500">Un equipo inactivo no se contabilizará como disponible.</p>
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

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate('/proveedores/equipos')}
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
                isEditing ? 'Guardar Cambios' : 'Crear Equipo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
