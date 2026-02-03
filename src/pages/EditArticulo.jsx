import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { inventarioAPI, tipoArticuloAPI, sedesAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import Swal from 'sweetalert2'

export default function EditArticulo() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { canUpdate } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [tiposArticulo, setTiposArticulo] = useState([])
  const [sedes, setSedes] = useState([])
  const [formData, setFormData] = useState({
    tipo_articulo_id: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    service_tag: '',
    sede_id: '',
    estado: 'disponible',
    fecha_adquisicion: '',
    valor_adquisicion: '',
    observaciones: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!canUpdate('inventario')) {
      navigate('/inventario', {
        state: {
          error: 'No tienes permiso para editar artículos de inventario'
        }
      })
    }
  }, [canUpdate, navigate])

  useEffect(() => {
    cargarDatos()
  }, [id])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      // Cargar tipos de artículos
      let tiposResponse
      try {
        tiposResponse = await tipoArticuloAPI.list()
      } catch (tiposErr) {
        console.error('Error cargando tipos:', tiposErr)
        tiposResponse = []
      }

      const tipos = tiposResponse?.rows || tiposResponse?.data || tiposResponse || []
      setTiposArticulo(Array.isArray(tipos) ? tipos : [])

      // Cargar sedes
      let sedesResponse
      try {
        sedesResponse = await sedesAPI.list({ limit: 100 })
      } catch (sedesErr) {
        console.error('Error cargando sedes:', sedesErr)
        sedesResponse = []
      }

      const sedesData = sedesResponse?.rows || sedesResponse?.data || sedesResponse || []
      setSedes(Array.isArray(sedesData) ? sedesData : [])

      // Cargar artículo actual
      try {
        const response = await inventarioAPI.getById(id)
        const item = response?.data || response

        setFormData({
          tipo_articulo_id: item.tipo_articulo_id || '',
          marca: item.marca || '',
          modelo: item.modelo || '',
          numero_serie: item.numero_serie || '',
          service_tag: item.service_tag || '',
          sede_id: item.sede_id || '',
          estado: item.estado || 'disponible',
          fecha_adquisicion: item.fecha_adquisicion ? item.fecha_adquisicion.split('T')[0] : '',
          valor_adquisicion: item.valor_adquisicion || '',
          observaciones: item.observaciones || ''
        })
      } catch (itemErr) {
        console.error('Error cargando artículo:', itemErr)
        Swal.fire('Error', 'No se pudo cargar el artículo', 'error')
      }
    } catch (err) {
      console.error('Error cargando datos:', err)
      Swal.fire('Error', 'No se pudieron cargar los datos: ' + (err.message || 'Error desconocido'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => (
      {
        ...prev,
        [name]: value
      }
    ))
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => (
        {
          ...prev,
          [name]: ''
        }
      ))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.tipo_articulo_id) {
      newErrors.tipo_articulo_id = 'Tipo de artículo es requerido'
    }
    if (!formData.marca.trim()) {
      newErrors.marca = 'Marca es requerida'
    }
    if (!formData.modelo.trim()) {
      newErrors.modelo = 'Modelo es requerido'
    }
    if (!formData.sede_id) {
      newErrors.sede_id = 'Sede es requerida'
    }
    if (formData.fecha_adquisicion && new Date(formData.fecha_adquisicion) > new Date()) {
      newErrors.fecha_adquisicion = 'Fecha no puede ser futura'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      Swal.fire('Error', 'Por favor completa todos los campos requeridos', 'error')
      return
    }

    try {
      setLoading(true)

      // Remove empty optional fields - don't send empty strings
      const dataToSend = { ...formData }

      // Convert empty strings to undefined for optional fields
      if (!dataToSend.numero_serie?.trim()) dataToSend.numero_serie = undefined
      if (!dataToSend.service_tag?.trim()) dataToSend.service_tag = undefined
      if (!dataToSend.fecha_adquisicion) dataToSend.fecha_adquisicion = undefined
      if (!dataToSend.observaciones?.trim()) dataToSend.observaciones = undefined

      // Don't send valor_adquisicion if empty
      if (!dataToSend.valor_adquisicion) dataToSend.valor_adquisicion = undefined

      await inventarioAPI.update(id, dataToSend)

      Swal.fire('Éxito', 'Artículo actualizado correctamente', 'success')
      navigate(`/inventario/${id}`)
    } catch (err) {
      console.error('Error actualizando artículo:', err)
      Swal.fire('Error', err.message || 'Error al actualizar el artículo', 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (fieldName) => `
    w-full px-4 py-2 border rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${errors[fieldName] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
  `

  if (!canUpdate('inventario')) {
    return <div>Cargando...</div>
  }

  if (loading && !formData.marca) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Cargando formulario...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Editar Artículo de Inventario</h1>
        <p className="text-gray-600 mt-2">Modifica los datos del artículo</p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl">

        {/* Tipo de Artículo */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Artículo *
          </label>
          <select
            name="tipo_articulo_id"
            value={formData.tipo_articulo_id}
            onChange={handleChange}
            className={inputClass('tipo_articulo_id')}
            disabled={loading}
          >
            <option value="">Selecciona un tipo</option>
            {tiposArticulo.map(tipo => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
          {errors.tipo_articulo_id && (
            <p className="text-red-500 text-sm mt-1">{errors.tipo_articulo_id}</p>
          )}
        </div>

        {/* Marca y Modelo en una fila */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marca *
            </label>
            <input
              type="text"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              placeholder="ej: Dell, HP, etc."
              className={inputClass('marca')}
              disabled={loading}
            />
            {errors.marca && (
              <p className="text-red-500 text-sm mt-1">{errors.marca}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modelo *
            </label>
            <input
              type="text"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              placeholder="ej: OptiPlex 7090"
              className={inputClass('modelo')}
              disabled={loading}
            />
            {errors.modelo && (
              <p className="text-red-500 text-sm mt-1">{errors.modelo}</p>
            )}
          </div>
        </div>

        {/* Número de Serie y Service Tag */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Serie
            </label>
            <input
              type="text"
              name="numero_serie"
              value={formData.numero_serie}
              onChange={handleChange}
              placeholder="Número de serie del equipo"
              className={inputClass('numero_serie')}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Tag
            </label>
            <input
              type="text"
              name="service_tag"
              value={formData.service_tag}
              onChange={handleChange}
              placeholder="Service tag del fabricante"
              className={inputClass('service_tag')}
              disabled={loading}
            />
          </div>
        </div>

        {/* Sede */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sede *
          </label>
          <select
            name="sede_id"
            value={formData.sede_id}
            onChange={handleChange}
            className={inputClass('sede_id')}
            disabled={loading}
          >
            <option value="">Selecciona una sede</option>
            {sedes.map(sede => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre_sede}
              </option>
            ))}
          </select>
          {errors.sede_id && (
            <p className="text-red-500 text-sm mt-1">{errors.sede_id}</p>
          )}
        </div>

        {/* Estado */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className={inputClass('estado')}
            disabled={loading}
          >
            <option value="disponible">Disponible</option>
            <option value="en_uso">En Uso</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="dado_de_baja">Dado de Baja</option>
            <option value="en_prestamo">En Préstamo</option>
          </select>
        </div>

        {/* Fecha de Adquisición */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Adquisición (Opcional)
          </label>
          <input
            type="date"
            name="fecha_adquisicion"
            value={formData.fecha_adquisicion}
            onChange={handleChange}
            className={inputClass('fecha_adquisicion')}
            disabled={loading}
          />
          {errors.fecha_adquisicion && (
            <p className="text-red-500 text-sm mt-1">{errors.fecha_adquisicion}</p>
          )}
        </div>

        {/* Valor de Adquisición */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor de Adquisición (Opcional)
          </label>
          <input
            type="number"
            name="valor_adquisicion"
            value={formData.valor_adquisicion}
            onChange={handleChange}
            placeholder="Valor en pesos"
            className={inputClass('valor_adquisicion')}
            disabled={loading}
            min="0"
            step="0.01"
          />
        </div>

        {/* Observaciones */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            placeholder="Notas adicionales sobre el equipo"
            rows="4"
            className={inputClass('observaciones')}
            disabled={loading}
          />
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/inventario/${id}`)}
            disabled={loading}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
