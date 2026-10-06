import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { ArrowRightLeft, Laptop, Smartphone, TriangleAlert } from 'lucide-react'
import { novedadesPersonalAPI } from '../services/api'

const escaparHtml = (texto) => String(texto ?? '').replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
))

const formatFecha = (d) => d
  ? new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—'

const ESTADO_BADGE = {
  confirmada: 'bg-emerald-100 text-emerald-700',
  descartada: 'bg-surface-200 text-surface-600',
  pendiente: 'bg-amber-100 text-amber-800'
}

function textoAccion(equipo, sedeNueva) {
  switch (equipo.accion) {
    case 'mover': return `Se mueve a ${sedeNueva}`
    case 'redirigir_remito': return `Se redirige el remito ${equipo.remitos.map(r => r.numero_remito).join(', ')} a ${sedeNueva}`
    case 'sin_cambios': return 'Ya está en la sede nueva'
    case 'bloqueado': return 'Bloqueado'
    default: return equipo.accion
  }
}

function IconoEquipo({ tipo }) {
  const Icono = tipo === 'notebook' ? Laptop : Smartphone
  return <Icono className="w-4 h-4 text-surface-500 shrink-0" aria-hidden="true" />
}

export default function NovedadesPersonalPage() {
  const [vista, setVista] = useState('pendiente')
  const [novedades, setNovedades] = useState([])
  const [loading, setLoading] = useState(true)
  const [procesandoId, setProcesandoId] = useState(null)

  const cargar = async () => {
    try {
      setLoading(true)
      const res = await novedadesPersonalAPI.list(vista === 'pendiente' ? 'pendiente' : 'todas')
      const data = res?.data || []
      setNovedades(vista === 'pendiente' ? data : data.filter(n => n.estado !== 'pendiente'))
    } catch (err) {
      Swal.fire('Error', err.message || 'No se pudieron cargar las novedades', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [vista])

  const confirmar = async (novedad) => {
    const nombre = escaparHtml(`${novedad.personal?.nombre} ${novedad.personal?.apellido}`)
    const cantidad = novedad.traslado?.equipos?.length || 0
    const result = await Swal.fire({
      title: '¿Confirmar movimiento?',
      html: cantidad > 0
        ? `Se trasladarán <b>${cantidad}</b> equipo(s) de <b>${nombre}</b> a <b>${escaparHtml(novedad.sedeNueva?.nombre_sede)}</b>.`
        : `<b>${nombre}</b> no tiene celular ni notebook asignados: solo se registra la novedad como confirmada.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar movimiento',
      cancelButtonText: 'Cancelar'
    })
    if (!result.isConfirmed) return

    try {
      setProcesandoId(novedad.id)
      await novedadesPersonalAPI.confirmar(novedad.id)
      await Swal.fire('Movimiento confirmado', 'Los equipos quedaron en la sede nueva.', 'success')
      await cargar()
    } catch (err) {
      Swal.fire('No se pudo confirmar', err.message, 'error')
    } finally {
      setProcesandoId(null)
    }
  }

  const descartar = async (novedad) => {
    const result = await Swal.fire({
      title: '¿Descartar novedad?',
      text: 'Los equipos no se mueven. Podés dejar un comentario.',
      input: 'text',
      inputPlaceholder: 'Motivo (opcional)',
      showCancelButton: true,
      confirmButtonText: 'Descartar',
      cancelButtonText: 'Cancelar'
    })
    if (!result.isConfirmed) return

    try {
      setProcesandoId(novedad.id)
      await novedadesPersonalAPI.descartar(novedad.id, result.value || undefined)
      await cargar()
    } catch (err) {
      Swal.fire('No se pudo descartar', err.message, 'error')
    } finally {
      setProcesandoId(null)
    }
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-surface-900">Novedades de movimiento de personal</h1>
          <p className="text-surface-500 mt-1">
            Cambios de sede detectados por la sincronización con Microsoft 365. Al confirmar, el celular y la notebook asignados pasan a la sede nueva.
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          {[['pendiente', 'Pendientes'], ['historial', 'Historial']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setVista(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${vista === key ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 border border-surface-200'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="card-base py-12 text-center text-surface-500">Cargando...</div>
        ) : novedades.length === 0 ? (
          <div className="card-base py-12 text-center text-surface-500">
            {vista === 'pendiente' ? 'No hay novedades pendientes.' : 'Todavía no hay novedades resueltas.'}
          </div>
        ) : (
          <ul className="space-y-4">
            {novedades.map(n => (
              <li key={n.id} className="card-base p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link to={`/personal/${n.personal?.id}`} className="text-lg font-bold text-primary-700 hover:underline">
                      {n.personal?.nombre} {n.personal?.apellido}
                    </Link>
                    <p className="text-xs text-surface-500">{n.personal?.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${ESTADO_BADGE[n.estado]}`}>
                      {n.estado}
                    </span>
                    <p className="text-xs text-surface-500 mt-1">Detectada {formatFecha(n.created_at)}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-surface-700">{n.sedeAnterior?.nombre_sede || 'Sin sede'}</span>
                  <ArrowRightLeft className="w-4 h-4 text-surface-400" aria-hidden="true" />
                  <span className="font-semibold text-surface-900">
                    {n.sedeNueva?.nombre_sede || 'Sin sede (pertenece a varias sedes en Microsoft 365)'}
                  </span>
                </div>

                {n.estado === 'pendiente' ? (
                  <DetallePendiente novedad={n} />
                ) : (
                  <DetalleResuelta novedad={n} />
                )}

                {n.estado === 'pendiente' && (
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      onClick={() => descartar(n)}
                      disabled={procesandoId === n.id}
                      className="btn-secondary"
                    >
                      Descartar
                    </button>
                    <button
                      onClick={() => confirmar(n)}
                      disabled={procesandoId === n.id || n.sinSedeNueva || n.desactualizada || !n.traslado?.puedeTrasladar}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {procesandoId === n.id ? 'Procesando...' : 'Confirmar movimiento'}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Aviso({ children }) {
  return (
    <p className="mt-3 flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
      <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

function DetallePendiente({ novedad }) {
  const equipos = novedad.traslado?.equipos || []
  const bloqueos = novedad.traslado?.bloqueos || []
  const sedeNueva = novedad.sedeNueva?.nombre_sede

  return (
    <>
      {novedad.sinSedeNueva && (
        <Aviso>No hay una sede a la que mover los equipos. Descartá la novedad o asigná la sede desde la ficha de la persona.</Aviso>
      )}
      {novedad.desactualizada && !novedad.sinSedeNueva && (
        <Aviso>La sede de la persona cambió después de esta novedad. Descartala y revisá la ficha de la persona.</Aviso>
      )}

      <div className="mt-3">
        <p className="text-xs font-bold uppercase tracking-wide text-surface-400 mb-1">Equipos asignados</p>
        {equipos.length === 0 ? (
          <p className="text-sm text-surface-500">Sin celular ni notebook asignados.</p>
        ) : (
          <ul className="space-y-1">
            {equipos.map(e => (
              <li key={e.inventario_id} className="flex flex-wrap items-center gap-2 text-sm">
                <IconoEquipo tipo={e.tipo} />
                <span className="font-medium text-surface-900">{e.descripcion}</span>
                <span className={e.accion === 'bloqueado' ? 'text-rose-700 font-semibold' : 'text-surface-500'}>
                  — {textoAccion(e, sedeNueva)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {bloqueos.map((b, i) => <Aviso key={i}>{b.motivo}</Aviso>)}
    </>
  )
}

function DetalleResuelta({ novedad }) {
  const trasladados = novedad.equipos_trasladados || []
  return (
    <div className="mt-3 text-sm text-surface-600 space-y-1">
      <p>
        {novedad.estado === 'confirmada' ? 'Confirmada' : 'Descartada'} {formatFecha(novedad.resuelto_en)}
        {novedad.resueltoPor && ` por ${novedad.resueltoPor.nombre} ${novedad.resueltoPor.apellido}`}
      </p>
      {novedad.estado === 'confirmada' && (
        <p>{trasladados.length > 0 ? `${trasladados.length} movimiento(s) de equipos realizados.` : 'No había equipos para mover.'}</p>
      )}
      {novedad.observaciones && <p className="italic">{novedad.observaciones}</p>}
    </div>
  )
}
