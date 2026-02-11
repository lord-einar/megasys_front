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
    reset
  } = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
      activo: true
    }
  })

  useEffect(() => {
    if (isEditing) {
      cargarTipo()
    }
  }, [id])

  useEffect(() => {
    if (!isEditing && !canCreate('proveedores')) {
      Swal.fire('Sin permisos', 'No tienes permiso para crear tipos de servicio', 'error')
      navigate('/proveedores/tipos-servicio')
    } else if (isEditing && !canUpdate('proveedores')) {
      Swal.fire('Sin permisos', 'No tienes permiso para editar tipos de servicio', 'error')
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
      Swal.fire('Error', 'No se pudo cargar el tipo de servicio', 'error')
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
        descripcion: data.descripcion.trim() || null,
        activo: data.activo
      }

      if (isEditing) {
        await tiposServicioAPI.update(id, tipoData)
        await Swal.fire('¡Actualizado!', 'El tipo de servicio ha sido actualizado correctamente', 'success')
        navigate('/proveedores/tipos-servicio')
      } else {
        await tiposServicioAPI.create(tipoData)
        await Swal.fire('¡Creado!', 'El tipo de servicio ha sido creado correctamente', 'success')
        navigate('/proveedores/tipos-servicio')
      }
    } catch (err) {
      console.error('Error guardando tipo de servicio:', err)
      Swal.fire(
        'Error',
        err.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el tipo de servicio`,
        'error'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <button
          onClick={() => navigate('/proveedores/tipos-servicio')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          ← Volver a Tipos de Servicio
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Tipo de Servicio' : 'Nuevo Tipo de Servicio'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditing ? 'Actualiza la información del tipo' : 'Registra un nuevo tipo de servicio'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Información del Tipo</h2>

          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                {...register('nombre', {
                  required: 'El nombre es requerido',
                  minLength: { value: 2, message: 'Debe tener al menos 2 caracteres' },
                  maxLength: { value: 50, message: 'No puede exceder 50 caracteres' }
                })}
                placeholder="Ej: Internet, Telefonía, Seguridad"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.nombre && (
                <p className="text-red-600 text-sm mt-1">{errors.nombre.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                {...register('descripcion', {
                  maxLength: { value: 200, message: 'No puede exceder 200 caracteres' }
                })}
                placeholder="Describe el tipo de servicio..."
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.descripcion ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.descripcion && (
                <p className="text-red-600 text-sm mt-1">{errors.descripcion.message}</p>
              )}
            </div>

            {/* Estado Activo */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                {...register('activo')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="activo" className="ml-2 text-sm text-gray-700">
                Tipo de servicio activo
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              submitting
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {submitting ? 'Guardando...' : isEditing ? 'Actualizar Tipo' : 'Crear Tipo'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/proveedores/tipos-servicio')}
            disabled={submitting}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
