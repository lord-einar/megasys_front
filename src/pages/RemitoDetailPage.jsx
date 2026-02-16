import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { remitosAPI } from '../services/api'
import Swal from 'sweetalert2'
import { usePermissions } from '../hooks/usePermissions'

function RemitoDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [remito, setRemito] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [changingState, setChangingState] = useState(false)
  const [newState, setNewState] = useState('')
  const [selectedDetalles, setSelectedDetalles] = useState([])
  const [showDevolucionModal, setShowDevolucionModal] = useState(false)
  const [devolviendoArticulos, setDevolviendoArticulos] = useState(false)
  const [editingLoanId, setEditingLoanId] = useState(null)
  const [editingDate, setEditingDate] = useState('')
  const [markingReturned, setMarkingReturned] = useState(false)
  const [reenviandoEmails, setReenviandoEmails] = useState(false)
  // Estado para modal de procesamiento de devolución
  const [showProcesarDevolucionModal, setShowProcesarDevolucionModal] = useState(false)
  const [itemsDevolucion, setItemsDevolucion] = useState({})
  const [procesandoDevolucion, setProcesandoDevolucion] = useState(false)
  const [showReceptorModal, setShowReceptorModal] = useState(false)
  const [receptorNombre, setReceptorNombre] = useState('')
  const [receptorEmail, setReceptorEmail] = useState('')
  const [asignandoReceptor, setAsignandoReceptor] = useState(false)
  const { canUpdate } = usePermissions()

  useEffect(() => {
    cargarDetalle()
  }, [id])

  const cargarDetalle = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await remitosAPI.getById(id)
      setRemito(response.data)
    } catch (err) {
      console.error('Error cargando remito:', err)
      setError(err.message || 'Error al cargar remito')
      Swal.fire({
        title: 'Error',
        text: err.message || 'No se pudo cargar el remito',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadgeClass = (estado) => {
    const baseClass = 'px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit'
    switch (estado) {
      case 'preparado':
        return `${baseClass} bg-amber-50 text-amber-700 border-amber-100`
      case 'en_transito':
        return `${baseClass} bg-blue-50 text-blue-700 border-blue-100`
      case 'entregado':
        return `${baseClass} bg-emerald-50 text-emerald-700 border-emerald-100`
      case 'completado':
        return `${baseClass} bg-purple-50 text-purple-700 border-purple-100`
      case 'devuelto_parcial':
        return `${baseClass} bg-orange-50 text-orange-700 border-orange-100`
      case 'devuelto':
        return `${baseClass} bg-violet-50 text-violet-700 border-violet-100`
      case 'cancelado':
        return `${baseClass} bg-rose-50 text-rose-700 border-rose-100`
      default:
        return `${baseClass} bg-surface-100 text-surface-600 border-surface-200`
    }
  }

  const getEstadoLabel = (estado) => {
    const labels = {
      preparado: 'Preparado',
      en_transito: 'En Tránsito',
      entregado: 'Entregado',
      completado: 'Completado',
      devuelto_parcial: 'Devuelto Parcial',
      devuelto: 'Devuelto',
      cancelado: 'Cancelado'
    }
    return labels[estado] || estado
  }

  const getTransicionesValidas = () => {
    if (!remito) return []
    // Si el remito tiene préstamos, no se permite cambiar directamente a 'devuelto'
    // desde el selector de estados. Se usa el modal de procesamiento de devolución.
    const tienePrestamos = remito.es_prestamo || remito.detalles?.some(d => d.es_prestamo)
    const transiciones = {
      'preparado': ['en_transito', 'cancelado'],
      'en_transito': ['entregado', 'cancelado'],
      'entregado': tienePrestamos
        ? ['completado', 'cancelado']
        : ['completado', 'devuelto', 'cancelado'],
      'completado': tienePrestamos ? [] : ['devuelto'],
      'devuelto_parcial': [],
      'devuelto': [],
      'cancelado': []
    }
    return transiciones[remito.estado] || []
  }

  // Verificar si se puede mostrar el botón de procesar devolución
  const canProcesarDevolucion = () => {
    if (!remito) return false
    const estadosPermitidos = ['entregado', 'completado', 'devuelto_parcial']
    if (!estadosPermitidos.includes(remito.estado)) return false
    return getPrestamosNoDevueltos().length > 0
  }

  // Inicializar items del modal de devolución
  const abrirModalProcesarDevolucion = () => {
    const prestamosNoDevueltos = getPrestamosNoDevueltos()
    const initial = {}
    prestamosNoDevueltos.forEach(d => {
      initial[d.id] = {
        accion: 'devolver',
        nueva_fecha: ''
      }
    })
    setItemsDevolucion(initial)
    setShowProcesarDevolucionModal(true)
  }

  const handleProcesarDevolucion = async () => {
    const items = Object.entries(itemsDevolucion).map(([detalle_id, data]) => ({
      detalle_id,
      accion: data.accion,
      ...(data.accion === 'extender' ? { nueva_fecha: data.nueva_fecha } : {})
    }))

    // Validar que los que extienden tengan fecha
    const sinFecha = items.filter(i => i.accion === 'extender' && !i.nueva_fecha)
    if (sinFecha.length > 0) {
      Swal.fire({
        title: 'Error',
        text: 'Debes especificar una nueva fecha para los artículos que deseas extender',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      return
    }

    try {
      setProcesandoDevolucion(true)
      const response = await remitosAPI.procesarDevolucion(id, items)
      const resultado = response.data

      let mensaje = ''
      if (resultado.articulos_devueltos > 0) {
        mensaje += `${resultado.articulos_devueltos} artículo(s) devuelto(s). `
      }
      if (resultado.articulos_extendidos > 0) {
        mensaje += `${resultado.articulos_extendidos} préstamo(s) extendido(s). `
      }
      if (resultado.prestamos_pendientes > 0) {
        mensaje += `${resultado.prestamos_pendientes} préstamo(s) pendiente(s).`
      }

      Swal.fire({
        title: 'Devolución Procesada',
        html: `<p>${mensaje}</p><p class="mt-2 text-sm text-gray-500">Estado del remito: <strong>${getEstadoLabel(resultado.estado_nuevo)}</strong></p>`,
        icon: 'success',
        customClass: { popup: 'rounded-2xl' }
      })

      setShowProcesarDevolucionModal(false)
      setItemsDevolucion({})
      await cargarDetalle()
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error al procesar devolución',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setProcesandoDevolucion(false)
    }
  }

  const handleCambiarEstado = async () => {
    if (!newState) {
      Swal.fire({
        title: 'Error',
        text: 'Selecciona un nuevo estado',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      return
    }

    try {
      setChangingState(true)
      await remitosAPI.cambiarEstado(id, newState)
      Swal.fire({
        title: 'Éxito',
        text: 'Estado del remito actualizado correctamente',
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        customClass: { popup: 'rounded-2xl' }
      })
      setNewState('')
      await cargarDetalle()
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error al cambiar el estado',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setChangingState(false)
    }
  }

  const handleSeleccionarDetalle = (detalleId) => {
    if (selectedDetalles.includes(detalleId)) {
      setSelectedDetalles(selectedDetalles.filter(id => id !== detalleId))
    } else {
      setSelectedDetalles([...selectedDetalles, detalleId])
    }
  }

  const handleGenerarDevolucion = async () => {
    if (selectedDetalles.length === 0) {
      Swal.fire({
        title: 'Error',
        text: 'Selecciona al menos un artículo para devolver',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
      return
    }

    try {
      setDevolviendoArticulos(true)
      const response = await remitosAPI.devolver(id, selectedDetalles)

      const remitoDevolucion = response.data
      Swal.fire({
        title: 'Éxito',
        html: `Remito de devolución <strong>${remitoDevolucion.numero_remito}</strong> creado correctamente`,
        icon: 'success',
        customClass: { popup: 'rounded-2xl' }
      })

      setShowDevolucionModal(false)
      setSelectedDetalles([])
      await cargarDetalle()
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error al generar remito de devolución',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setDevolviendoArticulos(false)
    }
  }

  const canGenerarDevolucion = () => {
    if (!remito) return false
    // Solo se pueden devolver artículos de remitos en estado 'en_transito'
    return remito.estado === 'en_transito' && remito.es_prestamo
  }

  const getPrestamosNoDevueltos = () => {
    if (!remito || !remito.detalles) return []
    return remito.detalles.filter(d => d.es_prestamo && !d.devuelto)
  }

  const handleEditarFecha = (detalle) => {
    setEditingLoanId(detalle.id)
    setEditingDate(detalle.fecha_devolucion_esperada?.split('T')[0] || '')
  }

  const handleGuardarFecha = async () => {
    if (!editingDate) {
      Swal.fire('Error', 'Por favor selecciona una fecha', 'error')
      return
    }

    try {
      setMarkingReturned(true)
      await remitosAPI.actualizarFechaDevolucion(id, editingLoanId, editingDate)
      Swal.fire({
        title: 'Éxito',
        text: 'Fecha de devolución actualizada',
        icon: 'success',
        timer: 1500,
        customClass: { popup: 'rounded-2xl' }
      })
      setEditingLoanId(null)
      setEditingDate('')
      await cargarDetalle()
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error al actualizar la fecha',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setMarkingReturned(false)
    }
  }

  const handleMarcarDevuelto = async (detalleId) => {
    const confirm = await Swal.fire({
      title: '¿Marcar como devuelto?',
      text: 'Esta acción marcará el artículo como devuelto',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, devolver',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'bg-emerald-600 text-white px-4 py-2 rounded-lg',
        cancelButton: 'bg-surface-200 text-surface-700 px-4 py-2 rounded-lg ml-2'
      },
      buttonsStyling: false
    })

    if (!confirm.isConfirmed) return

    try {
      setMarkingReturned(true)
      // Usar el endpoint de devolver con solo este detalle
      await remitosAPI.devolver(id, [detalleId])
      Swal.fire({
        title: 'Éxito',
        text: 'Artículo marcado como devuelto',
        icon: 'success',
        timer: 1500,
        customClass: { popup: 'rounded-2xl' }
      })
      await cargarDetalle()
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error al marcar como devuelto',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setMarkingReturned(false)
    }
  }

  const handleReenviarEmails = async () => {
    const confirm = await Swal.fire({
      title: '¿Reenviar emails?',
      text: 'Se reenviará el remito a infraestructura y al solicitante',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, reenviar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'bg-primary-600 text-white px-4 py-2 rounded-lg',
        cancelButton: 'bg-surface-200 text-surface-700 px-4 py-2 rounded-lg ml-2'
      },
      buttonsStyling: false
    })

    if (!confirm.isConfirmed) return

    try {
      setReenviandoEmails(true)
      await remitosAPI.reenviarEmails(id)
      Swal.fire({
        title: 'Éxito',
        text: 'Emails reenviados exitosamente',
        icon: 'success',
        timer: 1500,
        customClass: { popup: 'rounded-2xl' }
      })
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error al reenviar emails',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setReenviandoEmails(false)
    }
  }

  const handleAsignarReceptor = async () => {
    if (!receptorNombre.trim() || !receptorEmail.trim()) {
      Swal.fire('Error', 'Por favor completa todos los campos', 'error')
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(receptorEmail)) {
      Swal.fire('Error', 'El email no es válido', 'error')
      return
    }

    try {
      setAsignandoReceptor(true)
      await remitosAPI.asignarReceptor(id, receptorNombre, receptorEmail)
      Swal.fire({
        title: 'Éxito',
        html: `Receptor asignado exitosamente.<br><br>Se han enviado emails a:<br>- ${receptorEmail} (receptor)<br>- ${remito.solicitante?.email} (solicitante)`,
        icon: 'success',
        customClass: { popup: 'rounded-2xl' }
      })
      setShowReceptorModal(false)
      setReceptorNombre('')
      setReceptorEmail('')
      await cargarDetalle()
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error al asignar receptor',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setAsignandoReceptor(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
          <p className="text-surface-500 font-medium">Cargando remito...</p>
        </div>
      </div>
    )
  }

  if (error || !remito) {
    return (
      <div className="p-6 sm:p-8 bg-surface-50 min-h-screen">
        <div className="p-8 text-center bg-white rounded-2xl border border-surface-200 shadow-sm max-w-lg mx-auto mt-20">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-rose-800 mb-2">No se pudo cargar el remito</h3>
          <p className="text-rose-600 mb-6">{error || 'El remito solicitado no existe o fue eliminado.'}</p>
          <button
            onClick={() => navigate('/remitos')}
            className="btn-primary w-full"
          >
            Volver a la Lista
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/remitos')}
            className="text-surface-500 hover:text-primary-600 font-medium text-sm flex items-center gap-2 transition-colors w-fit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Remitos
          </button>

          <div className="flex gap-3">
            {/* Acciones Globales */}
            {remito && remito.estado !== 'preparado' && remito.estado !== 'completado' && canUpdate('remitos') && (
              <button
                onClick={handleReenviarEmails}
                disabled={reenviandoEmails}
                className="bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 font-bold py-2 px-4 rounded-xl text-sm transition-colors flex items-center gap-2"
              >
                {reenviandoEmails ? 'Enviando...' : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Reenviar Email
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Header del Remito */}
        <div className="card-base p-6 md:p-8 bg-white flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-surface-900 tracking-tight">
                Remito {remito.numero_remito}
              </h1>
              <span className={getEstadoBadgeClass(remito.estado)}>
                {getEstadoLabel(remito.estado)}
              </span>
            </div>
            <p className="text-surface-500 font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {new Date(remito.fecha).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${remito.es_prestamo ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-surface-100 text-surface-600 border-surface-200'}`}>
              {remito.es_prestamo ? 'Préstamo' : 'Transferencia'}
            </span>
            <span className="text-sm font-bold text-surface-500 bg-surface-50 px-3 py-1.5 rounded-lg border border-surface-200">
              {remito.detalles?.length || 0} Artículos
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detalles de Involucrados */}
          <div className="card-base p-6 bg-white space-y-6">
            <h3 className="text-sm font-bold text-surface-900 border-b border-surface-100 pb-3 uppercase tracking-wide">
              Involucrados
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-surface-500 uppercase">Solicitante</p>
                <p className="text-surface-900 font-medium">{remito.solicitante?.nombre} {remito.solicitante?.apellido}</p>
                <p className="text-surface-500 text-sm">{remito.solicitante?.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-surface-500 uppercase">Técnico Asignado</p>
                <p className="text-surface-900 font-medium">{remito.tecnicoAsignado?.nombre} {remito.tecnicoAsignado?.apellido}</p>
                <p className="text-surface-500 text-sm">{remito.tecnicoAsignado?.email}</p>
              </div>
            </div>

            {/* Receptor Alternativo */}
            {remito.receptor_nombre && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-900 text-sm">Receptor Asignado</p>
                    <p className="text-emerald-800 font-medium">{remito.receptor_nombre}</p>
                    <p className="text-emerald-700 text-xs">{remito.receptor_email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ruta / Sedes */}
          <div className="card-base p-6 bg-white space-y-6">
            <h3 className="text-sm font-bold text-surface-900 border-b border-surface-100 pb-3 uppercase tracking-wide">
              Ruta de Envío
            </h3>
            <div className="flex items-center gap-6 relative">
              {/* Connecting Line */}
              <div className="absolute left-[19px] top-10 bottom-4 w-0.5 bg-gradient-to-b from-primary-200 to-primary-100 -z-10"></div>

              <div className="space-y-8 w-full">
                {/* Origen */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-100 border-4 border-white shadow-sm flex items-center justify-center text-surface-500 shrink-0 z-10">
                    <span className="font-bold text-xs">DESDE</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-surface-500 uppercase mb-0.5">Sede Origen</p>
                    <p className="text-surface-900 font-bold text-lg">{remito.sedeOrigen?.nombre_sede}</p>
                    <p className="text-surface-500 text-sm flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {remito.sedeOrigen?.localidad}, {remito.sedeOrigen?.provincia}
                    </p>
                  </div>
                </div>

                {/* Destino */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 border-4 border-white shadow-sm flex items-center justify-center text-primary-600 shrink-0 z-10">
                    <span className="font-bold text-xs">HACIA</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-surface-500 uppercase mb-0.5">Sede Destino</p>
                    <p className="text-surface-900 font-bold text-lg">{remito.sedeDestino?.nombre_sede}</p>
                    <p className="text-surface-500 text-sm flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {remito.sedeDestino?.localidad}, {remito.sedeDestino?.provincia}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Artículos */}
        <div className="card-base bg-white overflow-hidden shadow-sm border border-surface-200">
          <div className="p-6 border-b border-surface-100 bg-surface-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
              <span className="bg-primary-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs shadow-sm shadow-primary-900/10">{remito.detalles?.length || 0}</span>
              Artículos Incluidos
            </h3>

            {/* Botón Generar Devolución (Solo si corresponde) */}
            {canGenerarDevolucion() && getPrestamosNoDevueltos().length > 0 && (
              <button
                onClick={() => setShowDevolucionModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors shadow-lg shadow-emerald-900/10 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                Generar Devolución
              </button>
            )}

            {/* Botón Procesar Devolución (modal granular por artículo) */}
            {canProcesarDevolucion() && canUpdate('remitos') && (
              <button
                onClick={abrirModalProcesarDevolucion}
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors shadow-lg shadow-violet-900/10 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                Procesar Devolución
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-surface-50 border-b border-surface-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">Artículo</th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">Serie / ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-surface-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {remito.detalles && remito.detalles.length > 0 ? (
                  remito.detalles.map(detalle => (
                    <tr key={detalle.id} className="hover:bg-surface-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-surface-900 text-sm">{detalle.inventarioDetalle?.marca} {detalle.inventarioDetalle?.modelo}</p>
                        <p className="text-surface-500 text-xs">{detalle.inventarioDetalle?.tipoArticulo?.nombre}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-surface-100 text-surface-600 px-2 py-1 rounded border border-surface-200">
                          {detalle.inventarioDetalle?.numero_serie || 'S/N'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {detalle.es_prestamo ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded w-fit border border-violet-100">Préstamo</span>
                            {detalle.fecha_devolucion_esperada && (
                              <span className="text-[10px] text-surface-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Vence: {new Date(detalle.fecha_devolucion_esperada).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-surface-600 bg-surface-100 px-2 py-0.5 rounded w-fit border border-surface-200">Definitivo</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {detalle.es_prestamo ? (
                          detalle.devuelto ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full w-fit border border-emerald-100">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              Devuelto
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full w-fit border border-amber-100">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Pendiente
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-surface-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {detalle.es_prestamo && !detalle.devuelto && canUpdate('remitos') && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditarFecha(detalle)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                              title="Editar fecha de devolución"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleMarcarDevuelto(detalle.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                              title="Marcar como devuelto"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-surface-500">
                      No hay artículos en este remito
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Acciones de Cambio de Estado y Receptor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cambio de Estado */}
          {getTransicionesValidas().length > 0 && canUpdate('remitos') && (
            <div className="card-base p-6 bg-white border border-surface-200">
              <h3 className="text-sm font-bold text-surface-900 border-b border-surface-100 pb-3 uppercase tracking-wide mb-4">
                Actualizar Estado
              </h3>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <select
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Seleccionar nuevo estado...</option>
                    {getTransicionesValidas().map(estado => (
                      <option key={estado} value={estado}>
                        {getEstadoLabel(estado)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-surface-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                <button
                  onClick={handleCambiarEstado}
                  disabled={!newState || changingState}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-surface-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-lg shadow-primary-900/10"
                >
                  {changingState ? '...' : 'Actualizar'}
                </button>
              </div>
            </div>
          )}

          {/* Asignar Receptor Alternativo (si aplica) */}
          {remito.estado === 'en_transito' && !remito.receptor_nombre && canUpdate('remitos') && (
            <div className="card-base p-6 bg-white border border-surface-200 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-surface-900 border-b border-surface-100 pb-3 uppercase tracking-wide mb-2">
                  Receptor Alternativo
                </h3>
                <p className="text-sm text-surface-500 mb-4">
                  Si el solicitante no puede recibir el remito, asigna a otra persona.
                </p>
              </div>
              <button
                onClick={() => setShowReceptorModal(true)}
                className="bg-white border border-surface-300 hover:bg-surface-50 text-surface-700 font-bold py-2.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                Asignar Receptor
              </button>
            </div>
          )}
        </div>

        {/* Modals */}
        {editingLoanId && (
          <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
              <h3 className="text-lg font-bold text-surface-900 mb-4">Editar fecha límite</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-surface-700">Nueva Fecha</label>
                  <input
                    type="date"
                    value={editingDate}
                    onChange={(e) => setEditingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setEditingLoanId(null); setEditingDate(''); }}
                    className="flex-1 px-4 py-2 bg-white border border-surface-200 text-surface-700 font-bold rounded-xl hover:bg-surface-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardarFecha}
                    disabled={!editingDate || markingReturned}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 disabled:opacity-50"
                  >
                    {markingReturned ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {(showDevolucionModal || showReceptorModal) && (
          <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            {/* El contenido específico de cada modal iría aquí, reutilizando estilos de cards */}
            {/* Implementación simplificada para brevedad, usando la misma lógica de estado */}

            {showDevolucionModal && (
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-surface-900 mb-4">Devolver Artículos</h3>
                <div className="space-y-3 mb-6">
                  {getPrestamosNoDevueltos().map(detalle => (
                    <label key={detalle.id} className={`flex items-start p-3 border rounded-xl cursor-pointer transition-all ${selectedDetalles.includes(detalle.id) ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:bg-surface-50'}`}>
                      <input
                        type="checkbox"
                        checked={selectedDetalles.includes(detalle.id)}
                        onChange={() => handleSeleccionarDetalle(detalle.id)}
                        className="mt-1 mr-3 w-4 h-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500"
                      />
                      <div>
                        <p className="font-bold text-surface-900 text-sm">{detalle.inventarioDetalle?.marca} {detalle.inventarioDetalle?.modelo}</p>
                        <p className="text-xs text-surface-500">S/N: {detalle.inventarioDetalle?.numero_serie}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-surface-100">
                  <button
                    onClick={() => { setShowDevolucionModal(false); setSelectedDetalles([]); }}
                    className="px-4 py-2.5 bg-white border border-surface-200 text-surface-700 font-bold rounded-xl hover:bg-surface-50 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGenerarDevolucion}
                    disabled={selectedDetalles.length === 0 || devolviendoArticulos}
                    className="px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 text-sm shadow-lg shadow-emerald-900/10"
                  >
                    {devolviendoArticulos ? 'Generando...' : 'Generar Devolución'}
                  </button>
                </div>
              </div>
            )}

            {showReceptorModal && (
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold text-surface-900 mb-2">Asignar Receptor</h3>
                <p className="text-sm text-surface-500 mb-6">Designa a quien recibirá los equipos realmente.</p>

                <div className="space-y-4 mb-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-700 uppercase">Nombre Completo</label>
                    <input
                      type="text"
                      value={receptorNombre}
                      onChange={(e) => setReceptorNombre(e.target.value)}
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-700 uppercase">Email</label>
                    <input
                      type="email"
                      value={receptorEmail}
                      onChange={(e) => setReceptorEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                      placeholder="juan.perez@megatlon.com.ar"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => { setShowReceptorModal(false); setReceptorNombre(''); setReceptorEmail(''); }}
                    disabled={asignandoReceptor}
                    className="px-4 py-2.5 bg-white border border-surface-200 text-surface-700 font-bold rounded-xl hover:bg-surface-50 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAsignarReceptor}
                    disabled={asignandoReceptor || !receptorNombre.trim() || !receptorEmail.trim()}
                    className="px-4 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 disabled:opacity-50 text-sm shadow-lg shadow-primary-900/10"
                  >
                    {asignandoReceptor ? 'Asignando...' : 'Asignar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Procesar Devolución (granular por artículo) */}
        {showProcesarDevolucionModal && (
          <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-violet-100 rounded-xl text-violet-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900">Procesar Devolución</h3>
                  <p className="text-sm text-surface-500">Selecciona la acción para cada artículo préstamo</p>
                </div>
              </div>

              <div className="space-y-3 my-6">
                {getPrestamosNoDevueltos().map(detalle => {
                  const itemState = itemsDevolucion[detalle.id] || { accion: 'devolver', nueva_fecha: '' }
                  return (
                    <div key={detalle.id} className={`border rounded-xl p-4 transition-all ${itemState.accion === 'devolver'
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-amber-200 bg-amber-50/50'
                      }`}>
                      {/* Artículo info */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-surface-900 text-sm">{detalle.inventarioDetalle?.marca} {detalle.inventarioDetalle?.modelo}</p>
                          <p className="text-xs text-surface-500">{detalle.inventarioDetalle?.tipoArticulo?.nombre}</p>
                          <p className="text-xs text-surface-400 font-mono mt-0.5">S/N: {detalle.inventarioDetalle?.numero_serie || 'S/N'}</p>
                        </div>
                        {detalle.fecha_devolucion_esperada && (
                          <span className="text-xs text-surface-500 bg-white px-2 py-1 rounded-lg border border-surface-200 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Vence: {new Date(detalle.fecha_devolucion_esperada).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                        )}
                      </div>

                      {/* Selector de acción */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => setItemsDevolucion(prev => ({
                            ...prev,
                            [detalle.id]: { accion: 'devolver', nueva_fecha: '' }
                          }))}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all border ${itemState.accion === 'devolver'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white text-surface-600 border-surface-200 hover:border-emerald-300 hover:text-emerald-600'
                            }`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Devolver
                        </button>
                        <button
                          onClick={() => setItemsDevolucion(prev => ({
                            ...prev,
                            [detalle.id]: { accion: 'extender', nueva_fecha: prev[detalle.id]?.nueva_fecha || '' }
                          }))}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all border ${itemState.accion === 'extender'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : 'bg-white text-surface-600 border-surface-200 hover:border-amber-300 hover:text-amber-600'
                            }`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Extender Préstamo
                        </button>
                      </div>

                      {/* Campo fecha si es extender */}
                      {itemState.accion === 'extender' && (
                        <div className="mt-3 flex items-center gap-2">
                          <label className="text-xs font-bold text-surface-600 whitespace-nowrap">Nueva fecha:</label>
                          <input
                            type="date"
                            value={itemState.nueva_fecha}
                            onChange={(e) => setItemsDevolucion(prev => ({
                              ...prev,
                              [detalle.id]: { ...prev[detalle.id], nueva_fecha: e.target.value }
                            }))}
                            min={new Date().toISOString().split('T')[0]}
                            className="flex-1 px-3 py-1.5 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Resumen */}
              <div className="bg-surface-50 rounded-xl p-3 mb-4 border border-surface-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-600">
                    <span className="font-bold text-emerald-600">
                      {Object.values(itemsDevolucion).filter(i => i.accion === 'devolver').length}
                    </span> a devolver
                    {' · '}
                    <span className="font-bold text-amber-600">
                      {Object.values(itemsDevolucion).filter(i => i.accion === 'extender').length}
                    </span> a extender
                  </span>
                  <span className="text-xs text-surface-400">
                    {getPrestamosNoDevueltos().length} artículo(s) en préstamo
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-surface-100">
                <button
                  onClick={() => { setShowProcesarDevolucionModal(false); setItemsDevolucion({}); }}
                  disabled={procesandoDevolucion}
                  className="px-4 py-2.5 bg-white border border-surface-200 text-surface-700 font-bold rounded-xl hover:bg-surface-50 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleProcesarDevolucion}
                  disabled={procesandoDevolucion}
                  className="px-4 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 disabled:opacity-50 text-sm shadow-lg shadow-violet-900/10 flex items-center gap-2"
                >
                  {procesandoDevolucion ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Confirmar Devolución
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RemitoDetailPage
