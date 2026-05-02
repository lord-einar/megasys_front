import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { solicitudesCompraAPI } from '../services/api'
import SelectBeneficiario from '../components/solicitudesCompra/SelectBeneficiario'
import SelectInventarioAsignado from '../components/solicitudesCompra/SelectInventarioAsignado'

const MOTIVOS_REPOSICION = ['reposicion_robo', 'reposicion_perdida', 'reposicion_rotura']

export default function SolicitudCompraFormPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    tipo_equipo: 'celular',
    motivo: 'nuevo_ingreso',
    observacion_solicitante: '',
    beneficiario_personal_id: '',
    inventario_actual_id: '',
    denuncia_presentada: ''
  })
  const [adjuntos, setAdjuntos] = useState({ denuncia: null, rotura: null })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const esReposicion = MOTIVOS_REPOSICION.includes(form.motivo)

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const guardar = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (form.motivo === 'reposicion_rotura' && !adjuntos.rotura) {
        throw new Error('Para reposición por rotura debe cargarse una foto/evidencia del equipo dañado')
      }

      const payload = {
        ...form,
        inventario_actual_id: esReposicion ? form.inventario_actual_id : null,
        denuncia_presentada: form.motivo === 'reposicion_robo' ? form.denuncia_presentada === 'true' : null
      }

      const res = await solicitudesCompraAPI.crear(payload)

      if (form.motivo === 'reposicion_robo' && adjuntos.denuncia) {
        await solicitudesCompraAPI.subirAdjunto(res.data.id, { tipo: 'denuncia', archivo: adjuntos.denuncia })
      }

      if (form.motivo === 'reposicion_rotura' && adjuntos.rotura) {
        await solicitudesCompraAPI.subirAdjunto(res.data.id, { tipo: 'rotura', archivo: adjuntos.rotura })
      }

      navigate(`/solicitudes-compra/${res.data.id}`)
    } catch (err) {
      setError(err.message || 'Error al crear solicitud')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Solicitudes de compra</p>
          <h1 className="text-2xl font-bold text-surface-900">Nueva solicitud</h1>
          <p className="text-surface-500 mt-1 font-medium">Carga manual de celulares y notebooks</p>
        </div>
        <button type="button" onClick={() => navigate('/solicitudes-compra')} className="btn-secondary">
          Volver al listado
        </button>
      </div>

      <form onSubmit={guardar} className="card-base p-6 sm:p-8 max-w-4xl space-y-8">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-sm font-medium text-rose-700">{error}</p>
          </div>
        )}

        <section>
          <div className="mb-5">
            <h2 className="text-base font-bold text-surface-900">Clasificación</h2>
            <p className="text-sm text-surface-500 mt-1">Define el tipo de equipo y el motivo general de la solicitud.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label>
              <span className="label-base">Tipo de equipo</span>
              <select value={form.tipo_equipo} onChange={e => set('tipo_equipo', e.target.value)} className="input-base">
                <option value="celular">Celular</option>
                <option value="notebook">Notebook</option>
              </select>
            </label>
            <label>
              <span className="label-base">Tipo de justificación</span>
              <select value={form.motivo} onChange={e => set('motivo', e.target.value)} className="input-base">
                <option value="nuevo_ingreso">Nuevo ingreso</option>
                <option value="nuevo_puesto">Nuevo puesto</option>
                <option value="reposicion_robo">Reposición por robo</option>
                <option value="reposicion_perdida">Reposición por pérdida</option>
                <option value="reposicion_rotura">Reposición por rotura</option>
                <option value="cambio_equipo">Cambio de equipo</option>
                <option value="otro">Otro</option>
              </select>
            </label>
          </div>
        </section>

        <section className="border-t border-surface-100 pt-8">
          <div className="mb-5">
            <h2 className="text-base font-bold text-surface-900">Beneficiario</h2>
            <p className="text-sm text-surface-500 mt-1">La persona debe existir previamente en Personal.</p>
          </div>
          <label className="block">
            <span className="label-base">Personal</span>
            <SelectBeneficiario value={form.beneficiario_personal_id} onChange={(id) => set('beneficiario_personal_id', id || '')} disabled={saving} />
          </label>
        </section>

        {esReposicion && (
          <section className="border-t border-surface-100 pt-8">
            <div className="mb-5">
              <h2 className="text-base font-bold text-surface-900">Equipo actual</h2>
              <p className="text-sm text-surface-500 mt-1">Selecciona el activo vigente que se va a reponer.</p>
            </div>
            <label className="block">
              <span className="label-base">Equipo actual a reponer</span>
              <SelectInventarioAsignado
                personalId={form.beneficiario_personal_id}
                tipoEquipo={form.tipo_equipo}
                value={form.inventario_actual_id}
                onChange={(id) => set('inventario_actual_id', id || '')}
                disabled={saving}
              />
            </label>
          </section>
        )}

        {(form.motivo === 'reposicion_robo' || form.motivo === 'reposicion_rotura') && (
          <section className="border-t border-surface-100 pt-8">
            <div className="mb-5">
              <h2 className="text-base font-bold text-surface-900">Documentación</h2>
              <p className="text-sm text-surface-500 mt-1">Los adjuntos ayudan a validar técnicamente la solicitud.</p>
            </div>

            {form.motivo === 'reposicion_robo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label>
                  <span className="label-base">Denuncia presentada</span>
                  <select value={form.denuncia_presentada} onChange={e => set('denuncia_presentada', e.target.value)} className="input-base">
                    <option value="">Seleccionar</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </label>
                <label>
                  <span className="label-base">Denuncia adjunta opcional</span>
                  <input type="file" accept="image/*,.pdf" onChange={e => setAdjuntos(prev => ({ ...prev, denuncia: e.target.files?.[0] || null }))} className="input-base file:mr-4 file:rounded-lg file:border-0 file:bg-surface-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-surface-700" />
                </label>
              </div>
            )}

            {form.motivo === 'reposicion_rotura' && (
              <label className="block">
                <span className="label-base">Foto/evidencia de rotura</span>
                <input type="file" accept="image/*" required onChange={e => setAdjuntos(prev => ({ ...prev, rotura: e.target.files?.[0] || null }))} className="input-base file:mr-4 file:rounded-lg file:border-0 file:bg-surface-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-surface-700" />
              </label>
            )}
          </section>
        )}

        <section className="border-t border-surface-100 pt-8">
          <label className="block">
            <span className="label-base">Descripción amplia</span>
            <textarea
              value={form.observacion_solicitante}
              onChange={e => set('observacion_solicitante', e.target.value)}
              rows={5}
              className="input-base resize-y"
              placeholder="Agrega el contexto operativo o técnico de la necesidad."
              required
            />
          </label>
        </section>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-surface-100 pt-6">
          <button type="button" onClick={() => navigate('/solicitudes-compra')} className="btn-secondary w-full sm:w-auto">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto shadow-lg shadow-surface-900/10">
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Creando...
              </>
            ) : 'Crear solicitud'}
          </button>
        </div>
      </form>
    </div>
  )
}
