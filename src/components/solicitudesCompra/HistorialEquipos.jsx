import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { solicitudesCompraAPI } from '../../services/api'
import { usePermissions } from '../../hooks/usePermissions'
import { Laptop, Smartphone, Info } from 'lucide-react'

/**
 * Muestra el historial de notebooks y celulares para una persona o sede.
 * Props:
 *  - scope: 'personal' | 'sede'
 *  - id: UUID de la persona o sede
 *  - showHeader: si renderiza el título "Historial de equipos"
 *  - emptyHint: texto a mostrar cuando no hay datos
 */
export default function HistorialEquipos({ scope, id, showHeader = true, emptyHint }) {
  const baseNavigate = useNavigate()
  const { hasLegacyAccess } = usePermissions()
  const navigate = (target) => {
    if (typeof target !== 'string') return baseNavigate(target)
    // Reescribimos /personal/:id y /sedes/:id si el usuario no tiene acceso al
    // módulo legacy, para que vea la versión del módulo de Solicitudes de Compra.
    if (!hasLegacyAccess) {
      const personalMatch = target.match(/^\/personal\/([^/]+)$/)
      if (personalMatch) return baseNavigate(`/solicitudes-compra/historial-equipos/personal/${personalMatch[1]}`)
      const sedeMatch = target.match(/^\/sedes\/([^/]+)$/)
      if (sedeMatch) return baseNavigate(`/solicitudes-compra/historial-equipos/sede/${sedeMatch[1]}`)
    }
    baseNavigate(target)
  }
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    cargar()
  }, [scope, id])

  const cargar = async () => {
    try {
      setLoading(true)
      setError(null)
      const resp = scope === 'sede'
        ? await solicitudesCompraAPI.historialEquiposSede(id)
        : await solicitudesCompraAPI.historialEquiposPersonal(id)
      setData(resp?.data || resp)
    } catch (err) {
      setError(err.message || 'Error al cargar el historial de equipos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-surface-200 border-t-primary-600 mb-3" />
        <p className="text-surface-500 text-sm font-medium">Cargando historial de equipos…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/40 text-sm text-rose-700">
        {error}
      </div>
    )
  }

  return scope === 'sede'
    ? <ContenidoSede data={data} navigate={navigate} showHeader={showHeader} emptyHint={emptyHint} />
    : <ContenidoPersonal data={data} navigate={navigate} showHeader={showHeader} emptyHint={emptyHint} />
}

