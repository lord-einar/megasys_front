import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function CreateRemitoPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [personal, setPersonal] = useState([])
  const [sedes, setSedes] = useState([])
  const [inventario, setInventario] = useState([])

  const [formData, setFormData] = useState({
    numero_remito: '',
    fecha: new Date().toISOString().split('T')[0],
    solicitante_id: '',
    tecnico_id: '',
    sede_origen_id: '',
    sede_destino_id: '',
    es_prestamo: false,
    fecha_devolucion_estimada: '',
    observaciones: '',
    articulos: []
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [personalRes, sedesRes, inventarioRes] = await Promise.all([
        api.get('/personal?limit=1000'),
        api.get('/sedes?limit=1000'),
        api.get('/inventario?limit=1000&estado=disponible')
      ])

      setPersonal(personalRes.data.data || [])
      setSedes(sedesRes.data.data || [])
      setInventario(inventarioRes.data.data || [])
      setError(null)
    } catch (err) {
      console.error('Error loading initial data:', err)
      setError('Error al cargar datos iniciales')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.solicitante_id || !formData.tecnico_id || !formData.sede_origen_id || !formData.sede_destino_id) {
      setError('Por favor completa todos los campos requeridos')
      return
    }

    if (formData.articulos.length === 0) {
      setError('Debes agregar al menos un artículo')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await api.post('/remitos', formData)
      setSuccess(true)

      setTimeout(() => {
        navigate(`/remitos/${response.data.data.id}`)
      }, 1500)
    } catch (err) {
      console.error('Error creating remito:', err)
      setError(err.response?.data?.message || 'Error al crear el remito')
    } finally {
      setLoading(false)
    }
  }

  const addArticulo = (articuloId) => {
    const articulo = inventario.find(a => a.id === articuloId)
    if (articulo && !formData.articulos.some(a => a.inventario_id === articuloId)) {
      setFormData(prev => ({
        ...prev,
        articulos: [
          ...prev.articulos,
          {
            inventario_id: articuloId,
            cantidad: 1,
            estado_articulo: articulo.estado,
            observaciones: ''
          }
        ]
      }))
    }
  }

  const removeArticulo = (index) => {
    setFormData(prev => ({
      ...prev,
      articulos: prev.articulos.filter((_, i) => i !== index)
    }))
  }

  if (loading && personal.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Remito</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          ¡Remito creado exitosamente! Redirigiendo...
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {/* Información Básica */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Información del Remito</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Es Préstamo?
              </label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  name="es_prestamo"
                  checked={formData.es_prestamo}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600"
                />
                <label className="text-sm text-gray-600">
                  {formData.es_prestamo ? 'Sí, es un préstamo' : 'No, es una transferencia'}
                </label>
              </div>
            </div>
          </div>

          {formData.es_prestamo && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Estimada de Devolución
              </label>
              <input
                type="date"
                name="fecha_devolucion_estimada"
                value={formData.fecha_devolucion_estimada}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Personal */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Involucrado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Solicitante *
              </label>
              <select
                name="solicitante_id"
                value={formData.solicitante_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona un solicitante</option>
                {personal.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Técnico (Sistemas) *
              </label>
              <select
                name="tecnico_id"
                value={formData.tecnico_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona un técnico</option>
                {personal.filter(p => p.rol?.nombre === 'Sistemas').map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.apellido}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sedes */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ubicaciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sede Origen *
              </label>
              <select
                name="sede_origen_id"
                value={formData.sede_origen_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona una sede</option>
                {sedes.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nombre_sede}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sede Destino *
              </label>
              <select
                name="sede_destino_id"
                value={formData.sede_destino_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona una sede</option>
                {sedes.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nombre_sede}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Artículos */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Artículos</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agregar artículo *
            </label>
            <select
              onChange={(e) => {
                addArticulo(e.target.value)
                e.target.value = ''
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un artículo</option>
              {inventario.map(a => (
                <option key={a.id} value={a.id}>
                  {a.marca} {a.modelo} (#{a.numero_serie || a.service_tag})
                </option>
              ))}
            </select>
          </div>

          {formData.articulos.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Artículo</th>
                    <th className="px-4 py-2 text-left">Estado</th>
                    <th className="px-4 py-2 text-left">Cantidad</th>
                    <th className="px-4 py-2 text-left">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.articulos.map((art, index) => {
                    const articulo = inventario.find(a => a.id === art.inventario_id)
                    return (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">
                          {articulo?.marca} {articulo?.modelo}
                        </td>
                        <td className="px-4 py-2">{art.estado_articulo}</td>
                        <td className="px-4 py-2">{art.cantidad}</td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeArticulo(index)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Observaciones */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Notas adicionales sobre el remito"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Creando...' : 'Crear Remito'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/remitos')}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateRemitoPage
