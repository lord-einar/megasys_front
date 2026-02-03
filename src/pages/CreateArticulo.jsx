import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { inventarioAPI, tipoArticuloAPI, sedesAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import Swal from 'sweetalert2'

export default function CreateArticulo() {
  const navigate = useNavigate()
  const { canCreate } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [tiposArticulo, setTiposArticulo] = useState([])
  const [sedes, setSedes] = useState([])
  const [formData, setFormData] = useState({
    tipo_articulo_id: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    service_tag: '',
    sede_id: '', // Will be auto-set to Depósito
    estado: 'disponible', // Always new items
    fecha_adquisicion: '',
    observaciones: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!canCreate('inventario')) {
      navigate('/inventario', {
        state: {
          error: 'No tienes permiso para crear artículos de inventario'
        }
      })
    }
  }, [canCreate, navigate])

  useEffect(() => {
    cargarDatosIniciales()
  }, [])

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true)

      // Cargar tipos de artículos - puede ser un array directamente o un objeto con rows/data
      let tiposResponse
      try {
        tiposResponse = await tipoArticuloAPI.list()
      } catch (tiposErr) {
        console.error('Error cargando tipos:', tiposErr)
        // Si falla, intenta con el endpoint /api/tipo-articulo/todos
        tiposResponse = await tipoArticuloAPI.getById ? null : []
      }

      const tipos = tiposResponse?.rows || tiposResponse?.data || tiposResponse || []
      setTiposArticulo(Array.isArray(tipos) ? tipos : [])

      // Cargar sedes (para validación, pero solo Depósito será usado)
      let sedesResponse
      try {
        sedesResponse = await sedesAPI.list({ limit: 100 })
      } catch (sedesErr) {
        console.error('Error cargando sedes:', sedesErr)
        sedesResponse = []
      }

      const sedesData = sedesResponse?.rows || sedesResponse?.data || sedesResponse || []
      setSedes(Array.isArray(sedesData) ? sedesData : [])

      // Auto-seleccionar el Depósito (todos los nuevos artículos van al Depósito)
      const deposito = Array.isArray(sedesData) && sedesData.find(s => s.nombre_sede === 'Depósito')
      if (deposito) {
        setFormData(prev => ({ ...prev, sede_id: deposito.id }))
      } else {
        console.warn('Sede Depósito no encontrada')
      }

      // Si no se cargaron tipos, mostrar error
      if (!Array.isArray(tipos) || tipos.length === 0) {
        Swal.fire('Error', 'No se pudieron cargar los tipos de artículos. Por favor, intenta de nuevo.', 'error')
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
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
      newErrors.sede_id = 'Error: Sede Depósito no encontrada'
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

      await inventarioAPI.create(dataToSend)

      Swal.fire('Éxito', 'Artículo creado correctamente', 'success')
      navigate('/inventario')
    } catch (err) {
      console.error('Error creando artículo:', err)
      Swal.fire('Error', err.message || 'Error al crear el artículo', 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (fieldName) => `
    w-full px-4 py-2 border rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${errors[fieldName] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
  `

  if (!canCreate('inventario')) {
    return <div>Cargando...</div>
  }

  if (loading && tiposArticulo.length === 0) {
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
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Artículo de Inventario</h1>
        <p className="text-gray-600 mt-2">Registra un nuevo artículo en el sistema</p>
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
            {loading ? 'Guardando...' : 'Crear Artículo'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/inventario')}
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
