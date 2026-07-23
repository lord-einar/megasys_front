import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { solicitudesAsignacionAPI, categoriaEquiposAsignacionAPI } from '../services/api'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'
import StatusBadgeAsignacion from '../components/solicitudesAsignacion/StatusBadgeAsignacion'
import TimelineAsignacion from '../components/solicitudesAsignacion/TimelineAsignacion'
import SelectBeneficiario from '../components/solicitudesCompra/SelectBeneficiario'
import { usePermissions } from '../hooks/usePermissions'

const MOTIVOS_REPOSICION = ['reposicion_robo', 'reposicion_perdida', 'reposicion_rotura']

// Identificador para distinguir equipos en el dropdown: IMEI para celulares,
// número de serie para notebook/PC.
function identificadorEquipo(inv, tipoEquipo) {
  if (tipoEquipo === 'celular') {
    if (inv.imei) return ` · IMEI ${inv.imei}`
    if (inv.numero_serie) return ` · S/N ${inv.numero_serie}`
    return ''
  }
  return inv.numero_serie ? ` · S/N ${inv.numero_serie}` : ''
}

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

  // Generar remito
  const [tecnicoId, setTecnicoId] = useState('')
  const [soporte, setSoporte] = useState([])

  // Rechazo y cancelación
  const [rechazo, setRechazo] = useState('')
  const [cancelacion, setCancelacion] = useState('')

  // Reenviar aviso
  const [reenviando, setReenviando] = useState(false)
  const [avisoEnviado, setAvisoEnviado] = useState(false)

  // Edición de la solicitud
  const [editando, setEditando] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [guardandoEdicion, setGuardandoEdicion] = useState(false)

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

  // Cargar categorías cuando Infra revisa o Compras resuelve una compra pendiente
  useEffect(() => {
    if (!solicitud || (!hasInfraestructura && !hasCompras)) return
    if (solicitud.inventario_asignado_id) return
    if (solicitud.estado !== 'pendiente_infra' && !(hasCompras && solicitud.estado === 'aprobada' && solicitud.compra_pendiente)) return
    categoriaEquiposAsignacionAPI.list({ tipo: solicitud.tipo_equipo, activo: true })
      .then(res => setCategorias(normalizeApiResponse(res, 200).data))
      .catch(() => setCategorias([]))
  }, [solicitud?.id, solicitud?.estado, hasInfraestructura, hasCompras])

  // Recargar inventario disponible cada vez que cambia la categoría seleccionada
  useEffect(() => {
    if (!solicitud || solicitud.inventario_asignado_id) return
    if (solicitud.estado !== 'pendiente_infra' && !(hasCompras && solicitud.estado === 'aprobada' && solicitud.compra_pendiente)) return
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
  }, [asignacion.categoria_id, solicitud?.id, hasCompras])

  const ejecutar = async (fn) => {
    try {
      setError(null)
      await fn()
      await cargar()
    } catch (err) {
      setError(err.message || 'Error procesando acción')
    }
  }

  const abrirEdicion = () => {
    setError(null)
    setEditForm({
      tipo_equipo: solicitud.tipo_equipo,
      motivo: solicitud.motivo,
      observacion_solicitante: solicitud.observacion_solicitante || '',
      beneficiario_personal_id: solicitud.beneficiario_personal_id || solicitud.beneficiario?.id || '',
      denuncia_presentada: solicitud.denuncia_presentada === true ? 'true'
        : solicitud.denuncia_presentada === false ? 'false' : '',
      comentario_edicion: ''
    })
    setEditando(true)
  }

  const setEdit = (field, value) => setEditForm(prev => ({ ...prev, [field]: value }))

  const guardarEdicion = async () => {
    setGuardandoEdicion(true)
    setError(null)
    try {
      if (!editForm.beneficiario_personal_id) {
        throw new Error('Seleccioná un beneficiario de la lista')
      }
      const payload = {
        tipo_equipo: editForm.tipo_equipo,
        motivo: editForm.motivo,
        observacion_solicitante: editForm.observacion_solicitante,
        beneficiario_personal_id: editForm.beneficiario_personal_id,
        comentario_edicion: editForm.comentario_edicion || null
      }
      if (editForm.motivo === 'reposicion_robo') {
        payload.denuncia_presentada = editForm.denuncia_presentada === 'true'
      }
      await solicitudesAsignacionAPI.editar(id, payload)
      setEditando(false)
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al editar la solicitud')
    } finally {
      setGuardandoEdicion(false)
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
  const solicitudFija = !!solicitud.inventario_asignado_id || !!solicitud.remito_id || solicitud.estado === 'remito_generado'

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
          <div className="flex items-center gap-2">
            <StatusBadgeAsignacion estado={solicitud.estado} />
            {solicitud.compra_pendiente && !solicitud.inventario_asignado_id && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-orange-50 text-orange-700 border-orange-200">
                Compra pendiente
              </span>
            )}
          </div>
          {!esTerminal && !solicitudFija && (hasInfraestructura || hasRRHH || hasCompras) && !editando && (
            <button
              onClick={abrirEdicion}
              className="text-xs font-medium text-surface-500 hover:text-primary-600 border border-surface-200 hover:border-primary-300 rounded-lg px-3 py-1.5 transition-colors"
            >
              Editar solicitud
            </button>
          )}
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

          {/* Edición de la solicitud */}
          {editando && editForm && (
            <section className="card-base p-6 border-l-4 border-l-primary-500">
              <h2 className="font-bold text-surface-900 mb-1">Editar solicitud</h2>
              <p className="text-sm text-surface-500 mb-4">
                Los cambios quedan registrados en el historial y se avisa por mail a Compras, RRHH e Infraestructura.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-base block mb-1">Tipo de equipo</label>
                  <select
                    value={editForm.tipo_equipo}
                    onChange={e => setEdit('tipo_equipo', e.target.value)}
                    disabled={!!solicitud.inventario_asignado_id}
                    className="input-base"
                  >
                    <option value="celular">Celular</option>
                    <option value="notebook">Notebook</option>
                    <option value="pc_escritorio">PC de escritorio</option>
                  </select>
                  {!!solicitud.inventario_asignado_id && (
                    <p className="text-xs text-surface-400 mt-1">No se puede cambiar el tipo con un equipo ya asignado.</p>
                  )}
                </div>
                <div>
                  <label className="label-base block mb-1">Motivo</label>
                  <select
                    value={editForm.motivo}
                    onChange={e => setEdit('motivo', e.target.value)}
                    className="input-base"
                  >
                    <option value="nuevo_ingreso">Nuevo ingreso</option>
                    <option value="nuevo_puesto">Nuevo puesto</option>
                    <option value="reposicion_robo">Reposición por robo</option>
                    <option value="reposicion_perdida">Reposición por pérdida</option>
                    <option value="reposicion_rotura">Reposición por rotura</option>
                    <option value="cambio_equipo">Cambio de equipo</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label-base block mb-1">Beneficiario</label>
                  <SelectBeneficiario
                    value={editForm.beneficiario_personal_id}
                    onChange={(pid) => setEdit('beneficiario_personal_id', pid || '')}
                    disabled={guardandoEdicion}
                  />
                </div>
                {editForm.motivo === 'reposicion_robo' && (
                  <div>
                    <label className="label-base block mb-1">Denuncia presentada</label>
                    <select
                      value={editForm.denuncia_presentada}
                      onChange={e => setEdit('denuncia_presentada', e.target.value)}
                      className="input-base"
                    >
                      <option value="">Seleccionar</option>
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="label-base block mb-1">Descripción amplia</label>
                  <textarea
                    value={editForm.observacion_solicitante}
                    onChange={e => setEdit('observacion_solicitante', e.target.value)}
                    rows={4}
                    className="input-base resize-y"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label-base block mb-1">Comentario del cambio (opcional)</label>
                  <input
                    value={editForm.comentario_edicion}
                    onChange={e => setEdit('comentario_edicion', e.target.value)}
                    className="input-base"
                    placeholder="Por qué se edita la solicitud"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button className="btn-primary" disabled={guardandoEdicion} onClick={guardarEdicion}>
                  {guardandoEdicion ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button className="btn-secondary" disabled={guardandoEdicion} onClick={() => setEditando(false)}>
                  Cancelar
                </button>
              </div>
            </section>
          )}

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

          {/* Acción: Revisión de Infraestructura (asignar equipo / solicitar compra / aprobar) */}
          {((hasInfraestructura && !esTerminal && solicitud.estado !== 'remito_generado' &&
            (solicitud.estado === 'pendiente_infra' || (solicitud.compra_pendiente && !solicitud.inventario_asignado_id))) ||
            (hasCompras && solicitud.estado === 'aprobada' && solicitud.compra_pendiente && !solicitud.inventario_asignado_id)) && !editando && (
            <section className="card-base p-6 border-l-4 border-l-sky-500">
              <h2 className="font-bold text-surface-900 mb-1">
                {hasCompras && !hasInfraestructura && solicitud.estado === 'aprobada' ? 'Asignar equipo comprado' : solicitud.estado === 'pendiente_infra' ? 'Revisión de Infraestructura' : 'Asignar equipo'}
              </h2>

              {solicitud.compra_pendiente && !solicitud.inventario_asignado_id && (
                <div className="mb-4 rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-sm text-orange-700">
                  Compra del equipo pendiente.{' '}
                  {hasCompras && !hasInfraestructura && solicitud.estado === 'aprobada'
                    ? 'Al asignar el equipo se generará un borrador de remito para que Infraestructura lo complete.'
                    : solicitud.estado === 'pendiente_infra'
                    ? 'Podés aprobar por Infra igual; cuando entre el stock se asignará el equipo.'
                    : 'La aprobación sigue su curso; cuando entre el stock, seleccioná la categoría y el equipo para asignarlo.'}
                </div>
              )}

              {solicitud.inventario_asignado_id && (
                <div className="mb-4 rounded-lg bg-sky-50 border border-sky-100 px-3 py-2 text-sm text-sky-800">
                  Equipo asignado:{' '}
                  <strong>{solicitud.inventarioAsignado?.marca} {solicitud.inventarioAsignado?.modelo}</strong>
                  {solicitud.inventarioAsignado?.numero_serie ? ` · S/N ${solicitud.inventarioAsignado.numero_serie}` : ''}
                </div>
              )}

              {!solicitud.inventario_asignado_id && (
              <>
              <p className="text-sm text-surface-500 mb-4">
                Seleccioná primero la categoría para ver los equipos disponibles correspondientes.
                {solicitud.estado === 'pendiente_infra' && !solicitud.compra_pendiente && ' Si no hay stock, podés solicitar la compra.'}
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
                          {identificadorEquipo(inv, solicitud.tipo_equipo)}
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
              <div className="mt-4 flex flex-wrap gap-3">
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
                {solicitud.estado === 'pendiente_infra' && !solicitud.compra_pendiente && (
                  <button
                    className="btn-secondary"
                    onClick={() => ejecutar(() => solicitudesAsignacionAPI.solicitarCompra(id, {
                      observacion: asignacion.observacion || null
                    }))}
                  >
                    Solicitar compra
                  </button>
                )}
              </div>
              </>
              )}

              {solicitud.estado === 'pendiente_infra' && (
                <div className="mt-6 pt-4 border-t border-surface-100">
                  {!solicitud.inventario_asignado_id && !solicitud.compra_pendiente && (
                    <p className="text-sm text-surface-500 mb-3">
                      Para aprobar por Infraestructura primero asigná un equipo o marcá "Solicitar compra".
                    </p>
                  )}
                  <button
                    className="btn-primary"
                    onClick={() => ejecutar(() => solicitudesAsignacionAPI.aprobarInfra(id, {
                      observacion: asignacion.observacion || null
                    }))}
                  >
                    Aprobado por Infra
                  </button>
                </div>
              )}
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
                Aprobado por RRHH
              </button>
            </section>
          )}

          {/* Acción: Generar remito (aprobada + Infra + equipo ya asignado) */}
          {hasInfraestructura && solicitud.estado === 'aprobada' && solicitud.inventario_asignado_id && (
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

          {/* Estado fijo: remito generado */}
          {solicitud.estado === 'remito_generado' && (
            <section className="card-base p-6 border-l-4 border-l-emerald-500">
              <h2 className="font-bold text-surface-900 mb-4">Solicitud fijada</h2>
              {solicitud.remito_id && (
                <p className="text-sm text-surface-600 mb-3">
                  El remito ya fue generado. La evolución posterior se gestiona desde Remitos:{' '}
                  <button
                    onClick={() => navigate(`/remitos/${solicitud.remito_id}`)}
                    className="text-primary-700 hover:underline font-medium"
                  >
                    Ver remito
                  </button>
                </p>
              )}
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
          {!esTerminal && !solicitud.remito_id && (hasInfraestructura || hasRRHH || hasCompras) && (
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
