import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Check, CircleCheck, Paperclip, X } from 'lucide-react'
import EstadoPedido from '../components/autogestion/EstadoPedido'
import { autogestionAPI, sesionAutogestion, volverDespuesDelLogin } from '../services/autogestionApi'
import { TIPO_EQUIPO_LABELS } from '../utils/tipoEquipo'
import { etiquetaMotivo } from '../utils/solicitudAsignacion'

const fecha = (iso) => new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
const nombre = (p) => (p ? `${p.nombre} ${p.apellido}` : '')

/**
 * Pantalla del superior para aprobar o rechazar un pedido (link del mail).
 * Exige haber ingresado con Microsoft; el back verifica que sea el aprobador asignado.
 */
export default function AprobarPedidoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pedido, setPedido] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [nota, setNota] = useState('')
  const [rechazando, setRechazando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    if (!sesionAutogestion.token()) {
      volverDespuesDelLogin.guardar(`/autogestion/aprobar/${id}`)
      navigate('/autogestion', { replace: true })
      return
    }
    autogestionAPI.paraAprobar(id)
      .then(res => setPedido(res.data))
      .catch(err => {
        if (err.status === 401) {
          volverDespuesDelLogin.guardar(`/autogestion/aprobar/${id}`)
          navigate('/autogestion', { replace: true })
        } else setError(err.message)
      })
      .finally(() => setCargando(false))
  }, [id])

  const decidir = async (aprobar) => {
    setError(null)
    if (!aprobar && !motivo.trim()) return setError('Indicá el motivo del rechazo.')
    setEnviando(true)
    try {
      const res = aprobar ? await autogestionAPI.aprobar(id, nota) : await autogestionAPI.rechazar(id, motivo)
      setPedido(res.data)
      setResultado(res.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const pendiente = pedido?.estado === 'pendiente_superior'
  const s = pedido?.solicitante

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-nav-bg text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <p className="font-bold">Grupo Megatlon <span className="font-normal text-nav-text">· Aprobación de pedido</span></p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Link to="/autogestion" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a mis pedidos
        </Link>

        {resultado && (
          <div className="card-base p-4 flex items-start gap-3 status-done" role="status">
            <CircleCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="text-sm font-semibold">{resultado}</p>
          </div>
        )}
        {error && (
          <div className="card-base p-4 flex items-start gap-3 status-stop" role="alert">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {cargando ? (
          <div className="skeleton h-64" role="status" aria-label="Cargando el pedido" />
        ) : pedido && (
          <section className="card-base p-6 space-y-5">
            <div>
              <h1 className="page-title">Pedido de {nombre(s)}</h1>
              <p className="text-sm text-surface-600 mt-1">
                PE-{String(pedido.numero).padStart(4, '0')} · {fecha(pedido.created_at)}
                {pendiente && pedido.vence_en ? ` · tenés tiempo hasta el ${fecha(pedido.vence_en)}` : ''}
              </p>
            </div>

            <EstadoPedido pedido={pedido} />

            <dl className="grid gap-4 sm:grid-cols-2">
              <Dato etiqueta="Sede" valor={s?.sede?.nombre_sede || '—'} />
              <Dato etiqueta="Puesto" valor={s?.puesto?.nombre || '—'} />
              <Dato etiqueta="Equipo" valor={TIPO_EQUIPO_LABELS[pedido.tipo_equipo]} />
              <Dato etiqueta="Motivo" valor={etiquetaMotivo(pedido.motivo)} />
              {pedido.inventarioAnterior && (
                <Dato etiqueta="Equipo a reponer" valor={`${pedido.inventarioAnterior.marca} ${pedido.inventarioAnterior.modelo}${pedido.inventarioAnterior.numero_serie ? ` (S/N ${pedido.inventarioAnterior.numero_serie})` : ''}`} />
              )}
              {pedido.motivo === 'reposicion_robo' && (
                <Dato etiqueta="Denuncia" valor={pedido.denuncia_presentada ? 'Presentada' : 'No presentada'} />
              )}
            </dl>

            <div>
              <p className="text-sm text-surface-600">Para qué lo necesita</p>
              <p className="mt-1 whitespace-pre-line rounded-md bg-surface-50 border border-surface-200 p-3">{pedido.observacion}</p>
            </div>

            {pedido.adjuntos?.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {pedido.adjuntos.map(a => (
                  <li key={a.id}>
                    <a href={a.url} target="_blank" rel="noreferrer" className="btn-secondary">
                      <Paperclip className="h-4 w-4" aria-hidden="true" />
                      {a.tipo === 'denuncia' ? 'Denuncia' : 'Foto de la rotura'}
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {pedido.motivo_rechazo && <p className="text-sm"><strong>Motivo del rechazo:</strong> {pedido.motivo_rechazo}</p>}
            {pedido.nota_aprobacion && <p className="text-sm"><strong>Tu nota:</strong> {pedido.nota_aprobacion}</p>}

            {pendiente && (
              <div className="border-t border-surface-200 pt-5 space-y-4">
                {!rechazando ? (
                  <>
                    <label className="block">
                      <span className="label-base">Nota para {s?.nombre} (opcional)</span>
                      <textarea className="input-base resize-y" rows={2} maxLength={1000} value={nota}
                        onChange={e => setNota(e.target.value)} disabled={enviando} />
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <button className="btn-primary" onClick={() => decidir(true)} disabled={enviando}>
                        <Check className="h-5 w-5" aria-hidden="true" /> {enviando ? 'Aprobando…' : 'Aprobar'}
                      </button>
                      <button className="btn-danger" onClick={() => { setError(null); setRechazando(true) }} disabled={enviando}>
                        <X className="h-5 w-5" aria-hidden="true" /> Rechazar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <label className="block">
                      <span className="label-base">Motivo del rechazo</span>
                      <textarea className="input-base resize-y" rows={3} maxLength={1000} required autoFocus value={motivo}
                        onChange={e => setMotivo(e.target.value)} disabled={enviando}
                        placeholder={`Se lo vamos a mostrar a ${s?.nombre}`} />
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <button className="btn-danger" onClick={() => decidir(false)} disabled={enviando}>
                        {enviando ? 'Rechazando…' : 'Confirmar rechazo'}
                      </button>
                      <button className="btn-secondary" onClick={() => setRechazando(false)} disabled={enviando}>Volver</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

function Dato({ etiqueta, valor }) {
  return (
    <div>
      <dt className="text-sm text-surface-600">{etiqueta}</dt>
      <dd className="font-semibold text-surface-900">{valor}</dd>
    </div>
  )
}
