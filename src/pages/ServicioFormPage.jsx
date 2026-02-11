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
    reset
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

  useEffect(() => {
    cargarDatosIniciales()
  }, [])

  useEffect(() => {
    if (!isEditing && !canCreate('proveedores')) {
      Swal.fire('Sin permisos', 'No tienes permiso para crear servicios', 'error')
      navigate('/proveedores/servicios')
    } else if (isEditing && !canUpdate('proveedores')) {
      Swal.fire('Sin permisos', 'No tienes permiso para editar servicios', 'error')
      navigate('/proveedores/servicios')
    }
  }, [isEditing, canCreate, canUpdate, navigate])

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true)

      // Cargar proveedores, tipos de servicio y sedes en paralelo
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

      // Si es edición, cargar el servicio
      if (isEditing) {
        await cargarServicio()
      }
    } catch (err) {
      console.error('Error cargando datos:', err)
      Swal.fire('Error', 'No se pudieron cargar los datos necesarios', 'error')
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
      Swal.fire('Error', 'No se pudo cargar el servicio', 'error')
      navigate('/proveedores/servicios')
    }
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)

      const servicioData = {
        nombre: data.nombre.trim(),
        id_servicio: data.id_servicio.trim() || null,
        descripcion: data.descripcion.trim() || null,
        proveedor_id: data.proveedor_id,
        tipo_servicio_id: data.tipo_servicio_id,
        activo: data.activo
      }

      if (isEditing) {
        await serviciosAPI.update(id, servicioData)
        await Swal.fire('¡Actualizado!', 'El servicio ha sido actualizado correctamente', 'success')
        navigate('/proveedores/servicios')
      } else {
        // Crear el servicio
        const response = await serviciosAPI.create(servicioData)
        const servicio = normalizeItemResponse(response)
        const nuevoServicioId = servicio.id

        // Asignar servicio a sedes y crear equipos
        if (sedesSeleccionadas.length > 0) {
          console.log('🔧 Asignando servicio a sedes:', {
            servicioId: nuevoServicioId,
            sedes: sedesSeleccionadas
          })

          // Asignar servicio a cada sede (crea relación SedeServicio)
          const promesasAsignacion = sedesSeleccionadas.map(sedeId =>
            sedesAPI.assignService(sedeId, {
              servicio_id: nuevoServicioId,
              fecha_contratacion: new Date().toISOString().split('T')[0],
              activo: true
            }).then(result => {
              console.log(`✅ Servicio asignado a sede ${sedeId}:`, result)
              return result
            }).catch(err => {
              console.error(`❌ Error asignando servicio a sede ${sedeId}:`, err)
              return null
            })
          )

          // Crear equipos en cada sede (crea EquipoServicio)
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

        await Swal.fire('¡Creado!', mensaje, 'success')
        navigate('/proveedores/servicios')
      }
    } catch (err) {
      console.error('Error guardando servicio:', err)
      Swal.fire(
        'Error',
        err.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el servicio`,
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
          onClick={() => navigate('/proveedores/servicios')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          ← Volver a Servicios
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditing ? 'Actualiza la información del servicio' : 'Registra un nuevo servicio de proveedor'}
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl">
        {/* Información del Servicio */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Información del Servicio</h2>

          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Servicio <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                {...register('nombre', {
                  required: 'El nombre del servicio es requerido',
                  minLength: { value: 2, message: 'Debe tener al menos 2 caracteres' },
                  maxLength: { value: 100, message: 'No puede exceder 100 caracteres' }
                })}
                placeholder="Ej: Internet Fibra Óptica"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.nombre && (
                <p className="text-red-600 text-sm mt-1">{errors.nombre.message}</p>
              )}
            </div>

            {/* ID Servicio */}
            <div>
              <label htmlFor="id_servicio" className="block text-sm font-medium text-gray-700 mb-1">
                ID Externo del Servicio
              </label>
              <input
                type="text"
                id="id_servicio"
                {...register('id_servicio', {
                  maxLength: { value: 50, message: 'No puede exceder 50 caracteres' }
                })}
                placeholder="Ej: SRV-12345"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.id_servicio ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.id_servicio && (
                <p className="text-red-600 text-sm mt-1">{errors.id_servicio.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Identificador proporcionado por el proveedor (opcional)</p>
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                {...register('descripcion', {
                  maxLength: { value: 500, message: 'No puede exceder 500 caracteres' }
                })}
                placeholder="Describe las características del servicio..."
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.descripcion ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.descripcion && (
                <p className="text-red-600 text-sm mt-1">{errors.descripcion.message}</p>
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
                Tipo de Servicio <span className="text-red-600">*</span>
              </label>
              <select
                id="tipo_servicio_id"
                {...register('tipo_servicio_id', {
                  required: 'Debe seleccionar un tipo de servicio'
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.tipo_servicio_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Seleccionar tipo --</option>
                {tiposServicio.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
              {errors.tipo_servicio_id && (
                <p className="text-red-600 text-sm mt-1">{errors.tipo_servicio_id.message}</p>
              )}
            </div>

            {/* Asignar a Sedes - Solo en creación */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asignar a Sedes <span className="text-gray-500">(Opcional)</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Selecciona las sedes donde se utilizará este servicio. Se crearán registros de equipos que podrás completar después.
                </p>

                {/* Filtro de búsqueda */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Buscar sedes..."
                    value={sedesFilter}
                    onChange={(e) => setSedesFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Grid de sedes con checkboxes */}
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="space-y-2">
                    {sedes
                      .filter(
                        (sede) =>
                          sede.nombre_sede.toLowerCase().includes(sedesFilter.toLowerCase()) ||
                          sede.localidad?.toLowerCase().includes(sedesFilter.toLowerCase())
                      )
                      .map((sede) => (
                        <label
                          key={sede.id}
                          className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={sedesSeleccionadas.includes(sede.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSedesSeleccionadas([...sedesSeleccionadas, sede.id])
                              } else {
                                setSedesSeleccionadas(sedesSeleccionadas.filter(id => id !== sede.id))
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{sede.nombre_sede}</p>
                            {sede.localidad && (
                              <p className="text-xs text-gray-500">{sede.localidad}</p>
                            )}
                          </div>
                        </label>
                      ))}
                  </div>

                  {sedes.filter(
                    (sede) =>
                      sede.nombre_sede.toLowerCase().includes(sedesFilter.toLowerCase()) ||
                      sede.localidad?.toLowerCase().includes(sedesFilter.toLowerCase())
                  ).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No se encontraron sedes
                    </p>
                  )}
                </div>

                {sedesSeleccionadas.length > 0 && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ {sedesSeleccionadas.length} sede(s) seleccionada(s)
                  </p>
                )}
              </div>
            )}

            {/* Estado Activo */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                {...register('activo')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="activo" className="ml-2 text-sm text-gray-700">
                Servicio activo
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
            {submitting ? 'Guardando...' : isEditing ? 'Actualizar Servicio' : 'Crear Servicio'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/proveedores/servicios')}
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
