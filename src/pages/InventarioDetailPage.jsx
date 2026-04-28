import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { inventarioAPI } from '../services/api'
import Swal from 'sweetalert2'
import { usePermissions } from '../hooks/usePermissions'
import GarantiaCard from '../components/GarantiaCard'

export default function InventarioDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [changingState, setChangingState] = useState(false)
  const [newState, setNewState] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const { canUpdate, canDelete } = usePermissions()

  useEffect(() => {
    cargarDetalle()
    cargarHistorial()
  }, [id])

  const cargarDetalle = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await inventarioAPI.getById(id)
      const data = response?.data || response
      setItem(data)
    } catch (err) {
      setError(err.message || 'Error al cargar el artículo')
    } finally {
      setLoading(false)
    }
  }

  const cargarHistorial = async () => {
    try {
      const response = await inventarioAPI.getHistorial(id, { limite: 100 })
      const data = response?.data || response
      setHistorial(data?.historial || data || [])
    } catch (err) {
      console.error('Error cargando historial:', err)
    }
  }

  const estadoBadge = (estado) => {
    const styles = {
      'disponible': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'en_uso': 'bg-blue-50 text-blue-700 border-blue-100',
      'mantenimiento': 'bg-amber-50 text-amber-700 border-amber-100',
      'dado_de_baja': 'bg-rose-50 text-rose-700 border-rose-100',
      'en_prestamo': 'bg-purple-50 text-purple-700 border-purple-100',
      'producto_proveedor': 'bg-orange-50 text-orange-700 border-orange-100'
    }
    return styles[estado] || 'bg-surface-100 text-surface-600 border-surface-200'
  }

  const formatEstado = (estado) => {
    return estado ? estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'
  }

  const handleCambiarEstado = async () => {
    if (!newState) {
      // Simple validation, button should be disabled anyway
      return
    }

    try {
      setChangingState(true)
      await inventarioAPI.cambiarEstado(id, newState, observaciones)

      await Swal.fire({
        title: 'Estado Actualizado',
        text: 'El estado del artículo ha sido modificado correctamente',
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'px-4 py-2 bg-emerald-600 text-white rounded-lg'
        }
      })

      setNewState('')
      setObservaciones('')
      await cargarDetalle()
      await cargarHistorial()
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error al cambiar el estado.',
        icon: 'error',
        customClass: {
          popup: 'rounded-2xl'
        }
      })
    } finally {
      setChangingState(false)
    }
  }

  const handleEliminar = async () => {
    const result = await Swal.fire({
      title: 'Confirmar eliminación',
      html: `¿Está seguro de que desea dar de baja este artículo?<br/><br/><span style="color: #ef4444; font-size: 0.875rem;">Esta acción no puede ser deshecha.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, dar de baja',
      cancelButtonText: 'Cancelar',
      backdrop: true,
      allowOutsideClick: false,
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-4 py-2 bg-rose-600 text-white rounded-lg',
        cancelButton: 'px-4 py-2 bg-slate-200 text-slate-700 rounded-lg'
      }
    })

    if (result.isConfirmed) {
      try {
        await inventarioAPI.delete(id)
        await Swal.fire({
          title: 'Eliminado',
          text: 'El artículo ha sido dado de baja correctamente.',
          icon: 'success',
          timer: 1500,
          timerProgressBar: true,
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'px-4 py-2 bg-emerald-600 text-white rounded-lg'
          }
        })
        navigate('/inventario')
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: err.message || 'Error al dar de baja el artículo.',
          icon: 'error',
          customClass: {
            popup: 'rounded-2xl'
          }
        })
      }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateSimple = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
          <p className="text-surface-500 font-medium">Cargando artículo...</p>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="p-6 sm:p-8 bg-surface-50 min-h-screen">
        <div className="p-8 text-center bg-white rounded-2xl border border-surface-200 shadow-sm max-w-lg mx-auto mt-20">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-rose-800 mb-2">No se pudo cargar el artículo</h3>
          <p className="text-rose-600 mb-6">{error || 'El artículo solicitado no existe o fue eliminado.'}</p>
          <button
            onClick={() => navigate('/inventario')}
            className="btn-primary w-full"
          >
            Volver al Inventario
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/inventario')}
            className="text-surface-500 hover:text-primary-600 font-medium text-sm flex items-center gap-2 transition-colors w-fit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Inventario
          </button>

          <div className="flex gap-3">
            {canUpdate('inventario') && (
              <button
                onClick={() => navigate(`/inventario/${id}/editar`)}
                className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-primary-900/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
            )}

            {canDelete('inventario') && (
              <button
                onClick={handleEliminar}
                className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-bold py-2 px-4 rounded-xl transition-all text-sm flex items-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="card-base bg-white p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${estadoBadge(item.estado)}`}>
                      {formatEstado(item.estado)}
                    </span>
                    <span className="text-surface-400 text-xs font-mono bg-surface-100 px-1.5 py-0.5 rounded border border-surface-200">
                      ID: {id.split('-')[0]}...
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-surface-900 tracking-tight">{item.marca} {item.modelo}</h1>
                  {item.tipoArticulo?.nombre && (
                    <p className="text-surface-500 font-medium mt-1">{item.tipoArticulo.nombre}</p>
                  )}
                </div>

                {item.sedePrincipal && (
                  <div className="flex items-start gap-3 p-3 bg-surface-50 rounded-xl border border-surface-100 min-w-[200px]">
                    <div className="w-8 h-8 rounded-full bg-white border border-surface-200 flex items-center justify-center text-surface-400 shadow-sm shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-0.5">Ubicación</p>
                      <p className="text-sm font-bold text-surface-900">{item.sedePrincipal.nombre_sede}</p>
                      <p className="text-xs text-surface-500">{item.sedePrincipal.localidad}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 pt-6 border-t border-surface-100">
                <InfoItem label="Número de Serie" value={item.numero_serie} mono />
                <InfoItem label="Service Tag" value={item.service_tag} mono />
                <InfoItem label="Fecha de Adquisición" value={formatDateSimple(item.fecha_adquisicion)} />
                <InfoItem label="Valor de Adquisición" value={item.valor_adquisicion ? `$${Number(item.valor_adquisicion).toLocaleString('es-AR')}` : null} />
              </div>

              {item.observaciones && (
                <div className="mt-6 pt-6 border-t border-surface-100">
                  <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-2">Observaciones</p>
                  <p className="text-sm text-surface-700 bg-surface-50 p-4 rounded-xl border border-surface-100 italic">
                    "{item.observaciones}"
                  </p>
                </div>
              )}

              {/* PC / Notebook / Servidor Specs */}
              {(() => {
                const nombreTipo = item.tipoArticulo?.nombre?.toLowerCase() || ''
                const esOrdenador = nombreTipo.includes('notebook') ||
                  nombreTipo.includes('pc') ||
                  nombreTipo.includes('comp') ||
                  nombreTipo.includes('all') ||
                  nombreTipo.includes('servidor')
                const tieneAlgo = item.procesador || item.memoria || item.disco || item.sistema_operativo
                if (!esOrdenador || !tieneAlgo) return null
                return (
                  <div className="mt-6 pt-6 border-t border-surface-100">
                    <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Especificaciones de Hardware
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                      <InfoItem label="Procesador" value={item.procesador} />
                      <InfoItem label="Memoria RAM" value={item.memoria} />
                      <InfoItem label="Almacenamiento" value={item.disco} />
                      <InfoItem label="Sistema Operativo" value={item.sistema_operativo} />
                    </div>
                  </div>
                )
              })()}

              {/* Monitor Specs */}
              {item.tipoArticulo?.nombre?.toLowerCase().includes('monitor') && (
                <div className="mt-6 pt-6 border-t border-surface-100">
                  <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Especificaciones de Monitor
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    <InfoItem label="Pulgadas" value={item.pulgadas ? `${item.pulgadas}"` : null} />
                    <div>
                      <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-1">Conectores</p>
                      {item.tipo_conector ? (
                        <div className="flex flex-wrap gap-1.5">
                          {item.tipo_conector.split(',').filter(Boolean).map(c => (
                            <span key={c} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-xs font-bold">
                              {c.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-surface-400 text-sm italic">No especificado</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Switch Specs */}
              {item.tipoArticulo?.nombre?.toLowerCase().includes('switch') && (
                <div className="mt-6 pt-6 border-t border-surface-100">
                  <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" /></svg>
                    Especificaciones de Switch
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-8">
                    <InfoItem label="Puertos Ethernet" value={item.puertos_ethernet != null ? String(item.puertos_ethernet) : null} />
                    <InfoItem label="Puertos SFP" value={item.puertos_sfp != null ? String(item.puertos_sfp) : null} />
                    <div>
                      <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-1">PoE</p>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${item.poe
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-surface-100 text-surface-500 border-surface-200'
                        }`}>
                        {item.poe ? 'Sí' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Historial Timeline */}
            <div className="card-base bg-white p-6 sm:p-8">
              <h2 className="text-lg font-bold text-surface-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-surface-100 text-surface-500 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Historial de Movimientos
              </h2>

              {historial.length === 0 ? (
                <div className="text-center py-10 bg-surface-50 rounded-xl border border-dashed border-surface-200">
                  <p className="text-surface-500 font-medium text-sm">No hay movimientos registrados para este artículo</p>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-surface-200 before:z-0">
                  {historial.map((mov, idx) => (
                    <div key={idx} className="relative z-10 pl-12 group">
                      <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white border-4 border-surface-50 shadow-sm flex items-center justify-center z-10 group-hover:scale-110 transition-transform duration-300">
                        <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                      </div>

                      <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 hover:border-primary-200 hover:shadow-sm transition-all">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                          <p className="font-bold text-surface-900 text-sm">
                            {mov.tipo_movimiento || 'Movimiento'}
                          </p>
                          <span className="text-xs text-surface-500 font-medium bg-white px-2 py-1 rounded border border-surface-200">
                            {formatDate(mov.fecha_movimiento || mov.created_at)}
                          </span>
                        </div>

                        {mov.observaciones && (
                          <p className="text-surface-600 text-xs mb-2">{mov.observaciones}</p>
                        )}

                        <div className="flex items-center gap-3 flex-wrap">
                          {mov.remitoMovimiento && (
                            <button
                              onClick={() => navigate(`/remitos/${mov.remitoMovimiento.id}`)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors uppercase tracking-wide"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {mov.remitoMovimiento.numero_remito}
                            </button>
                          )}

                          {mov.usuario_email && (
                            <div className="flex items-center gap-1.5 text-[10px] text-surface-400 uppercase font-bold tracking-wide">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {mov.usuario_email}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Garantía Card */}
            <GarantiaCard item={item} onRefresh={cargarDetalle} />

            {/* Préstamo Activo Card (Re-styled) */}
            {item.prestamoActivo && (
              <div className="bg-gradient-to-br from-indigo-600 to-primary-700 rounded-2xl p-6 text-white shadow-xl shadow-primary-900/20 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
                <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-20 h-20 rounded-full bg-black/10 blur-xl"></div>

                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">Préstamo Activo</h3>
                    <p className="text-indigo-100 text-xs font-medium">En circulación actualmente</p>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Destino</p>
                    <p className="font-bold text-white text-base">
                      {item.prestamoActivo.sedeDestino?.nombre_sede}
                    </p>
                    <p className="text-indigo-100 text-xs mt-0.5">
                      {item.prestamoActivo.sedeDestino?.localidad}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Remito</p>
                      <p className="font-mono text-white text-sm">{item.prestamoActivo.numeroRemito}</p>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Estado</p>
                      <span className="inline-block px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-bold text-white border border-white/20">
                        {item.prestamoActivo.estado}
                      </span>
                    </div>
                  </div>

                  {item.prestamoActivo.fechaDevolucionEsperada && (
                    <div>
                      <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Devolución Estimada</p>
                      <p className="text-white font-medium text-sm">
                        {formatDateSimple(item.prestamoActivo.fechaDevolucionEsperada)}
                      </p>
                    </div>
                  )}

                  {item.prestamoActivo.observaciones && (
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-indigo-200 text-xs italic">
                        "{item.prestamoActivo.observaciones}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats Card */}
            <div className="card-base bg-white p-5">
              <h3 className="text-sm font-bold text-surface-900 border-b border-surface-100 pb-3 mb-4 uppercase tracking-wide">
                Detalles de Registro
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-500">ID Sistema</span>
                  <span className="text-surface-900 font-mono text-xs bg-surface-100 px-2 py-0.5 rounded">{item.id}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-500">Creado</span>
                  <span className="text-surface-900 font-medium">{formatDateSimple(item.created_at)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-500">Actualizado</span>
                  <span className="text-surface-900 font-medium">{formatDateSimple(item.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Change State Box */}
            {canUpdate('inventario') && (
              <div className="card-base bg-white p-6 border-l-4 border-l-primary-500">
                <h2 className="text-lg font-bold text-surface-900 mb-4">Actualizar Estado</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-surface-500 mb-1.5 uppercase tracking-wide">
                      Nuevo Estado
                    </label>
                    <select
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-surface-900"
                      disabled={changingState}
                    >
                      <option value="">-- Seleccionar --</option>
                      <option value="disponible">Disponible</option>
                      <option value="en_uso">En Uso</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="dado_de_baja">Dado de Baja</option>
                      <option value="en_prestamo">En Préstamo</option>
                      <option value="producto_proveedor">Producto de Proveedor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-500 mb-1.5 uppercase tracking-wide">
                      Observaciones de Cambio
                    </label>
                    <textarea
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Motivo del cambio de estado..."
                      rows="3"
                      className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400 text-surface-900 resize-none"
                      disabled={changingState}
                    />
                  </div>

                  <button
                    onClick={handleCambiarEstado}
                    disabled={!newState || changingState}
                    className="w-full btn-primary py-2.5 justify-center shadow-lg shadow-primary-900/10"
                  >
                    {changingState ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Actualizando...
                      </span>
                    ) : 'Guardar Nuevo Estado'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-1">{label}</p>
      {value ? (
        <p className={`text-surface-900 font-medium ${mono ? 'font-mono text-sm' : 'text-base'}`}>
          {value}
        </p>
      ) : (
        <p className="text-surface-400 text-sm italic">No especificado</p>
      )}
    </div>
  )
}
