import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { solicitudesAsignacionAPI, categoriaEquiposAsignacionAPI } from '../services/api'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'
import StatusBadgeAsignacion from '../components/solicitudesAsignacion/StatusBadgeAsignacion'
import TimelineAsignacion from '../components/solicitudesAsignacion/TimelineAsignacion'
import { usePermissions } from '../hooks/usePermissions'

export default function SolicitudAsignacionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasInfraestructura, hasRRHH, hasCompras } = usePermissions()

  const [solicitud, setSolicitud] = useState(null)
  const [inventarioDisponible, setInventarioDisponible] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Sección asignar equipo (pendiente_infra)
  const [asignacion, setAsignacion] = useState({
    inventario_id: '',
    categoria_id: '',
    observacion: '',
    equipo_anterior_accion: ''
  })

  // Sección RRHH
  const [rrhhObs, setRrhhObs] = useState('')

  // Sección cierre
  const [cierreObs, setCierreObs] = useState('')

  // Generar remito
  const [tecnicoId, setTecnicoId] = useState('')
  const [soporte, setSoporte] = useState([])

  // Rechazo y cancelación
  const [rechazo, setRechazo] = useState('')
  const [cancelacion, setCancelacion] = useState('')

  // Reenviar aviso
  const [reenviando, setReenviando] = useState(false)
  const [avisoEnviado, setAvisoEnviado] = useState(false)

  const cargar = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await solicitudesAsignacionAPI.getById(id)
      setSolicitud(res.data)
    } catch (err) {
      setError(err.message || 'Error cargando solicitud')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [id])

  // Cargar técnicos de soporte cuando la solicitud entra en aprobada
  useEffect(() => {
    if (!solicitud || solicitud.estado !== 'aprobada') return
    solicitudesAsignacionAPI.lookupSoporte()
      .then(res => {
        const data = Array.isArray(res?.data) ? res.data : (res?.data?.data || [])
        setSoporte(data)
      })
      .catch(() => setSoporte([]))
  }, [solicitud?.id, solicitud?.estado])

  // Cargar categorías cuando la solicitud entra en pendiente_infra
  useEffect(() => {
    if (!solicitud || !hasInfraestructura || solicitud.estado !== 'pendiente_infra') return
    categoriaEquiposAsignacionAPI.list({ tipo: solicitud.tipo_equipo, activo: true })
      .then(res => setCategorias(normalizeApiResponse(res, 200).data))
      .catch(() => setCategorias([]))
  }, [solicitud?.id, solicitud?.estado])

  // Recargar inventario disponible cada vez que cambia la categoría seleccionada
  useEffect(() => {
    if (!solicitud || solicitud.estado !== 'pendiente_infra') return
    if (!asignacion.categoria_id) { setInventarioDisponible([]); return }
    solicitudesAsignacionAPI.lookupInventarioDisponible({
      tipo_equipo: solicitud.tipo_equipo,
      categoria_id: asignacion.categoria_id
    })
      .then(res => {
        const data = Array.isArray(res?.data) ? res.data : (res?.data?.data || [])
        setInventarioDisponible(data)
        // Limpiar equipo seleccionado si ya no está en la nueva lista
        setAsignacion(prev => ({
          ...prev,
          inventario_id: data.find(i => i.id === prev.inventario_id) ? prev.inventario_id : ''
        }))
      })
      .catch(() => setInventarioDisponible([]))
  }, [asignacion.categoria_id, solicitud?.id])

  const ejecutar = async (fn) => {
    try {
      setError(null)
      await fn()
      await cargar()
    } catch (err) {
      setError(err.message || 'Error procesando acción')
    }
  }

  if (loading) {
    return (
      <div className="p-8 bg-surface-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4" />
          <p className="text-surface-500 font-medium">Cargando solicitud...</p>
        </div>
      </div>
    )
  }
  if (!solicitud) return <div className="p-8 bg-surface-50 min-h-screen text-rose-600">{error || 'Solicitud no encontrada'}</div>

  const esReposicion = ['reposicion_robo', 'reposicion_perdida', 'reposicion_rotura'].includes(solicitud.motivo)
  const esTerminal = ['finalizada', 'rechazada', 'cancelada'].includes(solicitud.estado)

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      <button onClick={() => navigate('/solicitudes-asignacion')} className="text-sm text-primary-700 hover:text-primary-800 font-medium hover:underline mb-5">
        Volver al listado
      </button>

      <div className="card-base p-6 sm:p-8 mb-6 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Solicitud de asignación</p>
          <h1 className="text-2xl font-bold text-surface-900">SA-{String(solicitud.numero).padStart(4, '0')}</h1>
          <p className="text-surface-500 mt-1 font-medium capitalize">
            {solicitud.tipo_equipo} · {(solicitud.motivo || '').replaceAll('_', ' ')}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <StatusBadgeAsignacion estado={solicitud.estado} />
          {!esTerminal && (hasInfraestructura || hasRRHH) && (
            <button
              onClick={async () => {
                setReenviando(true)
                setAvisoEnviado(false)
                try {
                  await solicitudesAsignacionAPI.reenviarAviso(id)
                  setAvisoEnviado(true)
                  setTimeout(() => setAvisoEnviado(false), 4000)
                } catch (err) {
                  setError(err.message || 'Error al reenviar el aviso')
                } finally {
                  setReenviando(false)
                }
              }}
              disabled={reenviando}
              className="text-xs font-medium text-surface-500 hover:text-primary-600 border border-surface-200 hover:border-primary-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
            >
              {reenviando ? 'Enviando...' : avisoEnviado ? '✓ Aviso enviado' : 'Reenviar aviso'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 mb-4">
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">

          {/* Datos de la solicitud */}
          <section className="card-base p-6">
            <h2 className="font-bold text-surface-900 mb-4">Datos de la solicitud</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <InfoItem
                label="Beneficiario"
                value={solicitud.beneficiario
                  ? `${solicitud.beneficiario.nombre} ${solicitud.beneficiario.apellido}`
                  : '-'}
              />
              <InfoItem
                label="Solicitante"
                value={solicitud.solicitante
                  ? `${solicitud.solicitante.nombre} ${solicitud.solicitante.apellido}`
                  : '-'}
              />
              <InfoItem label="Tipo de equipo" value={solicitud.tipo_equipo || '-'} />
              <InfoItem label="Motivo" value={(solicitud.motivo || '').replaceAll('_', ' ')} />

              {solicitud.inventarioAsignado && (
                <div className="md:col-span-2 rounded-xl bg-sky-50 border border-sky-100 px-4 py-3">
                  <dt className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-2">Equipo asignado</dt>
                  <dd className="space-y-1">
                    <p className="font-semibold text-surface-900">
                      {solicitud.inventarioAsignado.marca} {solicitud.inventarioAsignado.modelo}
                    </p>
                    {solicitud.inventarioAsignado.numero_serie && (
                      <p className="text-sm text-surface-500 font-mono">S/N: {solicitud.inventarioAsignado.numero_serie}</p>
                    )}
                    {solicitud.inventarioAsignado.sedePrincipal && (
                      <p className="text-sm text-surface-500">Sede: {solicitud.inventarioAsignado.sedePrincipal.nombre_sede}</p>
                    )}
                  </dd>
                </div>
              )}

              {solicitud.categoria && (
                <InfoItem label="Categoría" value={solicitud.categoria.nombre} />
              )}

              {solicitud.remito && (
                <div className="rounded-xl bg-surface-50 border border-surface-100 px-4 py-3">
                  <dt className="text-xs font-bold text-surface-400 uppercase tracking-wider">Remito</dt>
                  <dd className="font-semibold text-surface-900 mt-1">
                    <button
                      onClick={() => navigate(`/remitos/${solicitud.remito.id}`)}
                      className="text-primary-700 hover:underline"
                    >
                      {solicitud.remito.numero_remito || solicitud.remito.id}
                    </button>
                  </dd>
                </div>
              )}

              {solicitud.motivo === 'reposicion_robo' && (
                <InfoItem
                  label="Denuncia presentada"
                  value={solicitud.denuncia_presentada === true ? 'Sí' : solicitud.denuncia_presentada === false ? 'No' : '-'}
                />
              )}
            </dl>

            {solicitud.observacion_solicitante && (
              <div className="mt-5 rounded-xl bg-surface-50 border border-surface-100 p-4">
                <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Descripción amplia</p>
                <p className="mt-2 text-sm text-surface-800 whitespace-pre-wrap">{solicitud.observacion_solicitante}</p>
              </div>
            )}

            {(solicitud.infra_observacion || solicitud.rrhh_observacion || solicitud.cierre_observacion || solicitud.rechazo_motivo || solicitud.cancelacion_motivo) && (
              <div className="mt-4 space-y-3 border-t border-surface-100 pt-4">
                {solicitud.infra_observacion && (
                  <div>
                    <p className="text-sm font-semibold text-sky-700">Observación de Infraestructura</p>
                    <p className="text-sm text-surface-800 whitespace-pre-wrap">{solicitud.infra_observacion}</p>
                  </div>
                )}
                {solicitud.rrhh_observacion && (
                  <div>
                    <p className="text-sm font-semibold text-indigo-700">Observación de RRHH</p>
                    <p className="text-sm text-surface-800 whitespace-pre-wrap">{solicitud.rrhh_observacion}</p>
                  </div>
                )}
                {solicitud.cierre_observacion && (
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">Observación de cierre</p>
                    <p className="text-sm text-surface-800 whitespace-pre-wrap">{solicitud.cierre_observacion}</p>
                  </div>
                )}
                {solicitud.rechazo_motivo && (
                  <div>
                    <p className="text-sm font-semibold text-rose-700">Motivo de rechazo</p>
                    <p className="text-sm text-surface-800 whitespace-pre-wrap">{solicitud.rechazo_motivo}</p>
                  </div>
                )}
                {solicitud.cancelacion_motivo && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Motivo de cancelación</p>
                    <p className="text-sm text-surface-800 whitespace-pre-wrap">{solicitud.cancelacion_motivo}</p>
                  </div>
                )}
              </div>
            )}

            {solicitud.adjuntos?.length > 0 && (
              <div className="mt-4 border-t border-surface-100 pt-4">
                <p className="text-sm font-semibold text-surface-700 mb-2">Adjuntos</p>
                <ul className="space-y-1.5">
                  {solicitud.adjuntos.map(a => (
                    <li key={a.id} className="text-sm flex items-center gap-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-surface-100 text-surface-700 border-surface-200 capitalize">
                        {a.tipo}
                      </span>
                      <a href={a.url} target="_blank" rel="noreferrer" className="text-primary-700 hover:underline truncate">
                        {a.nombre_original || a.filename}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Acción: Asignar equipo (pendiente_infra + Infra) */}
          {hasInfraestructura && solicitud.estado === 'pendiente_infra' && (
            <section className="card-base p-6 border-l-4 border-l-sky-500">
              <h2 className="font-bold text-surface-900 mb-1">Asignar equipo</h2>
              <p className="text-sm text-surface-500 mb-4">
                Seleccioná primero la categoría para ver los equipos disponibles correspondientes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 1. Categoría — obligatoria, primer paso */}
                <div>
                  <label className="label-base block mb-1">
                    Categoría <span className="text-rose-500">*</span>
                  </label>
                  {categorias.length === 0 ? (
                    <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      No hay categorías definidas para {solicitud.tipo_equipo}.{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/categoria-equipos-asignacion')}
                        className="underline font-medium"
                      >
                        Crear categorías
                      </button>
                    </p>
                  ) : (
                    <select
                      value={asignacion.categoria_id}
                      onChange={e => setAsignacion(prev => ({ ...prev, categoria_id: e.target.value, inventario_id: '' }))}
                      className="input-base"
                    >
                      <option value="">— Seleccionar categoría —</option>
                      {categorias.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 2. Equipo — habilitado solo tras elegir categoría */}
                <div>
                  <label className="label-base block mb-1">
                    Equipo disponible <span className="text-rose-500">*</span>
                  </label>
                  {!asignacion.categoria_id ? (
                    <p className="text-sm text-surface-400 bg-surface-50 border border-surface-200 rounded-lg px-3 py-2">
                      Seleccioná una categoría primero
                    </p>
                  ) : inventarioDisponible.length === 0 ? (
                    <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      No hay {solicitud.tipo_equipo}s disponibles en esa categoría
                    </p>
                  ) : (
                    <select
                      value={asignacion.inventario_id}
                      onChange={e => setAsignacion(prev => ({ ...prev, inventario_id: e.target.value }))}
                      className="input-base"
                    >
                      <option value="">— Seleccionar equipo —</option>
                      {inventarioDisponible.map(inv => (
                        <option key={inv.id} value={inv.id}>
                          {inv.marca} {inv.modelo}
                          {inv.numero_serie ? ` · S/N ${inv.numero_serie}` : ''}
                          {inv.sedePrincipal?.nombre_sede ? ` · ${inv.sedePrincipal.nombre_sede}` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {esReposicion && solicitud.inventario_anterior_id && (
                  <div>
                    <label className="label-base block mb-1">Acción sobre equipo anterior</label>
                    <select
                      value={asignacion.equipo_anterior_accion}
                      onChange={e => setAsignacion(prev => ({ ...prev, equipo_anterior_accion: e.target.value }))}
                      className="input-base"
                    >
                      <option value="">Seleccionar acción</option>
                      <option value="mantenimiento">Enviar a mantenimiento</option>
                      <option value="dado_de_baja">Dar de baja</option>
                    </select>
                  </div>
                )}

                <div className={esReposicion && solicitud.inventario_anterior_id ? '' : 'md:col-span-2'}>
                  <label className="label-base block mb-1">Observación (opcional)</label>
                  <input
                    value={asignacion.observacion}
                    onChange={e => setAsignacion(prev => ({ ...prev, observacion: e.target.value }))}
                    className="input-base"
                    placeholder="Observación técnica"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  className="btn-primary"
                  disabled={!asignacion.inventario_id || !asignacion.categoria_id}
                  onClick={() => ejecutar(() => solicitudesAsignacionAPI.asignarEquipo(id, {
                    inventario_id: asignacion.inventario_id,
                    categoria_id: asignacion.categoria_id,
                    observacion: asignacion.observacion || null,
                    equipo_anterior_accion: asignacion.equipo_anterior_accion || null
                  }))}
                >
                  Asignar equipo
                </button>
              </div>
            </section>
          )}

          {/* Acción: Aprobación RRHH (pendiente_rrhh + RRHH) */}
          {hasRRHH && solicitud.estado === 'pendiente_rrhh' && (
            <section className="card-base p-6 border-l-4 border-l-indigo-500">
              <h2 className="font-bold text-surface-900 mb-4">Aprobación RRHH</h2>
              <input
                value={rrhhObs}
                onChange={e => setRrhhObs(e.target.value)}
                className="input-base mb-4"
                placeholder="Aclaración opcional"
              />
              <button
                className="btn-primary"
                onClick={() => ejecutar(() => solicitudesAsignacionAPI.aprobarRrhh(id, { observacion: rrhhObs }))}
              >
                Aprobar
              </button>
            </section>
          )}

          {/* Acción: Generar remito (aprobada + Infra) */}
          {hasInfraestructura && solicitud.estado === 'aprobada' && (
            <section className="card-base p-6 border-l-4 border-l-teal-500">
              <h2 className="font-bold text-surface-900 mb-2">Generar remito de entrega</h2>
              <p className="text-sm text-surface-500 mb-4">
                El equipo está listo. Seleccioná el técnico que realizará la entrega y generá el remito.
              </p>
              <div className="mb-4">
                <label className="label-base block mb-1">
                  Técnico asignado <span className="text-rose-500">*</span>
                </label>
                {soporte.length === 0 ? (
                  <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    No hay técnicos sede disponibles. Verificá que el personal tenga asignado el rol "Tecnico sede".
                  </p>
                ) : (
                  <select
                    value={tecnicoId}
                    onChange={e => setTecnicoId(e.target.value)}
                    className="input-base max-w-sm"
                  >
                    <option value="">— Seleccionar técnico —</option>
                    {soporte.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.apellido}, {t.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <button
                className="btn-primary"
                disabled={!tecnicoId}
                onClick={() => ejecutar(() => solicitudesAsignacionAPI.generarRemito(id, { tecnico_id: tecnicoId }))}
              >
                Generar remito
              </button>
            </section>
          )}

          {/* Acción: Finalizar (remito_generado + Infra o RRHH) */}
          {solicitud.estado === 'remito_generado' && (hasInfraestructura || hasRRHH) && (
            <section className="card-base p-6 border-l-4 border-l-emerald-500">
              <h2 className="font-bold text-surface-900 mb-4">Finalizar solicitud</h2>
              {solicitud.remito_id && (
                <p className="text-sm text-surface-600 mb-3">
                  Remito:{' '}
                  <button
                    onClick={() => navigate(`/remitos/${solicitud.remito_id}`)}
                    className="text-primary-700 hover:underline font-medium"
                  >
                    Ver remito
                  </button>
                </p>
              )}
              <input
                value={cierreObs}
                onChange={e => setCierreObs(e.target.value)}
                className="input-base mb-4"
                placeholder="Observación de cierre (opcional)"
              />
              <button
                className="btn-primary"
                onClick={() => ejecutar(() => solicitudesAsignacionAPI.finalizar(id, { observacion: cierreObs }))}
              >
                Finalizar
              </button>
            </section>
          )}

          {/* Acción: Rechazar */}
          {((solicitud.estado === 'pendiente_infra' && hasInfraestructura) ||
            (solicitud.estado === 'pendiente_rrhh' && hasRRHH)) && (
            <section className="card-base p-6">
              <h2 className="font-bold text-surface-900 mb-4">Rechazar solicitud</h2>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  value={rechazo}
                  onChange={e => setRechazo(e.target.value)}
                  className="input-base flex-1"
                  placeholder="Motivo de rechazo"
                />
                <button
                  className="btn-secondary"
                  disabled={!rechazo.trim()}
                  onClick={() => ejecutar(() => solicitudesAsignacionAPI.rechazar(id, { motivo: rechazo }))}
                >
                  Rechazar
                </button>
              </div>
            </section>
          )}

          {/* Acción: Cancelar */}
          {!esTerminal && (hasInfraestructura || hasRRHH || hasCompras) && (
            <section className="card-base p-6">
              <h2 className="font-bold text-surface-900 mb-4">Cancelar solicitud</h2>
              <p className="text-sm text-surface-500 mb-3">
                Quien cancela debe dejar la justificación. Se notifica a Infra, RRHH y Compras.
              </p>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  value={cancelacion}
                  onChange={e => setCancelacion(e.target.value)}
                  className="input-base flex-1"
                  placeholder="Motivo de cancelación"
                />
                <button
                  className="btn-secondary"
                  disabled={!cancelacion.trim()}
                  onClick={() => ejecutar(() => solicitudesAsignacionAPI.cancelar(id, { motivo: cancelacion }))}
                >
                  Cancelar solicitud
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Panel lateral: timeline */}
        <section className="card-base p-6 xl:sticky xl:top-6 self-start">
          <h2 className="font-bold text-surface-900 mb-4">Historial</h2>
          <TimelineAsignacion historial={solicitud.historial || []} />
        </section>
      </div>
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-surface-50 border border-surface-100 px-4 py-3">
      <dt className="text-xs font-bold text-surface-400 uppercase tracking-wider">{label}</dt>
      <dd className="font-semibold text-surface-900 mt-1 break-words capitalize">{value}</dd>
    </div>
  )
}
