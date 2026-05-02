import { useEffect, useMemo, useState } from 'react'
import { solicitudesCompraAPI } from '../../services/api'

const inputClass = 'w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400 text-surface-900'

/**
 * Combobox para elegir un Personal activo (lookup de solicitudes de compra).
 * Props: value, onChange(id, personal), disabled
 */
export default function SelectBeneficiario({ value, onChange, disabled }) {
  const [personal, setPersonal] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    solicitudesCompraAPI.lookupPersonal({ limit: 200 })
      .then(res => {
        if (cancelled) return
        const data = Array.isArray(res?.data) ? res.data : (res?.data?.data || res?.data || [])
        setPersonal(data)
      })
      .catch(err => console.error('Error cargando personal:', err))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    if (!filtro) return personal
    const f = filtro.toLowerCase()
    return personal.filter(p =>
      `${p.nombre} ${p.apellido}`.toLowerCase().includes(f)
      || (p.email || '').toLowerCase().includes(f)
    )
  }, [personal, filtro])

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar por nombre, apellido o email…"
          className={`${inputClass} pl-9`}
          disabled={disabled || loading}
        />
      </div>
      <select
        value={value || ''}
        onChange={(e) => {
          const id = e.target.value
          const p = personal.find(x => x.id === id) || null
          onChange(id || null, p)
        }}
        className={inputClass}
        disabled={disabled || loading}
      >
        <option value="">{loading ? 'Cargando personal…' : 'Seleccionar beneficiario'}</option>
        {filtered.map(p => (
          <option key={p.id} value={p.id}>
            {p.apellido}, {p.nombre} — {p.email}
          </option>
        ))}
      </select>
    </div>
  )
}
