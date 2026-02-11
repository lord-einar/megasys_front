import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { proveedoresAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'
import Swal from 'sweetalert2'

export default function ProveedorFormPage() {
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
    setValue,
    reset
  } = useForm({
    defaultValues: {
      empresa: '',
      email: '',
      telefono: '',
      direccion: '',
      web: '',
      activo: true
    }
  })

  useEffect(() => {
    if (isEditing) {
      cargarProveedor()
    }
  }, [id])

  useEffect(() => {
    if (!isEditing && !canCreate('proveedores')) {
      Swal.fire('Sin permisos', 'No tienes permiso para crear proveedores', 'error')
      navigate('/proveedores')
    } else if (isEditing && !canUpdate('proveedores')) {
      Swal.fire('Sin permisos', 'No tienes permiso para editar proveedores', 'error')
      navigate('/proveedores')
    }
  }, [isEditing, canCreate, canUpdate, navigate])

  const cargarProveedor = async () => {
    try {
      setLoading(true)
      const response = await proveedoresAPI.getById(id)
      const normalized = normalizeApiResponse(response)
      const proveedor = normalized.data

      reset({
        empresa: proveedor.empresa || '',
        email: proveedor.email || '',
        telefono: proveedor.telefono || '',
        direccion: proveedor.direccion || '',
        web: proveedor.web || '',
        activo: proveedor.activo ?? true
      })
    } catch (err) {
      console.error('Error cargando proveedor:', err)
      Swal.fire('Error', 'No se pudo cargar el proveedor', 'error')
      navigate('/proveedores')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)

      const proveedorData = {
        empresa: data.empresa.trim(),
        email: data.email.trim() || null,
        telefono: data.telefono.trim() || null,
        direccion: data.direccion.trim() || null,
        web: data.web.trim() || null,
        activo: data.activo
      }

      if (isEditing) {
        await proveedoresAPI.update(id, proveedorData)
        await Swal.fire('¡Actualizado!', 'El proveedor ha sido actualizado correctamente', 'success')
        navigate(`/proveedores/${id}`)
      } else {
        const response = await proveedoresAPI.create(proveedorData)
        const normalized = normalizeApiResponse(response)
        await Swal.fire('¡Creado!', 'El proveedor ha sido creado correctamente', 'success')
        navigate(`/proveedores/${normalized.data.id}`)
      }
    } catch (err) {
      console.error('Error guardando proveedor:', err)
      Swal.fire(
        'Error',
        err.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el proveedor`,
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
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/proveedores')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          ← Volver a Proveedores
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditing ? 'Actualiza la información del proveedor' : 'Registra un nuevo proveedor en el sistema'}
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl">
        {/* Información General */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Información General</h2>

          <div className="space-y-4">
            {/* Empresa */}
            <div>
              <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Empresa <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="empresa"
                {...register('empresa', {
                  required: 'El nombre de la empresa es requerido',
                  minLength: { value: 2, message: 'Debe tener al menos 2 caracteres' },
                  maxLength: { value: 100, message: 'No puede exceder 100 caracteres' }
                })}
                placeholder="Ej: Acme Services S.A."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.empresa ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.empresa && (
                <p className="text-red-600 text-sm mt-1">{errors.empresa.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                placeholder="Ej: contacto@empresa.com"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                {...register('telefono', {
                  maxLength: { value: 20, message: 'No puede exceder 20 caracteres' }
                })}
                placeholder="Ej: (011) 1234-5678"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.telefono ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.telefono && (
                <p className="text-red-600 text-sm mt-1">{errors.telefono.message}</p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                id="direccion"
                {...register('direccion', {
                  maxLength: { value: 200, message: 'No puede exceder 200 caracteres' }
                })}
                placeholder="Ej: Av. Corrientes 1234, CABA"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.direccion ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.direccion && (
                <p className="text-red-600 text-sm mt-1">{errors.direccion.message}</p>
              )}
            </div>

            {/* Sitio Web */}
            <div>
              <label htmlFor="web" className="block text-sm font-medium text-gray-700 mb-1">
                Sitio Web
              </label>
              <input
                type="text"
                id="web"
                {...register('web', {
                  maxLength: { value: 200, message: 'No puede exceder 200 caracteres' }
                })}
                placeholder="Ej: www.empresa.com"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.web ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.web && (
                <p className="text-red-600 text-sm mt-1">{errors.web.message}</p>
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
                Proveedor activo
              </label>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
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
            {submitting ? 'Guardando...' : isEditing ? 'Actualizar Proveedor' : 'Crear Proveedor'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/proveedores')}
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
