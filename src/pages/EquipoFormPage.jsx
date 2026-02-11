import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { equiposServicioAPI, serviciosAPI, sedesAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'
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
    reset
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

  useEffect(() => {
    cargarDatosIniciales()
  }, [])

  useEffect(() => {
    if (!isEditing && !canCreate('proveedores')) {
      Swal.fire('Sin permisos', 'No tienes permiso para crear equipos', 'error')
      navigate('/proveedores/equipos')
    } else if (isEditing && !canUpdate('proveedores')) {
      Swal.fire('Sin permisos', 'No tienes permiso para editar equipos', 'error')
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
      Swal.fire('Error', 'No se pudieron cargar los datos necesarios', 'error')
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
      Swal.fire('Error', 'No se pudo cargar el equipo', 'error')
      navigate('/proveedores/equipos')
    }
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)

      const equipoData = {
        servicio_id: data.servicio_id,
        sede_id: data.sede_id,
        mac: data.mac.trim() || null,
        modelo: data.modelo.trim() || null,
        marca: data.marca.trim() || null,
        numero_serie: data.numero_serie.trim() || null,
        observaciones: data.observaciones.trim() || null,
        activo: data.activo
      }

      if (isEditing) {
        await equiposServicioAPI.update(id, equipoData)
        await Swal.fire('¡Actualizado!', 'El equipo ha sido actualizado correctamente', 'success')
        navigate('/proveedores/equipos')
      } else {
        await equiposServicioAPI.create(equipoData)
        await Swal.fire('¡Creado!', 'El equipo ha sido creado correctamente', 'success')
        navigate('/proveedores/equipos')
      }
    } catch (err) {
      console.error('Error guardando equipo:', err)
      Swal.fire(
        'Error',
        err.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el equipo`,
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
          onClick={() => navigate('/proveedores/equipos')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          ← Volver a Equipos
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Equipo' : 'Nuevo Equipo'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditing ? 'Actualiza la información del equipo' : 'Registra un nuevo equipo de servicio'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Información del Equipo</h2>

          <div className="space-y-4">
            {/* Servicio */}
            <div>
              <label htmlFor="servicio_id" className="block text-sm font-medium text-gray-700 mb-1">
                Servicio <span className="text-red-600">*</span>
              </label>
              <select
                id="servicio_id"
                {...register('servicio_id', {
                  required: 'Debe seleccionar un servicio'
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.servicio_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Seleccionar servicio --</option>
                {servicios.map((servicio) => (
                  <option key={servicio.id} value={servicio.id}>
                    {servicio.nombre} - {servicio.proveedor?.empresa || 'N/A'}
                  </option>
                ))}
              </select>
              {errors.servicio_id && (
                <p className="text-red-600 text-sm mt-1">{errors.servicio_id.message}</p>
              )}
            </div>

            {/* Sede */}
            <div>
              <label htmlFor="sede_id" className="block text-sm font-medium text-gray-700 mb-1">
                Sede <span className="text-red-600">*</span>
              </label>
              <select
                id="sede_id"
                {...register('sede_id', {
                  required: 'Debe seleccionar una sede'
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.sede_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Seleccionar sede --</option>
                {sedes.map((sede) => (
                  <option key={sede.id} value={sede.id}>
                    {sede.nombre_sede} - {sede.localidad}
                  </option>
                ))}
              </select>
              {errors.sede_id && (
                <p className="text-red-600 text-sm mt-1">{errors.sede_id.message}</p>
              )}
            </div>

            {/* MAC */}
            <div>
              <label htmlFor="mac" className="block text-sm font-medium text-gray-700 mb-1">
                Dirección MAC
              </label>
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.mac ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.mac && (
                <p className="text-red-600 text-sm mt-1">{errors.mac.message}</p>
              )}
            </div>

            {/* Marca */}
            <div>
              <label htmlFor="marca" className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <input
                type="text"
                id="marca"
                {...register('marca', {
                  maxLength: { value: 50, message: 'No puede exceder 50 caracteres' }
                })}
                placeholder="Ej: Cisco"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.marca ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.marca && (
                <p className="text-red-600 text-sm mt-1">{errors.marca.message}</p>
              )}
            </div>

            {/* Modelo */}
            <div>
              <label htmlFor="modelo" className="block text-sm font-medium text-gray-700 mb-1">
                Modelo
              </label>
              <input
                type="text"
                id="modelo"
                {...register('modelo', {
                  maxLength: { value: 50, message: 'No puede exceder 50 caracteres' }
                })}
                placeholder="Ej: RV340"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.modelo ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.modelo && (
                <p className="text-red-600 text-sm mt-1">{errors.modelo.message}</p>
              )}
            </div>

            {/* Número de Serie */}
            <div>
              <label htmlFor="numero_serie" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Serie
              </label>
              <input
                type="text"
                id="numero_serie"
                {...register('numero_serie', {
                  maxLength: { value: 50, message: 'No puede exceder 50 caracteres' }
                })}
                placeholder="Ej: SN123456789"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.numero_serie ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.numero_serie && (
                <p className="text-red-600 text-sm mt-1">{errors.numero_serie.message}</p>
              )}
            </div>

            {/* Observaciones */}
            <div>
              <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                id="observaciones"
                {...register('observaciones', {
                  maxLength: { value: 500, message: 'No puede exceder 500 caracteres' }
                })}
                placeholder="Información adicional sobre el equipo..."
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.observaciones ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.observaciones && (
                <p className="text-red-600 text-sm mt-1">{errors.observaciones.message}</p>
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
                Equipo activo
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
            {submitting ? 'Guardando...' : isEditing ? 'Actualizar Equipo' : 'Crear Equipo'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/proveedores/equipos')}
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
