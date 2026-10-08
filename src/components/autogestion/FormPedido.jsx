import { useState } from 'react'
import { AlertTriangle, Send } from 'lucide-react'
import CamposPedidoEquipo from '../solicitudesAsignacion/CamposPedidoEquipo'
import { autogestionAPI } from '../../services/autogestionApi'
import { esReposicion } from '../../utils/solicitudAsignacion'

const FORM_INICIAL = { tipo_equipo: 'celular', motivo: 'nuevo_ingreso', inventario_anterior_id: '', denuncia_presentada: '' }

/**
 * Pedido de equipo de la persona logueada. Los campos son los mismos que el
 * alta de solicitudes del portal (CamposPedidoEquipo), con los equipos propios
 * como fuente del "equipo a reponer".
 */
export default function FormPedido({ personalId, onCreado }) {
  const [valores, setValores] = useState(FORM_INICIAL)
  const [observacion, setObservacion] = useState('')
  const [adjuntos, setAdjuntos] = useState({ denuncia: null, rotura: null })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const setCampo = (campo, valor) => setValores(prev => ({ ...prev, [campo]: valor }))

  const enviar = async (e) => {
    e.preventDefault()
    setError(null)
    if (esReposicion(valores.motivo) && !valores.inventario_anterior_id) {
      return setError('Elegí el equipo que se va a reponer.')
    }
    if (valores.motivo === 'reposicion_robo' && valores.denuncia_presentada === '') {
      return setError('Indicá si hiciste la denuncia.')
    }
    if (valores.motivo === 'reposicion_rotura' && !adjuntos.rotura) {
      return setError('Subí una foto del equipo roto.')
    }

    setEnviando(true)
    try {
      const res = await autogestionAPI.crearPedido({
        tipo_equipo: valores.tipo_equipo,
        motivo: valores.motivo,
        observacion,
        inventario_anterior_id: esReposicion(valores.motivo) ? valores.inventario_anterior_id : null,
        denuncia_presentada: valores.motivo === 'reposicion_robo' ? valores.denuncia_presentada === 'true' : null
      })
      const pedido = res.data

      // Los adjuntos van después de crear el pedido; si fallan, el pedido igual quedó hecho
      let avisoAdjuntos = null
      for (const tipo of ['denuncia', 'rotura']) {
        if (!adjuntos[tipo]) continue
        try {
          await autogestionAPI.subirAdjunto(pedido.id, tipo, adjuntos[tipo])
        } catch (err) {
          avisoAdjuntos = `El pedido se envió, pero no se pudo subir el archivo (${err.message}).`
        }
      }

      setValores(FORM_INICIAL)
      setObservacion('')
      setAdjuntos({ denuncia: null, rotura: null })
      onCreado?.(res.message, avisoAdjuntos)
    } catch (err) {
      setError(err.message || 'No se pudo enviar el pedido')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="card-base p-6 space-y-5" aria-labelledby="titulo-pedir">
      <div>
        <h2 id="titulo-pedir" className="text-base font-bold text-surface-900">Pedir un equipo</h2>
        <p className="text-sm text-surface-600 mt-1">Tu superior recibe un mail para aprobarlo. Después pasa a Infraestructura para asignarte el equipo.</p>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-md px-3 py-2 text-sm font-semibold status-stop" role="alert">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}

      <CamposPedidoEquipo
        valores={valores}
        onChange={setCampo}
        personalId={personalId}
        onAdjuntoChange={(tipo, archivo) => setAdjuntos(prev => ({ ...prev, [tipo]: archivo }))}
        cargarEquipos={autogestionAPI.misEquipos}
        disabled={enviando}
      />

      <label className="block">
        <span className="label-base">¿Para qué lo necesitás?</span>
        <textarea
          className="input-base resize-y"
          rows={4}
          required
          maxLength={2000}
          value={observacion}
          onChange={e => setObservacion(e.target.value)}
          placeholder="Contá para qué vas a usar el equipo o qué pasó con el actual."
          disabled={enviando}
        />
      </label>

      <button type="submit" className="btn-primary" disabled={enviando}>
        <Send className="h-5 w-5" aria-hidden="true" />
        {enviando ? 'Enviando…' : 'Enviar pedido'}
      </button>
    </form>
  )
}
