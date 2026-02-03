import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { personalAPI, sedesAPI, tipoArticuloAPI, inventarioAPI, remitosAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'

function CreateRemitoPage() {
  const navigate = useNavigate()
  const { canCreate } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [numeroRemito, setNumeroRemito] = useState(null)

  const [personal, setPersonal] = useState([])
  const [sedes, setSedes] = useState([])
  const [tiposArticulo, setTiposArticulo] = useState([])
  const [inventarioDisponible, setInventarioDisponible] = useState([])

  const [modalOpen, setModalOpen] = useState(false)
  const [modalArticulos, setModalArticulos] = useState([])
  const [modalArticulosTotal, setModalArticulosTotal] = useState(0)
  const [modalPage, setModalPage] = useState(1)
  const [selectedTipoArticulo, setSelectedTipoArticulo] = useState('')

  const [calendarModalOpen, setCalendarModalOpen] = useState(false)
  const [selectedArticuloIndex, setSelectedArticuloIndex] = useState(null)

  const [formData, setFormData] = useState({
    solicitante_id: '',
    tecnico_id: '',
    sede_origen_id: '',
    sede_destino_id: '',
    fecha: new Date().toISOString().split('T')[0],
    observaciones: '',
    articulos: []
  })

  useEffect(() => {
    if (!canCreate('remitos')) {
      navigate('/remitos', {
        state: {
          error: 'No tienes permiso para crear remitos'
        }
      })
    }
  }, [canCreate, navigate])

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [personalRes, sedesRes, tiposRes] = await Promise.all([
        personalAPI.list({ limit: 100 }),
        sedesAPI.list({ limit: 100 }),
        tipoArticuloAPI.list({ limit: 100 })
      ])

      setPersonal(personalRes.data || [])
      setSedes(sedesRes.data || [])
      setTiposArticulo(tiposRes.data || [])
      setError(null)
    } catch (err) {
      console.error('Error loading initial data:', err)
      setError('Error al cargar datos iniciales')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const fetchArticulosModal = async (page = 1) => {
    if (!selectedTipoArticulo || !formData.sede_origen_id) {
      setError('Selecciona Tipo de Artículo y Sede Origen primero')
      return
    }

    try {
      setLoading(true)
      const response = await remitosAPI.getArticulosDisponibles({
        tipo_articulo_id: selectedTipoArticulo,
        sede_id: formData.sede_origen_id,
        page,
        limit: 50
      })

      setModalArticulos(response.rows || response.data?.rows || [])
      setModalArticulosTotal(response.total || response.data?.total || 0)
      setModalPage(page)
      setModalOpen(true)
      setError(null)
    } catch (err) {
      console.error('Error fetching articulos:', err)
      setError('Error al cargar artículos')
    } finally {
      setLoading(false)
    }
  }

  const selectArticuloFromModal = (articulo) => {
    const newArticulo = {
      inventario_id: articulo.id,
      marca_modelo: `${articulo.marca} ${articulo.modelo}`,
      estado_articulo: articulo.estado,
      es_prestamo: false,
      fecha_devolucion: null
    }

    // Validar que no esté ya en otro remito en tránsito
    setFormData(prev => ({
      ...prev,
      articulos: [...prev.articulos, newArticulo]
    }))

    setModalOpen(false)
  }

  const removeArticulo = (index) => {
    setFormData(prev => ({
      ...prev,
      articulos: prev.articulos.filter((_, i) => i !== index)
    }))
  }

  const toggleEsPrestamo = (index) => {
    setFormData(prev => {
      const updatedArticulos = prev.articulos.map((art, i) => {
        if (i === index) {
          return {
            ...art,
            es_prestamo: !art.es_prestamo,
            fecha_devolucion: art.es_prestamo ? null : art.fecha_devolucion
          }
        }
        return art
      })

      return {
        ...prev,
        articulos: updatedArticulos
      }
    })
  }

  const openCalendarModal = (index) => {
    setSelectedArticuloIndex(index)
    setCalendarModalOpen(true)
  }

  const setFechaDevolucion = (fecha) => {
    if (selectedArticuloIndex !== null) {
      setFormData(prev => {
        const updatedArticulos = [...prev.articulos]
        updatedArticulos[selectedArticuloIndex].fecha_devolucion = fecha
        return {
          ...prev,
          articulos: updatedArticulos
        }
      })
    }
    setCalendarModalOpen(false)
    setSelectedArticuloIndex(null)
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

    // Validar préstamos con fecha de devolución
    for (const art of formData.articulos) {
      if (art.es_prestamo && !art.fecha_devolucion) {
        setError('Debes indicar la fecha de devolución para todos los préstamos')
        return
      }
    }

    try {
      setLoading(true)
      setError(null)

      const response = await remitosAPI.create(formData)
      setNumeroRemito(response.data?.numero_remito)
      setSuccess(true)

      setTimeout(() => {
        navigate(`/remitos/${response.data.id}`)
      }, 2500)
    } catch (err) {
      console.error('Error creating remito:', err)
      setError(err.message || 'Error al crear el remito')
    } finally {
      setLoading(false)
    }
  }

  const modalPages = Math.ceil(modalArticulosTotal / 50)

  if (!canCreate('remitos')) {
    return <div>Cargando...</div>
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
          <div className="font-semibold mb-2">¡Remito creado exitosamente!</div>
          {numeroRemito && <div className="text-sm mb-2">Número de remito: <span className="font-bold text-lg">{numeroRemito}</span></div>}
          <div className="text-sm">Redirigiendo...</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-8">
        {/* Información Básica */}
        <div>
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
          </div>
        </div>

        {/* Personal Involucrado */}
        <div>
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
                    {p.nombre} {p.apellido} - {p.sede?.nombre_sede || 'Sin sede'} ({p.rol?.nombre})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Técnico (Soporte Técnico) *
              </label>
              <select
                name="tecnico_id"
                value={formData.tecnico_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona un técnico</option>
                {personal.filter(p => p.rol?.nombre === 'Soporte Técnico' || p.rol?.nombre === 'Sistemas').map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.apellido}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sedes */}
        <div>
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
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Artículos</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Artículo *
              </label>
              <select
                value={selectedTipoArticulo}
                onChange={(e) => setSelectedTipoArticulo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona un tipo</option>
                {tiposArticulo.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => fetchArticulosModal(1)}
                disabled={!selectedTipoArticulo || !formData.sede_origen_id}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Agregar Artículo
              </button>
            </div>
          </div>

          {formData.articulos.length > 0 && (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Artículo</th>
                    <th className="px-4 py-2 text-left">Estado</th>
                    <th className="px-4 py-2 text-left">Préstamo</th>
                    <th className="px-4 py-2 text-left">Fecha Devolución</th>
                    <th className="px-4 py-2 text-left">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {formData.articulos.map((art, index) => (
                    <tr key={`articulo-${index}-${art.inventario_id}`} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{art.marca_modelo}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          {art.estado_articulo}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={art.es_prestamo}
                            onChange={() => toggleEsPrestamo(index)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </label>
                      </td>
                      <td className="px-4 py-2">
                        {art.es_prestamo ? (
                          <button
                            type="button"
                            onClick={() => openCalendarModal(index)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            {art.fecha_devolucion || 'Seleccionar fecha'}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => removeArticulo(index)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Notas adicionales sobre el remito"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
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

      {/* Modal de Artículos */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-96 flex flex-col">
            <h3 className="text-lg font-bold mb-4">
              Seleccionar Artículo ({modalArticulosTotal} disponibles)
            </h3>

            {modalArticulos.length > 0 ? (
              <>
                <div className="flex-1 overflow-y-auto mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left">Marca/Modelo</th>
                        <th className="px-4 py-2 text-left">S/N</th>
                        <th className="px-4 py-2 text-left">Estado</th>
                        <th className="px-4 py-2 text-left">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {modalArticulos.map(art => (
                        <tr key={art.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{art.marca} {art.modelo}</td>
                          <td className="px-4 py-2 text-sm">{art.numero_serie || art.service_tag || '-'}</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {art.estado}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => selectArticuloFromModal(art)}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              Seleccionar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {modalPages > 1 && (
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => fetchArticulosModal(modalPage - 1)}
                      disabled={modalPage === 1}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-600">
                      Página {modalPage} de {modalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => fetchArticulosModal(modalPage + 1)}
                      disabled={modalPage === modalPages}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No hay artículos disponibles para esta combinación de sede y tipo
              </p>
            )}

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Calendario para Préstamo */}
      {calendarModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Seleccionar Fecha de Devolución</h3>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              defaultValue={formData.articulos[selectedArticuloIndex]?.fecha_devolucion || ''}
              onChange={(e) => setFechaDevolucion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCalendarModalOpen(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateRemitoPage
