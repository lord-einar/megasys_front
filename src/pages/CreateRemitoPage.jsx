import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { personalAPI, sedesAPI, tipoArticuloAPI, remitosAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { usePermissionError } from '../hooks/usePermissionError'
import Swal from 'sweetalert2'

function CreateRemitoPage() {
  const navigate = useNavigate()
  const { canCreate } = usePermissions()

  // Hook para manejar errores de permisos
  usePermissionError()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [personal, setPersonal] = useState([])
  const [sedes, setSedes] = useState([])
  const [tiposArticulo, setTiposArticulo] = useState([])

  const [modalOpen, setModalOpen] = useState(false)
  const [modalArticulos, setModalArticulos] = useState([])
  const [modalArticulosTotal, setModalArticulosTotal] = useState(0)
  const [modalPage, setModalPage] = useState(1)
  const [loadingModal, setLoadingModal] = useState(false)
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
      navigate('/remitos')
    }
  }, [canCreate, navigate])

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [personalRes, sedesRes, tiposRes] = await Promise.all([
        personalAPI.list({ limit: 500 }),
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
      Swal.fire({
        title: 'Atención',
        text: 'Selecciona Tipo de Artículo y Sede Origen primero',
        icon: 'warning',
        customClass: { popup: 'rounded-2xl' }
      })
      return
    }

    try {
      setLoadingModal(true)
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
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los artículos disponibles',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setLoadingModal(false)
    }
  }

  const selectArticuloFromModal = (articulo) => {
    // Validar si ya está seleccionado
    if (formData.articulos.some(a => a.inventario_id === articulo.id)) {
      Swal.fire({
        title: 'Artículo ya agregado',
        text: 'Este artículo ya se encuentra en la lista del remito',
        icon: 'info',
        timer: 1500,
        customClass: { popup: 'rounded-2xl' }
      })
      return
    }

    const newArticulo = {
      inventario_id: articulo.id,
      marca_modelo: `${articulo.marca} ${articulo.modelo}`,
      numero_serie: articulo.numero_serie || articulo.service_tag,
      estado_articulo: articulo.estado,
      es_prestamo: false,
      fecha_devolucion: null
    }

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
          const isPrestamo = !art.es_prestamo
          return {
            ...art,
            es_prestamo: isPrestamo,
            fecha_devolucion: isPrestamo ? null : null // Reset date if toggled off
          }
        }
        return art
      })

      return {
        ...prev,
        articulos: updatedArticulos
      }
    })

    // Si se activa préstamo, abrir modal de fecha automáticamente
    const currentArticulo = formData.articulos[index] // Usar el estado anterior para chequear
    if (!currentArticulo.es_prestamo) {
      openCalendarModal(index)
    }
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
        // Asegurar que es_prestamo esté en true si se setea fecha
        if (fecha) updatedArticulos[selectedArticuloIndex].es_prestamo = true
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
      Swal.fire({
        title: 'Campos Incompletos',
        text: 'Por favor completa todos los campos requeridos (Solicitante, Técnico, Sedes)',
        icon: 'warning',
        customClass: { popup: 'rounded-2xl' }
      })
      return
    }

    if (formData.articulos.length === 0) {
      Swal.fire({
        title: 'Sin Artículos',
        text: 'Debes agregar al menos un artículo al remito',
        icon: 'warning',
        customClass: { popup: 'rounded-2xl' }
      })
      return
    }

    // Validar préstamos con fecha de devolución
    for (const art of formData.articulos) {
      if (art.es_prestamo && !art.fecha_devolucion) {
        Swal.fire({
          title: 'Fecha Faltante',
          text: `El artículo ${art.marca_modelo} está marcado como préstamo pero no tiene fecha de devolución`,
          icon: 'warning',
          customClass: { popup: 'rounded-2xl' }
        })
        return
      }
    }

    try {
      setLoading(true)
      setError(null)

      const response = await remitosAPI.create(formData)

      await Swal.fire({
        title: '¡Remito Creado!',
        text: `El remito ${response.data?.numero_remito || ''} ha sido generado exitosamente.`,
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        customClass: { popup: 'rounded-2xl' }
      })

      navigate(`/remitos/${response.data.id}`)
    } catch (err) {
      console.error('Error creating remito:', err)
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error al crear el remito',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setLoading(false)
    }
  }

  const modalPages = Math.ceil(modalArticulosTotal / 50)

  if (!canCreate('remitos')) {
    return <div className="p-8 text-center text-surface-500">Cargando permisos...</div>
  }

  if (loading && personal.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
          <p className="text-surface-500 font-medium">Preparando formulario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Nuevo Remito</h1>
            <p className="text-surface-500 mt-1 font-medium">Completa los datos para generar un nuevo envío</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/remitos')}
            className="text-surface-500 hover:text-surface-700 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Cancelar y Volver
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna Izquierda: Datos Generales */}
            <div className="space-y-8">
              {/* Información Básica */}
              <div className="card-base p-6 bg-white space-y-6">
                <h2 className="text-lg font-bold text-surface-900 border-b border-surface-100 pb-4 mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-primary-50 text-primary-600 flex items-center justify-center text-xs">1</span>
                  Datos Generales
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                    Fecha de Emisión
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-surface-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                      Solicitante <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="solicitante_id"
                      value={formData.solicitante_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      required
                    >
                      <option value="">Seleccionar persona...</option>
                      {personal.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} {p.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                      Técnico Responsable <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="tecnico_id"
                      value={formData.tecnico_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      required
                    >
                      <option value="">Seleccionar técnico...</option>
                      {personal.filter(p =>
                        p.rol?.nombre === 'Sistemas' || p.rol?.nombre === 'Tecnico sede'
                      ).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} {p.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Ubicaciones */}
              <div className="card-base p-6 bg-white space-y-6">
                <h2 className="text-lg font-bold text-surface-900 border-b border-surface-100 pb-4 mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-primary-50 text-primary-600 flex items-center justify-center text-xs">2</span>
                  Ruta de Envío
                </h2>

                <div className="relative pl-8 space-y-6">
                  {/* Línea conectora */}
                  <div className="absolute left-[11px] top-3 bottom-8 w-0.5 bg-gradient-to-b from-surface-300 to-surface-100"></div>

                  <div className="relative">
                    <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-surface-200 border-2 border-white shadow-sm z-10 flex items-center justify-center text-[10px] font-bold text-surface-600">A</div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                      Sede de Origen <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="sede_origen_id"
                      value={formData.sede_origen_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      required
                    >
                      <option value="">Seleccionar origen...</option>
                      {sedes.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nombre_sede} ({s.localidad})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-primary-100 border-2 border-white shadow-sm z-10 flex items-center justify-center text-[10px] font-bold text-primary-600">B</div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                      Sede de Destino <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="sede_destino_id"
                      value={formData.sede_destino_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      required
                    >
                      <option value="">Seleccionar destino...</option>
                      {sedes.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nombre_sede} ({s.localidad})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div className="card-base p-6 bg-white space-y-4">
                <label className="block text-sm font-semibold text-surface-700">
                  Observaciones Adicionales
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                  placeholder="Notas de entrega, detalles especiales, etc..."
                />
              </div>
            </div>

            {/* Columna Derecha: Selección de Artículos */}
            <div className="space-y-8">
              <div className="card-base p-6 bg-white flex flex-col h-full min-h-[500px]">
                <div className="flex items-center justify-between border-b border-surface-100 pb-4 mb-6">
                  <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-primary-50 text-primary-600 flex items-center justify-center text-xs">3</span>
                    Artículos
                  </h2>
                  <span className="text-xs font-bold bg-surface-100 text-surface-600 px-2 py-1 rounded-md">
                    {formData.articulos.length} agregados
                  </span>
                </div>

                {/* Buscador de artículos */}
                <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 mb-6">
                  <label className="block text-xs font-bold text-surface-500 uppercase mb-2">Agregar Artículo</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <select
                        value={selectedTipoArticulo}
                        onChange={(e) => setSelectedTipoArticulo(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none"
                      >
                        <option value="">Tipo de Artículo...</option>
                        {tiposArticulo.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.nombre}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-surface-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchArticulosModal(1)}
                      disabled={!selectedTipoArticulo || !formData.sede_origen_id}
                      className="bg-primary-600 hover:bg-primary-700 disabled:bg-surface-300 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      Buscar
                    </button>
                  </div>
                  {!formData.sede_origen_id && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Selecciona primero la Sede de Origen
                    </p>
                  )}
                </div>

                {/* Lista de artículos */}
                <div className="flex-1 overflow-y-auto min-h-[200px] border border-surface-200 rounded-xl bg-surface-50/30">
                  {formData.articulos.length > 0 ? (
                    <div className="divide-y divide-surface-200">
                      {formData.articulos.map((art, index) => (
                        <div key={`idx-${index}`} className="p-4 hover:bg-white transition-colors group">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-surface-900 text-sm">{art.marca_modelo}</p>
                              <p className="text-xs text-surface-500 font-mono mt-0.5">S/N: {art.numero_serie || 'N/A'}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeArticulo(index)}
                              className="text-surface-400 hover:text-rose-500 transition-colors p-1"
                              title="Quitar artículo"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-4 mt-3">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <div className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-colors ${art.es_prestamo ? 'bg-violet-500 justify-end' : 'bg-surface-300 justify-start'}`} onClick={() => toggleEsPrestamo(index)}>
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                              </div>
                              <span className={`text-xs font-bold ${art.es_prestamo ? 'text-violet-700' : 'text-surface-600'}`}>
                                {art.es_prestamo ? 'Préstamo' : 'Transferencia'}
                              </span>
                            </label>

                            {art.es_prestamo && (
                              <button
                                type="button"
                                onClick={() => openCalendarModal(index)}
                                className={`text-xs font-medium px-2 py-1 rounded border flex items-center gap-1.5 transition-colors ${art.fecha_devolucion ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 animate-pulse'}`}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {art.fecha_devolucion ? new Date(art.fecha_devolucion).toLocaleDateString('es-AR') : 'Definir Fecha'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-surface-400 p-8">
                      <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      <p className="text-sm font-medium text-center">No hay artículos agregados</p>
                      <p className="text-xs text-center mt-1">Utiliza el buscador superior para añadir equipos</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6 border-t border-surface-200">
            <button
              type="button"
              onClick={() => navigate('/remitos')}
              className="btn-secondary w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingModal}
              className="btn-primary w-full sm:w-auto shadow-lg shadow-primary-900/10 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generando Remito...
                </>
              ) : (
                'Crear Remito y Finalizar'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Artículos */}
      {modalOpen && (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-surface-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-surface-900">
                Seleccionar Artículo <span className="text-surface-400 text-sm font-normal ml-2">({modalArticulosTotal} encontrados)</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-surface-400 hover:text-surface-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {loadingModal ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
              </div>
            ) : modalArticulos.length > 0 ? (
              <>
                <div className="flex-1 overflow-y-auto p-2">
                  <div className="grid gap-2">
                    {modalArticulos.map(art => (
                      <div key={art.id} className="p-3 rounded-xl border border-surface-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all flex items-center justify-between group">
                        <div>
                          <p className="font-bold text-surface-900 text-sm">{art.marca} {art.modelo}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-mono bg-surface-100 text-surface-600 px-1.5 py-0.5 rounded border border-surface-200">
                              {art.numero_serie || art.service_tag || 'S/N'}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500">
                              {art.estado}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectArticuloFromModal(art)}
                          className="px-3 py-1.5 bg-white border border-surface-200 text-primary-600 font-bold text-xs rounded-lg hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all shadow-sm"
                        >
                          Seleccionar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination - Simplified */}
                <div className="p-4 border-t border-surface-100 flex justify-between items-center bg-surface-50 rounded-b-2xl">
                  <button
                    onClick={() => fetchArticulosModal(modalPage - 1)}
                    disabled={modalPage === 1}
                    className="px-3 py-1.5 bg-white border border-surface-200 text-surface-600 rounded-lg text-xs font-bold disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-xs font-medium text-surface-500">Página {modalPage} de {Math.ceil(modalArticulosTotal / 50)}</span>
                  <button
                    onClick={() => fetchArticulosModal(modalPage + 1)}
                    disabled={modalPage >= Math.ceil(modalArticulosTotal / 50)}
                    className="px-3 py-1.5 bg-white border border-surface-200 text-surface-600 rounded-lg text-xs font-bold disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-surface-500">
                <p className="font-medium">No se encontraron artículos disponibles</p>
                <p className="text-sm mt-1">Verifique la sede de origen y el tipo seleccionado</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Calendario */}
      {calendarModalOpen && (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-surface-900 mb-4">Fecha de Devolución</h3>
            <p className="text-sm text-surface-500 mb-4">Indica cuándo se espera el retorno de este equipo.</p>

            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              defaultValue={formData.articulos[selectedArticuloIndex]?.fecha_devolucion || ''}
              onChange={(e) => setFechaDevolucion(e.target.value)}
              className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-surface-900 font-medium mb-6"
            />

            <button
              type="button"
              onClick={() => setCalendarModalOpen(false)}
              className="w-full py-2.5 bg-surface-100 text-surface-600 font-bold rounded-xl hover:bg-surface-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateRemitoPage
