import { useEffect, useState } from 'react'
import { solicitudesCompraAPI } from '../../services/api'

const inputClass = 'w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-surface-900'

/**
 * Lista los inventarios actualmente asignados al beneficiario, filtrados por
 * tipo (celular/notebook). Props: personalId, tipoEquipo, value, onChange, disabled
 */
export default function SelectInventarioAsignado({ personalId, tipoEquipo, value, onChange, disabled }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!personalId) {
      setItems([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    const params = { personal_id: personalId, activo: true }
    if (tipoEquipo) params.tipo_equipo = tipoEquipo

    solicitudesCompraAPI.lookupInventarioAsignado(params)
      .then(res => {
        if (cancelled) return
        const data = Array.isArray(res?.data) ? res.data : []
        setItems(data)
      })
      .catch(err => {
        if (cancelled) return
        setError(err.message || 'Error cargando equipos asignados')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [personalId, tipoEquipo])

  if (!personalId) {
    return (
      <p className="text-xs text-surface-500 italic px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl">
        Seleccioná primero al beneficiario
      </p>
    )
  }

  if (loading) {
    return (
      <p className="text-xs text-surface-500 px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl">
        Buscando equipos asignados…
      </p>
    )
  }

  if (error) {
    return (
      <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
        {error}
      </p>
    )
  }

  if (items.length === 0) {
    return (
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
        El beneficiario no tiene equipos {tipoEquipo === 'celular' ? 'celulares' : 'notebooks'} asignados.
        No se puede registrar reposición sin equipo previo.
      </p>
    )
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className={inputClass}
      disabled={disabled}
    >
      <option value="">Seleccionar equipo a reponer</option>
      {items.map(asig => {
        const inv = asig.inventario
        if (!inv) return null
        const sn = inv.numero_serie ? ` — S/N ${inv.numero_serie}` : ''
        return (
          <option key={asig.id} value={inv.id}>
            {inv.marca} {inv.modelo}{sn}
          </option>
        )
      })}
    </select>
  )
}
