import SelectInventarioAsignado from './SelectInventarioAsignado'
import { TIPO_EQUIPO_LABELS } from '../../utils/tipoEquipo'
import { MOTIVO_LABELS, esReposicion, requiereDocumentacion } from '../../utils/solicitudAsignacion'

const fileClass = 'input-base file:mr-4 file:rounded-lg file:border-0 file:bg-surface-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-surface-700'

/**
 * Datos del equipo pedido: tipo, motivo y, según el motivo, equipo actual a
 * reponer, denuncia y adjuntos. Lo usan el alta y la edición de solicitudes
 * (y la futura autogestión). El beneficiario queda afuera: lo elige cada pantalla.
 *
 * @param {Object} props
 * @param {{tipo_equipo, motivo, inventario_anterior_id, denuncia_presentada}} props.valores
 *   denuncia_presentada como string: '' | 'true' | 'false'
 * @param {(campo: string, valor: string) => void} props.onChange
 * @param {string} props.personalId - beneficiario, para listar sus equipos actuales
 * @param {(tipo: 'denuncia'|'rotura', archivo: File|null) => void} [props.onAdjuntoChange]
 *   si no se pasa, no se muestran los adjuntos (la edición no los sube)
 * @param {boolean} [props.tipoBloqueado] - con equipo asignado no se puede cambiar el tipo
 * @param {boolean} [props.disabled]
 */
export default function CamposPedidoEquipo({ valores, onChange, personalId, onAdjuntoChange, tipoBloqueado = false, disabled = false }) {
  const { tipo_equipo: tipoEquipo, motivo } = valores
  const conAdjuntos = typeof onAdjuntoChange === 'function'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <label>
        <span className="label-base">Tipo de equipo</span>
        <select
          value={tipoEquipo}
          onChange={e => onChange('tipo_equipo', e.target.value)}
          disabled={disabled || tipoBloqueado}
          className="input-base"
        >
          {Object.entries(TIPO_EQUIPO_LABELS).map(([valor, label]) => (
            <option key={valor} value={valor}>{label}</option>
          ))}
        </select>
        {tipoBloqueado && (
          <p className="text-xs text-surface-400 mt-1">No se puede cambiar el tipo con un equipo ya asignado.</p>
        )}
      </label>

      <label>
        <span className="label-base">Motivo</span>
        <select
          value={motivo}
          onChange={e => onChange('motivo', e.target.value)}
          disabled={disabled}
          className="input-base"
        >
          {Object.entries(MOTIVO_LABELS).map(([valor, label]) => (
            <option key={valor} value={valor}>{label}</option>
          ))}
        </select>
      </label>

      {esReposicion(motivo) && (
        <label className="block md:col-span-2">
          <span className="label-base">Equipo actual a reponer</span>
          <SelectInventarioAsignado
            personalId={personalId}
            tipoEquipo={tipoEquipo}
            value={valores.inventario_anterior_id}
            onChange={(id) => onChange('inventario_anterior_id', id || '')}
            disabled={disabled}
          />
        </label>
      )}

      {motivo === 'reposicion_robo' && (
        <label>
          <span className="label-base">Denuncia presentada</span>
          <select
            value={valores.denuncia_presentada}
            onChange={e => onChange('denuncia_presentada', e.target.value)}
            disabled={disabled}
            className="input-base"
          >
            <option value="">Seleccionar</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </label>
      )}

      {conAdjuntos && requiereDocumentacion(motivo) && (
        motivo === 'reposicion_robo' ? (
          <label>
            <span className="label-base">Denuncia adjunta (opcional)</span>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={e => onAdjuntoChange('denuncia', e.target.files?.[0] || null)}
              disabled={disabled}
              className={fileClass}
            />
          </label>
        ) : (
          <label className="block md:col-span-2">
            <span className="label-base">Foto/evidencia de rotura</span>
            <input
              type="file"
              accept="image/*"
              required
              onChange={e => onAdjuntoChange('rotura', e.target.files?.[0] || null)}
              disabled={disabled}
              className={fileClass}
            />
          </label>
        )
      )}
    </div>
  )
}
