import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { reclamosAPI, serviciosAPI, sedesAPI, equiposServicioAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'
import Swal from 'sweetalert2'

export default function ReclamoFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canCreate, canUpdate } = usePermissions()
  const isEditing = !!id

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [servicios, setServicios] = useState([])
  const [sedes, setSedes] = useState([])
  const [equipos, setEquipos] = useState([])
  const [sedeSeleccionada, setSedeSeleccionada] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      titulo: '',
      descripcion: '',
      servicio_id: '',
      sede_id: '',
      equipo_id: '',
      prioridad: 'media',
      observaciones: ''
    }
  })

  const sede_id = watch('sede_id')

  useEffect(() => {
    cargarDatosIniciales()
  }, [])

  useEffect(() => {
    if (!isEditing && !canCreate('proveedores')) {
      Swal.fire('Sin permisos', 'No tienes permiso para crear reclamos', 'error')
      navigate('/proveedores/reclamos')
    } else if (isEditing && !canUpdate('proveedores')) {
      Swal.fire('Sin permisos', 'No tienes permiso para editar reclamos', 'error')
      navigate('/proveedores/reclamos')
    }
  }, [isEditing, canCreate, canUpdate, navigate])

  // Cargar equipos cuando cambia la sede
  useEffect(() => {
    if (sede_id) {
      cargarEquiposPorSede(sede_id)
    } else {
      setEquipos([])
    }
  }, [sede_id])

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true)

      // Cargar servicios y sedes en paralelo
      const [serviciosResponse, sedesResponse] = await Promise.all([
        serviciosAPI.list({ limit: 100, activo: true }),
        sedesAPI.list({ limit: 100, activo: true })
      ])

      const serviciosNormalized = normalizeApiResponse(serviciosResponse)
      const sedesNormalized = normalizeApiResponse(sedesResponse)

      setServicios(serviciosNormalized.data || [])
      setSedes(sedesNormalized.data || [])

      // Si es edición, cargar el reclamo
      if (isEditing) {
        await cargarReclamo()
      }
    } catch (err) {
      console.error('Error cargando datos:', err)
      Swal.fire('Error', 'No se pudieron cargar los datos necesarios', 'error')
    } finally {
      setLoading(false)
    }
  }

  const cargarEquiposPorSede = async (sedeId) => {
    try {
      const response = await equiposServicioAPI.list({ sede_id: sedeId, limit: 100 })
      const normalized = normalizeApiResponse(response)
      setEquipos(normalized.data || [])
    } catch (err) {
      console.error('Error cargando equipos:', err)
      setEquipos([])
    }
  }

  const cargarReclamo = async () => {
    try {
      const response = await reclamosAPI.getById(id)
      const normalized = normalizeApiResponse(response)
      const reclamo = normalized.data

      reset({
        titulo: reclamo.titulo || '',
        descripcion: reclamo.descripcion || '',
        servicio_id: reclamo.servicio_id || '',
        sede_id: reclamo.sede_id || '',
        equipo_id: reclamo.equipo_id || '',
        prioridad: reclamo.prioridad || 'media',
        observaciones: reclamo.observaciones || ''
      })

      // Cargar equipos de la sede del reclamo
      if (reclamo.sede_id) {
        await cargarEquiposPorSede(reclamo.sede_id)
      }
    } catch (err) {
      console.error('Error cargando reclamo:', err)
      Swal.fire('Error', 'No se pudo cargar el reclamo', 'error')
      navigate('/proveedores/reclamos')
    }
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)

      const reclamoData = {
        titulo: data.titulo.trim(),
        descripcion: data.descripcion.trim(),
        servicio_id: data.servicio_id,
        sede_id: data.sede_id,
        equipo_id: data.equipo_id || null,
        prioridad: data.prioridad,
        observaciones: data.observaciones.trim() || null
      }

      if (isEditing) {
        await reclamosAPI.update(id, reclamoData)
        await Swal.fire('¡Actualizado!', 'El reclamo ha sido actualizado correctamente', 'success')
        navigate(`/proveedores/reclamos/${id}`)
      } else {
        const response = await reclamosAPI.create(reclamoData)
        const normalized = normalizeApiResponse(response)
        await Swal.fire('¡Creado!', 'El reclamo ha sido creado correctamente', 'success')
        navigate(`/proveedores/reclamos/${normalized.data.id}`)
      }
    } catch (err) {
      console.error('Error guardando reclamo:', err)
      Swal.fire(
        'Error',
        err.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el reclamo`,
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
          onClick={() => navigate('/proveedores/reclamos')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          ← Volver a Reclamos
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Reclamo' : 'Nuevo Reclamo'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditing ? 'Actualiza la información del reclamo' : 'Registra un nuevo reclamo de servicio'}
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl">
        {/* Información del Reclamo */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Información del Reclamo</h2>

          <div className="space-y-4">
            {/* Título */}
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="titulo"
                {...register('titulo', {
                  required: 'El título es requerido',
                  minLength: { value: 5, message: 'Debe tener al menos 5 caracteres' },
                  maxLength: { value: 200, message: 'No puede exceder 200 caracteres' }
                })}
                placeholder="Ej: Falla en conexión a internet"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.titulo ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.titulo && (
                <p className="text-red-600 text-sm mt-1">{errors.titulo.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-red-600">*</span>
              </label>
              <textarea
                id="descripcion"
                {...register('descripcion', {
                  required: 'La descripción es requerida',
                  minLength: { value: 10, message: 'Debe tener al menos 10 caracteres' },
                  maxLength: { value: 1000, message: 'No puede exceder 1000 caracteres' }
                })}
                placeholder="Describe el problema con el mayor detalle posible..."
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.descripcion ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.descripcion && (
                <p className="text-red-600 text-sm mt-1">{errors.descripcion.message}</p>
              )}
            </div>

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

            {/* Equipo (opcional, filtrado por sede) */}
            <div>
              <label htmlFor="equipo_id" className="block text-sm font-medium text-gray-700 mb-1">
                Equipo Relacionado
              </label>
              <select
                id="equipo_id"
                {...register('equipo_id')}
                disabled={!sede_id}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  !sede_id ? 'bg-gray-100' : 'border-gray-300'
                }`}
              >
                <option value="">-- Sin equipo asociado --</option>
                {equipos.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.mac} - {equipo.marca} {equipo.modelo}
                  </option>
                ))}
              </select>
              {!sede_id && (
                <p className="text-xs text-gray-500 mt-1">Selecciona una sede para ver los equipos disponibles</p>
              )}
            </div>

            {/* Prioridad */}
            <div>
              <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad <span className="text-red-600">*</span>
              </label>
              <select
                id="prioridad"
                {...register('prioridad', {
                  required: 'Debe seleccionar una prioridad'
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.prioridad ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
              {errors.prioridad && (
                <p className="text-red-600 text-sm mt-1">{errors.prioridad.message}</p>
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
                  maxLength: { value: 1000, message: 'No puede exceder 1000 caracteres' }
                })}
                placeholder="Información adicional relevante..."
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.observaciones ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.observaciones && (
                <p className="text-red-600 text-sm mt-1">{errors.observaciones.message}</p>
              )}
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
            {submitting ? 'Guardando...' : isEditing ? 'Actualizar Reclamo' : 'Crear Reclamo'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/proveedores/reclamos')}
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