function ContenidoPersonal({ data, navigate, showHeader, emptyHint }) {
  const items = data?.items || []
  const activos = items.filter(i => i.activo)
  const historicos = items.filter(i => !i.activo)

  if (!items.length) {
    return (
      <EmptyState message={emptyHint || 'No se registraron notebooks ni celulares para esta persona.'} />
    )
  }

  return (
    <div className="space-y-8">
      {showHeader && (
        <div>
          <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wide flex items-center gap-2">
            <Laptop className="w-4 h-4 text-primary-500" />
            Historial de notebooks y celulares
          </h3>
          <p className="text-xs text-surface-500 mt-1">Equipos asignados a esta persona, en uso o ya devueltos.</p>
        </div>
      )}

      {activos.length > 0 && (
        <section>
          <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">En uso ({activos.length})</h4>
          <div className="grid grid-cols-1 gap-4">
            {activos.map(item => (
              <CardEquipoPersonal key={item.asignacion_id} item={item} navigate={navigate} highlight />
            ))}
          </div>
        </section>
      )}

      {historicos.length > 0 && (
        <section>
          <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">Histórico ({historicos.length})</h4>
          <div className="grid grid-cols-1 gap-4">
            {historicos.map(item => (
              <CardEquipoPersonal key={item.asignacion_id} item={item} navigate={navigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ContenidoSede({ data, navigate, showHeader, emptyHint }) {
  const actuales = data?.inventario_actual || []
  const historial = data?.historial_asignaciones || []

  if (!actuales.length && !historial.length) {
    return <EmptyState message={emptyHint || 'No hay notebooks ni celulares vinculados a esta sede.'} />
  }

  return (
    <div className="space-y-8">
      {showHeader && (
        <div>
          <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wide flex items-center gap-2">
            <Laptop className="w-4 h-4 text-primary-500" />
            Historial de notebooks y celulares
          </h3>
          <p className="text-xs text-surface-500 mt-1">Equipos vinculados a esta sede, ya sea por ubicación o por titularidad de su personal.</p>
        </div>
      )}

      {actuales.length > 0 && (
        <section>
          <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">Actualmente en la sede ({actuales.length})</h4>
          <div className="grid grid-cols-1 gap-4">
            {actuales.map(item => (
              <CardEquipoSede key={item.inventario_id} item={item} navigate={navigate} highlight />
            ))}
          </div>
        </section>
      )}

      {historial.length > 0 && (
        <section>
          <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">Asignaciones del personal de la sede ({historial.length})</h4>
          <div className="grid grid-cols-1 gap-4">
            {historial.map(item => (
              <CardAsignacionSede key={item.asignacion_id} item={item} navigate={navigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function CardEquipoPersonal({ item, navigate, highlight }) {
  const inv = item.inventario || {}
  return (
    <div className={`p-5 rounded-xl border ${highlight ? 'border-emerald-200 bg-emerald-50/30' : 'border-surface-200 bg-white'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {iconoTipo(inv.tipo)}
          <div>
            <p className="font-bold text-surface-900">{inv.marca} {inv.modelo}</p>
            <p className="text-xs text-surface-500">
              {inv.tipo} · {inv.numero_serie ? `S/N: ${inv.numero_serie}` : 'sin serie'}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${item.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-200 text-surface-600'}`}>
          {item.activo ? 'Activo' : 'Devuelto'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <Field label="Fecha de asignación" value={fmtFecha(item.fecha_asignacion)} />
        {item.fecha_devolucion && <Field label="Fecha de devolución" value={fmtFecha(item.fecha_devolucion)} />}
        {inv.sede?.nombre_sede && (
          <Field label="Sede actual" value={inv.sede.nombre_sede} />
        )}
      </div>

      {item.motivo_asignacion && (
        <div className="mt-3 pt-3 border-t border-surface-200">
          <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-1">Motivo de asignación</p>
          <p className="text-sm text-surface-700">{item.motivo_asignacion}</p>
        </div>
      )}

      {item.motivo_cambio && (
        <BloqueMotivoCambio motivo={item.motivo_cambio} navigate={navigate} />
      )}
    </div>
  )
}

function CardEquipoSede({ item, navigate, highlight }) {
  return (
    <div className={`p-5 rounded-xl border ${highlight ? 'border-emerald-200 bg-emerald-50/30' : 'border-surface-200 bg-white'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {iconoTipo(item.tipo)}
          <div>
            <p className="font-bold text-surface-900">{item.marca} {item.modelo}</p>
            <p className="text-xs text-surface-500">
              {item.tipo} · {item.numero_serie ? `S/N: ${item.numero_serie}` : 'sin serie'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-surface-500 uppercase">Titular</p>
          {item.titular_personal ? (
            <button
              onClick={() => navigate(`/personal/${item.titular_personal.id}`)}
              className="text-sm text-primary-700 hover:underline font-medium"
            >
              {item.titular_personal.apellido}, {item.titular_personal.nombre}
            </button>
          ) : (
            <span className="text-sm text-surface-600">Sede (uso compartido)</span>
          )}
        </div>
      </div>

      {item.motivo_asignacion && (
        <div className="mt-3 pt-3 border-t border-surface-200">
          <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-1">Motivo de asignación</p>
          <p className="text-sm text-surface-700">{item.motivo_asignacion}</p>
        </div>
      )}

      {item.motivo_cambio && (
        <BloqueMotivoCambio motivo={item.motivo_cambio} navigate={navigate} />
      )}
    </div>
  )
}

function CardAsignacionSede({ item, navigate }) {
  const inv = item.inventario || {}
  return (
    <div className={`p-5 rounded-xl border ${item.activo ? 'border-primary-200 bg-primary-50/30' : 'border-surface-200 bg-surface-50'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {iconoTipo(inv.tipo)}
          <div>
            <p className="font-bold text-surface-900">{inv.marca} {inv.modelo}</p>
            <p className="text-xs text-surface-500">{inv.tipo} · {inv.numero_serie ? `S/N: ${inv.numero_serie}` : 'sin serie'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-surface-500 uppercase">{item.activo ? 'Asignación actual' : 'Asignación pasada'}</p>
          {item.personal && (
            <button
              onClick={() => navigate(`/personal/${item.personal.id}`)}
              className="text-sm text-primary-700 hover:underline font-medium"
            >
              {item.personal.apellido}, {item.personal.nombre}
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <Field label="Fecha de asignación" value={fmtFecha(item.fecha_asignacion)} />
        {item.fecha_devolucion && <Field label="Fecha de devolución" value={fmtFecha(item.fecha_devolucion)} />}
      </div>

      {item.motivo_asignacion && (
        <div className="mt-3 pt-3 border-t border-surface-200">
          <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-1">Motivo</p>
          <p className="text-sm text-surface-700">{item.motivo_asignacion}</p>
        </div>
      )}

      {item.motivo_cambio && (
        <BloqueMotivoCambio motivo={item.motivo_cambio} navigate={navigate} />
      )}
    </div>
  )
}

function BloqueMotivoCambio({ motivo, navigate }) {
  return (
    <div className="mt-3 p-3 rounded-lg bg-amber-50/60 border border-amber-100">
      <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5" />
        Motivo del cambio
      </p>
      <p className="text-sm text-amber-900">
        Solicitud <button onClick={() => navigate(`/solicitudes-compra/${motivo.solicitud_id}`)} className="font-bold underline hover:text-amber-700">
          SC-{String(motivo.solicitud_numero).padStart(4, '0')}
        </button>
        <span className="mx-1.5 text-amber-700/70">·</span>
        <span className="capitalize">{(motivo.motivo || '').replaceAll('_', ' ')}</span>
      </p>
      {motivo.observacion && (
        <p className="text-xs text-amber-800/90 mt-1.5">{motivo.observacion}</p>
      )}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-surface-900 font-medium text-sm">{value || '—'}</p>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-12 bg-surface-50 rounded-xl border border-dashed border-surface-200">
      <p className="text-surface-500 font-medium">{message}</p>
    </div>
  )
}

function iconoTipo(tipo) {
  const cls = 'w-9 h-9 p-2 rounded-lg bg-surface-100 text-surface-500'
  if ((tipo || '').toLowerCase().includes('celular')) {
    return <span className={cls}><Smartphone className="w-5 h-5" /></span>
  }
  return <span className={cls}><Laptop className="w-5 h-5" /></span>
}

function fmtFecha(date) {
  if (!date) return null
  try {
    return new Date(date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return null
  }
}
