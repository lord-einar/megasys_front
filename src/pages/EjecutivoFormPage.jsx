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
    reset
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

  useEffect(() => {
    cargarDatosIniciales()
  }, [id]) // Recargar cuando cambia el ID

  useEffect(() => {
    if (!isEditing && !canCreate('proveedores')) {
      Swal.fire('Sin permisos', 'No tienes permiso para crear ejecutivos', 'error')
      navigate('/proveedores/ejecutivos')
    } else if (isEditing && !canUpdate('proveedores')) {
      Swal.fire('Sin permisos', 'No tienes permiso para editar ejecutivos', 'error')
      navigate('/proveedores/ejecutivos')
    }
  }, [isEditing, canCreate, canUpdate, navigate])

  const cargarDatosIniciales = async () => {
    try {
      // Solo mostrar loading si estamos editando y cargando datos del ejecutivo
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
      Swal.fire('Error', 'No se pudieron cargar los datos necesarios', 'error')
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
      Swal.fire('Error', 'No se pudo cargar el ejecutivo', 'error')
      navigate('/proveedores/ejecutivos')
    }
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)

      const ejecutivoData = {
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        email: data.email.trim() || null,
        telefono: data.telefono.trim() || null,
        proveedor_id: data.proveedor_id,
        tipo_servicio_id: data.tipo_servicio_id || null,
        activo: data.activo
      }

      if (isEditing) {
        await ejecutivosAPI.update(id, ejecutivoData)
        await Swal.fire('¡Actualizado!', 'El ejecutivo ha sido actualizado correctamente', 'success')
        navigate('/proveedores/ejecutivos')
      } else {
        await ejecutivosAPI.create(ejecutivoData)
        await Swal.fire('¡Creado!', 'El ejecutivo ha sido creado correctamente', 'success')
        navigate('/proveedores/ejecutivos')
      }
    } catch (err) {
      console.error('Error guardando ejecutivo:', err)
      Swal.fire(
        'Error',
        err.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el ejecutivo`,
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
          onClick={() => navigate('/proveedores/ejecutivos')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          ← Volver a Ejecutivos
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Ejecutivo' : 'Nuevo Ejecutivo'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditing ? 'Actualiza la información del ejecutivo' : 'Registra un nuevo ejecutivo de cuentas'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Información Personal</h2>

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
                placeholder="Ej: Juan"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.nombre && (
                <p className="text-red-600 text-sm mt-1">{errors.nombre.message}</p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                Apellido <span className="text-red-600">*</span>
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.apellido ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.apellido && (
                <p className="text-red-600 text-sm mt-1">{errors.apellido.message}</p>
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
                placeholder="Ej: juan.perez@empresa.com"
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

            {/* Proveedor */}
            <div>
              <label htmlFor="proveedor_id" className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor <span className="text-red-600">*</span>
              </label>
              <select
                id="proveedor_id"
                {...register('proveedor_id', {
                  required: 'Debe seleccionar un proveedor'
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.proveedor_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Seleccionar proveedor --</option>
                {proveedores.map((proveedor) => (
                  <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.empresa}
                  </option>
                ))}
              </select>
              {errors.proveedor_id && (
                <p className="text-red-600 text-sm mt-1">{errors.proveedor_id.message}</p>
              )}
            </div>

            {/* Tipo de Servicio */}
            <div>
              <label htmlFor="tipo_servicio_id" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Servicio <span className="text-gray-500">(Opcional)</span>
              </label>
              <select
                id="tipo_servicio_id"
                {...register('tipo_servicio_id')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Sin especialización --</option>
                {tiposServicio.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Especialización del ejecutivo en un tipo de servicio específico
              </p>
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
                Ejecutivo activo
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
            {submitting ? 'Guardando...' : isEditing ? 'Actualizar Ejecutivo' : 'Crear Ejecutivo'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/proveedores/ejecutivos')}
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
