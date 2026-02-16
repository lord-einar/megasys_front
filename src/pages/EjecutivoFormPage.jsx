import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ejecutivosAPI, proveedoresAPI, tiposServicioAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { normalizeApiResponse, normalizeItemResponse } from '../utils/apiResponseNormalizer'
import Swal from 'sweetalert2'

export default function EjecutivoFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canCreate, canUpdate } = usePermissions()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [proveedores, setProveedores] = useState([])
  const [tiposServicio, setTiposServicio] = useState([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      proveedor_id: '',
      tipo_servicio_id: '',
      activo: true
    }
  })

  const activo = watch('activo')

  useEffect(() => {
    cargarDatosIniciales()
  }, [id])

  useEffect(() => {
    if (!isEditing && !canCreate('proveedores')) {
      Swal.fire({
        title: 'Acceso Denegado',
        text: 'No tienes permiso para crear ejecutivos',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      navigate('/proveedores/ejecutivos')
    } else if (isEditing && !canUpdate('proveedores')) {
      Swal.fire({
        title: 'Acceso Denegado',
        text: 'No tienes permiso para editar ejecutivos',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      navigate('/proveedores/ejecutivos')
    }
  }, [isEditing, canCreate, canUpdate, navigate])

  const cargarDatosIniciales = async () => {
    try {
      if (isEditing) {
        setLoading(true)
      }

      const [proveedoresResponse, tiposResponse] = await Promise.all([
        proveedoresAPI.list({ limit: 100, activo: true }),
        tiposServicioAPI.list({ limit: 100, activo: true })
      ])

      const proveedoresNormalized = normalizeApiResponse(proveedoresResponse)
      const tiposNormalized = normalizeApiResponse(tiposResponse)

      setProveedores(proveedoresNormalized.data || [])
      setTiposServicio(tiposNormalized.data || [])

      if (isEditing) {
        await cargarEjecutivo()
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
      if (isEditing) {
        setLoading(false)
      }
    }
  }

  const cargarEjecutivo = async () => {
    try {
      const response = await ejecutivosAPI.getById(id)
      const ejecutivo = normalizeItemResponse(response)

      reset({
        nombre: ejecutivo.nombre || '',
        apellido: ejecutivo.apellido || '',
        email: ejecutivo.email || '',
        telefono: ejecutivo.telefono || '',
        proveedor_id: ejecutivo.proveedor_id || '',
        tipo_servicio_id: ejecutivo.tipo_servicio_id || '',
        activo: ejecutivo.activo ?? true
      })
    } catch (err) {
      console.error('Error cargando ejecutivo:', err)
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el ejecutivo',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      navigate('/proveedores/ejecutivos')
    }
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)

      const ejecutivoData = {
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        email: data.email?.trim() || null,
        telefono: data.telefono?.trim() || null,
        proveedor_id: data.proveedor_id,
        tipo_servicio_id: data.tipo_servicio_id || null,
        activo: data.activo
      }

      if (isEditing) {
        await ejecutivosAPI.update(id, ejecutivoData)
        await Swal.fire({
          title: 'Actualizado',
          text: 'El ejecutivo ha sido actualizado correctamente',
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
        navigate('/proveedores/ejecutivos')
      } else {
        await ejecutivosAPI.create(ejecutivoData)
        await Swal.fire({
          title: 'Creado',
          text: 'El ejecutivo ha sido creado correctamente',
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
        navigate('/proveedores/ejecutivos')
      }
    } catch (err) {
      console.error('Error guardando ejecutivo:', err)
      Swal.fire({
        title: 'Error',
        text: err.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el ejecutivo`,
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
              {isEditing ? 'Editar Ejecutivo' : 'Nuevo Ejecutivo'}
            </h1>
            <p className="text-surface-500 mt-1 font-medium">
              {isEditing ? 'Actualiza los datos del contacto' : 'Registra un nuevo contacto clave'}
            </p>
          </div>
          <button
            onClick={() => navigate('/proveedores/ejecutivos')}
            className="text-surface-500 hover:text-surface-700 font-medium text-sm transition-colors flex items-center gap-2 w-fit bg-white px-4 py-2 rounded-xl border border-surface-200 shadow-sm hover:bg-surface-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Volver
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información Personal */}
          <div className="card-base p-6 sm:p-8 bg-white space-y-8">
            <div className="border-b border-surface-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-surface-900">Datos Personales y de Contacto</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-1.5">
                <label htmlFor="nombre" className="text-sm font-bold text-surface-700">
                  Nombre <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input
                    type="text"
                    id="nombre"
                    {...register('nombre', {
                      required: 'El nombre es requerido',
                      minLength: { value: 2, message: 'Debe tener al menos 2 caracteres' },
                      maxLength: { value: 50, message: 'No puede exceder 50 caracteres' }
                    })}
                    placeholder="Ej: Juan"
                    className={`w-full pl-10 pr-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${errors.nombre ? 'border-rose-500' : 'border-surface-200'}`}
                  />
                </div>
                {errors.nombre && <p className="text-xs text-rose-500 font-medium mt-1">{errors.nombre.message}</p>}
              </div>

              {/* Apellido */}
              <div className="space-y-1.5">
                <label htmlFor="apellido" className="text-sm font-bold text-surface-700">
                  Apellido <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="apellido"
                  {...register('apellido', {
                    required: 'El apellido es requerido',
                    minLength: { value: 2, message: 'Debe tener al menos 2 caracteres' },
                    maxLength: { value: 50, message: 'No puede exceder 50 caracteres' }
                  })}
                  placeholder="Ej: Pérez"
                  className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${errors.apellido ? 'border-rose-500' : 'border-surface-200'}`}
                />
                {errors.apellido && <p className="text-xs text-rose-500 font-medium mt-1">{errors.apellido.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-bold text-surface-700">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    {...register('email', {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                    placeholder="Ej: juan.perez@empresa.com"
                    className={`w-full pl-10 pr-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${errors.email ? 'border-rose-500' : 'border-surface-200'}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-500 font-medium mt-1">{errors.email.message}</p>}
              </div>

              {/* Teléfono */}
              <div className="space-y-1.5">
                <label htmlFor="telefono" className="text-sm font-bold text-surface-700">Teléfono</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <input
                    type="tel"
                    id="telefono"
                    {...register('telefono', {
                      maxLength: { value: 20, message: 'No puede exceder 20 caracteres' }
                    })}
                    placeholder="Ej: (011) 1234-5678"
                    className={`w-full pl-10 pr-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${errors.telefono ? 'border-rose-500' : 'border-surface-200'}`}
                  />
                </div>
                {errors.telefono && <p className="text-xs text-rose-500 font-medium mt-1">{errors.telefono.message}</p>}
              </div>
            </div>
          </div>

          {/* Asociación */}
          <div className="card-base p-6 sm:p-8 bg-white space-y-8">
            <div className="border-b border-surface-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-surface-900">Asociación Laboral</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  Especialidad <span className="text-surface-400 font-normal">(Opcional)</span>
                </label>
                <select
                  id="tipo_servicio_id"
                  {...register('tipo_servicio_id')}
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none"
                >
                  <option value="">Sin especialización</option>
                  {tiposServicio.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado Activo - Custom Switch */}
              <div className="md:col-span-2 pt-4 border-t border-surface-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-surface-900">Estado del Ejecutivo</p>
                  <p className="text-xs text-surface-500">Un ejecutivo inactivo no aparecerá como contacto disponible.</p>
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
              onClick={() => navigate('/proveedores/ejecutivos')}
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
                isEditing ? 'Guardar Cambios' : 'Crear Ejecutivo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
