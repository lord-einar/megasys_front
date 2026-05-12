import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { catalogoEquiposAPI, solicitudesCompraAPI } from '../services/api'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'
import StatusBadge from '../components/solicitudesCompra/StatusBadge'
import TimelineSolicitud from '../components/solicitudesCompra/TimelineSolicitud'
import { usePermissions } from '../hooks/usePermissions'

export default function SolicitudCompraDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasInfraestructura, hasRRHH, hasCompras } = usePermissions()
  const [solicitud, setSolicitud] = useState(null)
  const [catalogo, setCatalogo] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [infra, setInfra] = useState({ catalogo_equipo_id: '', observacion: '' })
  const [rrhhObs, setRrhhObs] = useState('')
  const [rechazo, setRechazo] = useState('')
  const [cancelacion, setCancelacion] = useState('')
  const [estadoCompraObs, setEstadoCompraObs] = useState('')
  const [compra, setCompra] = useState({
    numero_oc: '',
    observacion: ''
  })
  const [sistemas, setSistemas] = useState({
    imei: '',
    numero_serie: '',
    fecha_adquisicion: new Date().toISOString().slice(0, 10),
    valor_adquisicion: '',
    observacion: ''
  })

  const cargar = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await solicitudesCompraAPI.getById(id)
      const item = res.data
      setSolicitud(item)
      setCompra(prev => ({
        ...prev,
        numero_oc: item.compras_numero_oc || prev.numero_oc
      }))
    } catch (err) {
      setError(err.message || 'Error cargando solicitud')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [id])

  useEffect(() => {
    if (!solicitud) return
    catalogoEquiposAPI.list({ tipo: solicitud.tipo_equipo, activo: true })
      .then(res => setCatalogo(normalizeApiResponse(res, 100).data))
      .catch(() => setCatalogo([]))
  }, [solicitud?.id])

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

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      <button onClick={() => navigate('/solicitudes-compra')} className="text-sm text-primary-700 hover:text-primary-800 font-medium hover:underline mb-5">
        Volver al listado
      </button>

      <div className="card-base p-6 sm:p-8 mb-6 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Solicitud de compra</p>
          <h1 className="text-2xl font-bold text-surface-900">SC-{String(solicitud.numero).padStart(4, '0')}</h1>
          <p className="text-surface-500 mt-1 font-medium capitalize">{solicitud.tipo_equipo} · {(solicitud.motivo || '').replaceAll('_', ' ')}</p>
        </div>
        <StatusBadge estado={solicitud.estado} />
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 mb-4">
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <section className="card-base p-6">
            <h2 className="font-bold text-surface-900 mb-4">Datos de la solicitud</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <InfoItem label="Beneficiario" value={solicitud.beneficiario ? `${solicitud.beneficiario.nombre} ${solicitud.beneficiario.apellido}` : '-'} />
              <InfoItem label="Solicitante" value={solicitud.solicitante ? `${solicitud.solicitante.nombre} ${solicitud.solicitante.apellido}` : '-'} />
              <InfoItem label="Equipo sugerido" value={solicitud.catalogoEquipo ? `${solicitud.catalogoEquipo.marca} ${solicitud.catalogoEquipo.modelo}` : 'Pendiente'} />
              <InfoItem label="OC" value={solicitud.compras_numero_oc || '-'} />
              <InfoItem label="IMEI" value={solicitud.imei || '-'} />
              <InfoItem label="Número de serie" value={solicitud.numero_serie_final || '-'} />
              {solicitud.motivo === 'reposicion_robo' && (
                <InfoItem label="Denuncia presentada" value={solicitud.denuncia_presentada === true ? 'Sí' : solicitud.denuncia_presentada === false ? 'No' : '-'} />
              )}
            </dl>
            <div className="mt-5 rounded-xl bg-surface-50 border border-surface-100 p-4">
              <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Descripción amplia</p>
              <p className="mt-2 text-sm text-surface-800 whitespace-pre-wrap">{solicitud.observacion_solicitante}</p>
            </div>

            {(solicitud.infra_observacion || solicitud.rrhh_observacion || solicitud.compras_observacion || solicitud.compras_entrega_observacion || solicitud.sistemas_observacion || solicitud.rechazo_motivo || solicitud.cancelacion_motivo) && (
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
                {solicitud.compras_observacion && (
                  <div>
                    <p className="text-sm font-semibold text-blue-700">Observación de Compras (pedido)</p>
                    <p className="text-sm text-surface-800 whitespace-pre-wrap">{solicitud.compras_observacion}</p>
                  </div>
                )}
                {solicitud.compras_entrega_observacion && (
                  <div>
                    <p className="text-sm font-semibold text-cyan-700">Observación de Compras (entrega)</p>
                    <p className="text-sm text-surface-800 whitespace-pre-wrap">{solicitud.compras_entrega_observacion}</p>
                  </div>
                )}
                {solicitud.sistemas_observacion && (
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">Observación de Sistemas</p>
                    <p className="text-sm text-surface-800 whitespace-pre-wrap">{solicitud.sistemas_observacion}</p>
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-surface-100 text-surface-700 border-surface-200 capitalize">{a.tipo}</span>
                      <a href={a.url} target="_blank" rel="noreferrer" className="text-primary-700 hover:underline truncate">
                        {a.nombre_original || a.filename}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {hasInfraestructura && solicitud.estado === 'pendiente_infra' && (
            <section className="card-base p-6 border-l-4 border-l-sky-500">
              <h2 className="font-bold text-surface-900 mb-4">Aprobación de Infraestructura</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select value={infra.catalogo_equipo_id} onChange={e => setInfra(prev => ({ ...prev, catalogo_equipo_id: e.target.value }))} className="input-base">
                  <option value="">Seleccionar equipo a comprar</option>
                  {catalogo.map(e => <option key={e.id} value={e.id}>{e.marca} {e.modelo}</option>)}
                </select>
                <input value={infra.observacion} onChange={e => setInfra(prev => ({ ...prev, observacion: e.target.value }))} className="input-base" placeholder="Observación técnica" />
              </div>
              <div className="mt-4 flex gap-3">
                <button className="btn-primary" onClick={() => ejecutar(() => solicitudesCompraAPI.aprobarInfra(id, infra))}>Aprobar Infra</button>
              </div>
            </section>
          )}

          {hasRRHH && solicitud.estado === 'aprobada_infra' && (
            <section className="card-base p-6 border-l-4 border-l-indigo-500">
              <h2 className="font-bold text-surface-900 mb-4">Aprobación de RRHH</h2>
              <input value={rrhhObs} onChange={e => setRrhhObs(e.target.value)} className="input-base mb-4" placeholder="Aclaración opcional" />
              <button className="btn-primary" onClick={() => ejecutar(() => solicitudesCompraAPI.aprobarRrhh(id, { observacion: rrhhObs }))}>Aprobar RRHH</button>
            </section>
          )}

          {hasCompras && solicitud.estado === 'pendiente_pedido' && (
            <section className="card-base p-6 border-l-4 border-l-blue-500">
              <h2 className="font-bold text-surface-900 mb-4">Registrar pedido</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={compra.numero_oc} onChange={e => setCompra(prev => ({ ...prev, numero_oc: e.target.value }))} className="input-base" placeholder="Número OC" />
                <input value={compra.observacion} onChange={e => setCompra(prev => ({ ...prev, observacion: e.target.value }))} className="input-base" placeholder="Observación" />
              </div>
              <button className="btn-primary mt-4" onClick={() => ejecutar(() => solicitudesCompraAPI.registrarCompra(id, compra))}>Registrar pedido</button>
            </section>
          )}

          {hasCompras && ['pedido', 'recibido'].includes(solicitud.estado) && (
            <section className="card-base p-6 border-l-4 border-l-cyan-500">
              <h2 className="font-bold text-surface-900 mb-4">Avance de compra</h2>
              <textarea value={estadoCompraObs} onChange={e => setEstadoCompraObs(e.target.value)} rows={2} className="input-base mb-4 resize-y" placeholder="Observación opcional" />
              <div className="flex flex-wrap gap-3">
                {solicitud.estado === 'pedido' && (
                  <button className="btn-primary" onClick={() => ejecutar(() => solicitudesCompraAPI.actualizarEstadoCompra(id, { estado: 'recibido', observacion: estadoCompraObs }))}>Marcar recibido</button>
                )}
                {solicitud.estado === 'recibido' && (
                  <>
                    <button className="btn-primary" onClick={() => ejecutar(() => solicitudesCompraAPI.actualizarEstadoCompra(id, { estado: 'entregado_sistemas', observacion: estadoCompraObs }))}>Entregar a Sistemas</button>
                    <button className="btn-secondary" onClick={() => ejecutar(() => solicitudesCompraAPI.actualizarEstadoCompra(id, { estado: 'entregado_destinatario', observacion: estadoCompraObs }))}>Entregar a destinatario</button>
                  </>
                )}
              </div>
            </section>
          )}

          {hasInfraestructura && ['entregado_sistemas', 'entregado_destinatario'].includes(solicitud.estado) && (
            <section className="card-base p-6 border-l-4 border-l-emerald-500">
              <h2 className="font-bold text-surface-900 mb-4">Alta de equipo por Sistemas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {solicitud.tipo_equipo === 'celular' ? (
                  <input value={sistemas.imei} onChange={e => setSistemas(prev => ({ ...prev, imei: e.target.value }))} className="input-base" placeholder="IMEI" />
                ) : (
                  <input value={sistemas.numero_serie} onChange={e => setSistemas(prev => ({ ...prev, numero_serie: e.target.value }))} className="input-base" placeholder="Número de serie" />
                )}
                <input type="date" value={sistemas.fecha_adquisicion} onChange={e => setSistemas(prev => ({ ...prev, fecha_adquisicion: e.target.value }))} className="input-base" />
                <input value={sistemas.valor_adquisicion} onChange={e => setSistemas(prev => ({ ...prev, valor_adquisicion: e.target.value }))} className="input-base" placeholder="Valor" />
                <input value={sistemas.observacion} onChange={e => setSistemas(prev => ({ ...prev, observacion: e.target.value }))} className="input-base" placeholder="Observación" />
              </div>
              <button className="btn-primary mt-4" onClick={() => ejecutar(() => solicitudesCompraAPI.finalizarSistemas(id, sistemas))}>Crear inventario y finalizar</button>
            </section>
          )}

          {((solicitud.estado === 'pendiente_infra' && hasInfraestructura) || (solicitud.estado === 'aprobada_infra' && hasRRHH)) && (
            <section className="card-base p-6">
              <h2 className="font-bold text-surface-900 mb-4">Rechazar solicitud</h2>
              <div className="flex flex-col md:flex-row gap-3">
                <input value={rechazo} onChange={e => setRechazo(e.target.value)} className="input-base flex-1" placeholder="Motivo de rechazo" />
                <button
                  className="btn-secondary"
                  disabled={!rechazo.trim()}
                  onClick={() => ejecutar(() => solicitudesCompraAPI.rechazar(id, { motivo: rechazo }))}
                >
                  Rechazar
                </button>
              </div>
            </section>
          )}

          {!['comprada', 'finalizada', 'rechazada', 'cancelada'].includes(solicitud.estado) && (hasInfraestructura || hasRRHH || hasCompras) && (
            <section className="card-base p-6">
              <h2 className="font-bold text-surface-900 mb-4">Cancelar solicitud</h2>
              <p className="text-sm text-surface-500 mb-3">Quien cancela debe dejar la justificación. Se notifica a Infra, RRHH y Compras.</p>
              <div className="flex flex-col md:flex-row gap-3">
                <input value={cancelacion} onChange={e => setCancelacion(e.target.value)} className="input-base flex-1" placeholder="Motivo de cancelación" />
                <button
                  className="btn-secondary"
                  disabled={!cancelacion.trim()}
                  onClick={() => ejecutar(() => solicitudesCompraAPI.cancelar(id, { motivo: cancelacion }))}
                >
                  Cancelar solicitud
                </button>
              </div>
            </section>
          )}
        </div>

        <section className="card-base p-6 xl:sticky xl:top-6 self-start">
          <h2 className="font-bold text-surface-900 mb-4">Historial</h2>
          <TimelineSolicitud historial={solicitud.historial || []} />
        </section>
      </div>
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-surface-50 border border-surface-100 px-4 py-3">
      <dt className="text-xs font-bold text-surface-400 uppercase tracking-wider">{label}</dt>
      <dd className="font-semibold text-surface-900 mt-1 break-words">{value}</dd>
    </div>
  )
}
