import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { tiposServicioAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'
import Swal from 'sweetalert2'

export default function TipoServicioFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canCreate, canUpdate } = usePermissions()
  const isEditing = !!id

  const [loading, setLoading] = useState(isEditing)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
      activo: true
    }
  })

  const activo = watch('activo')

  useEffect(() => {
    if (isEditing) {
      cargarTipo()
    }
  }, [id])

  useEffect(() => {
    if (!isEditing && !canCreate('proveedores')) {
      Swal.fire({
        title: 'Acceso Denegado',
        text: 'No tienes permiso para crear tipos de servicio',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      navigate('/proveedores/tipos-servicio')
    } else if (isEditing && !canUpdate('proveedores')) {
      Swal.fire({
        title: 'Acceso Denegado',
        text: 'No tienes permiso para editar tipos de servicio',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      navigate('/proveedores/tipos-servicio')
    }
  }, [isEditing, canCreate, canUpdate, navigate])

  const cargarTipo = async () => {
    try {
      setLoading(true)
      const response = await tiposServicioAPI.getById(id)
      const normalized = normalizeApiResponse(response)
      const tipo = normalized.data

      reset({
        nombre: tipo.nombre || '',
        descripcion: tipo.descripcion || '',
        activo: tipo.activo ?? true
      })
    } catch (err) {
      console.error('Error cargando tipo de servicio:', err)
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el tipo de servicio',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      navigate('/proveedores/tipos-servicio')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)

      const tipoData = {
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim() || null,
        activo: data.activo
      }

      if (isEditing) {
        await tiposServicioAPI.update(id, tipoData)
        await Swal.fire({
          title: 'Actualizado',
          text: 'El tipo de servicio ha sido actualizado correctamente',
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
        navigate('/proveedores/tipos-servicio')
      } else {
        await tiposServicioAPI.create(tipoData)
        await Swal.fire({
          title: 'Creado',
          text: 'El tipo de servicio ha sido creado correctamente',
          icon: 'success',
          timer: 1500,
          customClass: { popup: 'rounded-2xl' }
        })
        navigate('/proveedores/tipos-servicio')
      }
    } catch (err) {
      console.error('Error guardando tipo de servicio:', err)
      Swal.fire({
        title: 'Error',
        text: err.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el tipo de servicio`,
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
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
              {isEditing ? 'Editar Tipo de Servicio' : 'Nuevo Tipo de Servicio'}
            </h1>
            <p className="text-surface-500 mt-1 font-medium">
              {isEditing ? 'Modifica la categoría existente' : 'Crea una nueva categoría para servicios'}
            </p>
          </div>
          <button
            onClick={() => navigate('/proveedores/tipos-servicio')}
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
              <h2 className="text-lg font-bold text-surface-900">Datos de la Categoría</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Nombre */}
              <div className="space-y-1.5">
                <label htmlFor="nombre" className="text-sm font-bold text-surface-700">
                  Nombre de la Categoría <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  </div>
                  <input
                    type="text"
                    id="nombre"
                    {...register('nombre', {
                      required: 'El nombre es requerido',
                      minLength: { value: 2, message: 'Debe tener al menos 2 caracteres' },
                      maxLength: { value: 50, message: 'No puede exceder 50 caracteres' }
                    })}
                    placeholder="Ej: Mantenimiento General"
                    className={`w-full pl-10 pr-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${errors.nombre ? 'border-rose-500' : 'border-surface-200'}`}
                  />
                </div>
                {errors.nombre && <p className="text-xs text-rose-500 font-medium mt-1">{errors.nombre.message}</p>}
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <label htmlFor="descripcion" className="text-sm font-bold text-surface-700">Descripción</label>
                <textarea
                  id="descripcion"
                  {...register('descripcion', {
                    maxLength: { value: 200, message: 'No puede exceder 200 caracteres' }
                  })}
                  placeholder="Breve descripción de los servicios bajo esta categoría..."
                  rows={4}
                  className={`w-full px-4 py-2.5 bg-surface-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none ${errors.descripcion ? 'border-rose-500' : 'border-surface-200'}`}
                />
                {errors.descripcion && <p className="text-xs text-rose-500 font-medium mt-1">{errors.descripcion.message}</p>}
              </div>

              {/* Estado Activo - Custom Switch */}
              <div className="pt-4 border-t border-surface-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-surface-900">Estado</p>
                  <p className="text-xs text-surface-500">Habilitar o deshabilitar esta categoría para nuevos servicios.</p>
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
              onClick={() => navigate('/proveedores/tipos-servicio')}
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
                isEditing ? 'Guardar Cambios' : 'Crear Categoría'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
