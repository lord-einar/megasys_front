import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, ChevronDown, ChevronRight, Inbox, Pencil, Plus, RefreshCw,
  Search, Trash2, UserCheck, UserMinus, UserPlus, X
} from 'lucide-react'
import { puestosAPI } from '../services/api'

const FORM_VACIO = { nombre: '', codigo: '', sede_id: '', puesto_superior_id: '' }

const nombrePersona = (p) => `${p.apellido}, ${p.nombre}`

// Recorre el árbol en profundidad: [{ nodo, nivel }]
const aplanar = (nodos, nivel = 0) =>
  nodos.flatMap(n => [{ nodo: n, nivel }, ...aplanar(n.subordinados, nivel + 1)])

// Ids del puesto y de todo lo que depende de él (no pueden ser su superior)
const idsRama = (nodo) => new Set(aplanar([nodo]).map(({ nodo: n }) => n.id))

// Deja los nodos que coinciden con la búsqueda y sus ancestros
function filtrarArbol(nodos, texto) {
  if (!texto) return nodos
  const q = texto.toLowerCase()
  return nodos.flatMap(n => {
    const hijos = filtrarArbol(n.subordinados, texto)
    const coincide = n.nombre.toLowerCase().includes(q) ||
      (n.codigo || '').toLowerCase().includes(q) ||
      n.ocupantes.some(o => `${o.nombre} ${o.apellido} ${o.email}`.toLowerCase().includes(q))
    return coincide || hijos.length ? [{ ...n, subordinados: hijos }] : []
  })
}

export default function PuestosPage() {
  const [arbol, setArbol] = useState([])
  const [sedes, setSedes] = useState([])
  const [loading, setLoading] = useState(true)
  // error = { texto, deCarga }: "Reintentar" solo tiene sentido si falló la carga
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [colapsados, setColapsados] = useState(new Set())

  // Formulario: null = cerrado; { id?: string, ...campos }
  const [form, setForm] = useState(null)
  const [formError, setFormError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  // Panel de asignación: puesto al que se agrega gente
  const [asignando, setAsignando] = useState(null)
  const [confirmarBaja, setConfirmarBaja] = useState(null)

  const cargar = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await puestosAPI.arbol()
      setArbol(res.data || [])
    } catch (err) {
      setError({ texto: err.message || 'Error al cargar los puestos', deCarga: true })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    puestosAPI.lookupSedes().then(res => setSedes(res.data || [])).catch(() => setSedes([]))
  }, [])

  const plano = useMemo(() => aplanar(arbol), [arbol])
  const visibles = useMemo(() => aplanar(filtrarArbol(arbol, busqueda.trim())), [arbol, busqueda])

  // Con búsqueda se muestra todo lo que coincide; sin búsqueda se respetan los colapsados
  const filas = busqueda.trim()
    ? visibles
    : visibles.filter(({ nodo }) => !ancestrosColapsados(nodo, plano, colapsados))

  const ejecutar = async (fn, ok) => {
    try {
      setError(null)
      await fn()
      setMensaje(ok)
      await cargar()
    } catch (err) {
      setError({ texto: err.message || 'No se pudo completar la acción', deCarga: false })
    }
  }

  const abrirForm = (nodo = null, superiorId = '') => {
    setFormError(null)
    setAsignando(null)
    setForm(nodo
      ? { id: nodo.id, nombre: nodo.nombre, codigo: nodo.codigo || '', sede_id: nodo.sede?.id || '', puesto_superior_id: nodo.puesto_superior_id || '' }
      : { ...FORM_VACIO, puesto_superior_id: superiorId })
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setFormError(null)
    try {
      const datos = {
        nombre: form.nombre,
        codigo: form.codigo || null,
        sede_id: form.sede_id || null,
        puesto_superior_id: form.puesto_superior_id || null
      }
      if (form.id) await puestosAPI.actualizar(form.id, datos)
      else await puestosAPI.crear(datos)
      setMensaje(form.id ? 'Puesto actualizado' : 'Puesto creado')
      setForm(null)
      await cargar()
    } catch (err) {
      setFormError(err.message || 'No se pudo guardar el puesto')
    } finally {
      setGuardando(false)
    }
  }

  const setCampo = (campo, valor) => setForm(prev => ({ ...prev, [campo]: valor }))

  const nodoEnEdicion = form?.id ? plano.find(({ nodo }) => nodo.id === form.id)?.nodo : null
  const excluidos = nodoEnEdicion ? idsRama(nodoEnEdicion) : new Set()

  const alternar = (id) => setColapsados(prev => {
    const nuevo = new Set(prev)
    if (nuevo.has(id)) nuevo.delete(id)
    else nuevo.add(id)
    return nuevo
  })

  return (
    <div className="page-shell">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Puestos</h1>
          <p className="page-description">
            Organigrama de RRHH. Define quién aprueba los pedidos de equipos de cada persona: el primer puesto
            superior con alguien asignado (si está vacante, sube al siguiente).
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={cargar} className="btn-secondary" disabled={loading}>
            <RefreshCw className={`h-5 w-5 ${loading ? 'motion-safe:animate-spin' : ''}`} aria-hidden="true" />
            {loading ? 'Actualizando…' : 'Actualizar'}
          </button>
          <button onClick={() => abrirForm()} className="btn-primary">
            <Plus className="h-5 w-5" aria-hidden="true" /> Nuevo puesto
          </button>
        </div>
      </div>

      {mensaje && (
        <div className="card-base p-4 mb-4 flex items-start justify-between gap-3 status-done" role="status">
          <span className="text-sm font-semibold">{mensaje}</span>
          <button className="icon-button -m-2" aria-label="Cerrar aviso" onClick={() => setMensaje(null)}><X className="h-4 w-4" /></button>
        </div>
      )}
      {error && (
        <div className="card-base p-4 mb-4 flex items-start gap-3 status-stop" role="alert">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold flex-1">{error.texto}</span>
          {error.deCarga
            ? <button className="btn-secondary" onClick={cargar}>Reintentar</button>
            : <button className="icon-button -m-2" aria-label="Cerrar aviso" onClick={() => setError(null)}><X className="h-4 w-4" /></button>}
        </div>
      )}

      {form && (
        <form onSubmit={guardar} className="card-base p-6 mb-6 border-l-4 border-l-primary-500 space-y-4">
          <h2 className="text-base font-bold text-surface-900">{form.id ? 'Editar puesto' : 'Nuevo puesto'}</h2>
          {formError && <p className="text-sm font-semibold status-stop rounded-md px-3 py-2" role="alert">{formError}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="label-base">Nombre</span>
              <input className="input-base" required maxLength={120} value={form.nombre}
                onChange={e => setCampo('nombre', e.target.value)}
                placeholder="Ej.: Coordinador de venta – Palermo" />
            </label>
            <label className="block">
              <span className="label-base">Código (opcional)</span>
              <input className="input-base" maxLength={50} value={form.codigo}
                onChange={e => setCampo('codigo', e.target.value)}
                placeholder="El que use RRHH en su planilla" />
            </label>
            <label className="block">
              <span className="label-base">Puesto superior</span>
              <select className="input-base" value={form.puesto_superior_id}
                onChange={e => setCampo('puesto_superior_id', e.target.value)}>
                <option value="">Sin superior (nivel más alto)</option>
                {plano.filter(({ nodo }) => !excluidos.has(nodo.id)).map(({ nodo, nivel }) => (
                  <option key={nodo.id} value={nodo.id}>{'  '.repeat(nivel)}{nodo.nombre}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label-base">Sede (opcional)</span>
              <select className="input-base" value={form.sede_id}
                onChange={e => setCampo('sede_id', e.target.value)}>
                <option value="">Sin sede (puesto central o genérico)</option>
                {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre_sede}</option>)}
              </select>
            </label>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
            <button type="button" className="btn-secondary" onClick={() => setForm(null)}>Cancelar</button>
          </div>
        </form>
      )}

      {asignando && (
        <PanelAsignar
          puesto={asignando}
          onCerrar={() => setAsignando(null)}
          onAsignar={(persona) => ejecutar(
            () => puestosAPI.asignarPersona(persona.id, asignando.id),
            `${nombrePersona(persona)} quedó en ${asignando.nombre}`
          )}
        />
      )}

      <section className="card-base">
        <div className="p-4 border-b border-surface-200">
          <label className="relative block max-w-md">
            <span className="sr-only">Buscar puesto o persona</span>
            <Search className="h-5 w-5 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input className="input-base pl-10" value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar puesto, código o persona" />
          </label>
        </div>

        {loading && !arbol.length ? (
          <div className="p-4 space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-14" />)}</div>
        ) : !filas.length ? (
          <div className="p-10 text-center">
            <Inbox className="h-10 w-10 mx-auto text-surface-400" strokeWidth={1.75} aria-hidden="true" />
            <p className="mt-3 font-semibold text-surface-900">
              {busqueda ? 'Ningún puesto coincide con la búsqueda' : 'Todavía no hay puestos cargados'}
            </p>
            {!busqueda && (
              <button className="btn-primary mt-4" onClick={() => abrirForm()}>
                <Plus className="h-5 w-5" aria-hidden="true" /> Crear el primero
              </button>
            )}
          </div>
        ) : (
          <ul className={`divide-y divide-surface-200 ${loading ? 'opacity-60' : ''}`} aria-live="polite">
            {filas.map(({ nodo, nivel }) => (
              <FilaPuesto
                key={nodo.id}
                nodo={nodo}
                nivel={nivel}
                colapsado={colapsados.has(nodo.id) && !busqueda}
                onAlternar={() => alternar(nodo.id)}
                onEditar={() => abrirForm(nodo)}
                onNuevoSubordinado={() => abrirForm(null, nodo.id)}
                onAsignar={() => { setForm(null); setAsignando(nodo) }}
                onQuitar={(persona) => ejecutar(
                  () => puestosAPI.asignarPersona(persona.id, null),
                  `${nombrePersona(persona)} quedó sin puesto`
                )}
                confirmandoBaja={confirmarBaja === nodo.id}
                onBaja={() => setConfirmarBaja(nodo.id)}
                onCancelarBaja={() => setConfirmarBaja(null)}
                onConfirmarBaja={() => { setConfirmarBaja(null); ejecutar(() => puestosAPI.desactivar(nodo.id), `Puesto ${nodo.nombre} dado de baja`) }}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function ancestrosColapsados(nodo, plano, colapsados) {
  const porId = new Map(plano.map(({ nodo: n }) => [n.id, n]))
  let actual = porId.get(nodo.puesto_superior_id)
  while (actual) {
    if (colapsados.has(actual.id)) return true
    actual = porId.get(actual.puesto_superior_id)
  }
  return false
}

function FilaPuesto({
  nodo, nivel, colapsado, onAlternar, onEditar, onNuevoSubordinado, onAsignar, onQuitar,
  confirmandoBaja, onBaja, onCancelarBaja, onConfirmarBaja
}) {
  const tieneHijos = nodo.subordinados.length > 0
  const Chevron = colapsado ? ChevronRight : ChevronDown

  return (
    <li className="p-4" style={{ paddingLeft: `${16 + Math.min(nivel, 6) * 24}px` }}>
      <div className="flex flex-col lg:flex-row lg:items-start gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {tieneHijos ? (
            <button className="icon-button -m-2 shrink-0" onClick={onAlternar}
              aria-label={`${colapsado ? 'Mostrar' : 'Ocultar'} puestos que dependen de ${nodo.nombre}`} aria-expanded={!colapsado}>
              <Chevron className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : <span className="w-6 shrink-0" aria-hidden="true" />}
          <div className="min-w-0">
            <p className="font-semibold text-surface-900">
              {nodo.nombre}
              {nodo.codigo && <span className="ml-2 text-sm font-normal text-surface-600">{nodo.codigo}</span>}
            </p>
            {nodo.sede && <p className="text-sm text-surface-600">{nodo.sede.nombre_sede}</p>}

            <div className="mt-2 flex flex-wrap gap-2">
              {nodo.ocupantes.length ? nodo.ocupantes.map(o => (
                <span key={o.id} className="inline-flex items-center gap-1 rounded-md border border-surface-200 bg-surface-50 pl-2 text-sm">
                  {nombrePersona(o)}
                  <button className="icon-button h-8 w-8" onClick={() => onQuitar(o)} aria-label={`Quitar a ${nombrePersona(o)} de ${nodo.nombre}`}>
                    <UserMinus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </span>
              )) : <span className="status status-neutral">Vacante</span>}
            </div>

            <p className="mt-2 text-sm text-surface-600 flex items-start gap-1.5">
              <UserCheck className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              {nodo.aprobador ? (
                <span>
                  Aprueba: <strong className="text-surface-900">{nodo.aprobador.ocupantes.map(nombrePersona).join(' / ')}</strong>
                  {' '}({nodo.aprobador.puesto_nombre}{nodo.aprobador.escalado ? ', porque el superior directo está vacante' : ''})
                </span>
              ) : <span>Sin superior con personas asignadas: sus pedidos se aprueban solos</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end shrink-0">
          {confirmandoBaja ? (
            <>
              <span className="text-sm font-semibold self-center">¿Dar de baja este puesto?</span>
              <button className="btn-danger" onClick={onConfirmarBaja}>Dar de baja</button>
              <button className="btn-secondary" onClick={onCancelarBaja}>Cancelar</button>
            </>
          ) : (
            <>
              {/* Un puesto, una persona: para reemplazar, primero se quita a quien lo ocupa */}
              {!nodo.ocupantes.length && (
                <button className="btn-secondary" onClick={onAsignar}><UserPlus className="h-4 w-4" aria-hidden="true" /> Asignar persona</button>
              )}
              <button className="btn-secondary" onClick={onNuevoSubordinado}><Plus className="h-4 w-4" aria-hidden="true" /> Subpuesto</button>
              <button className="icon-button" onClick={onEditar} aria-label={`Editar ${nodo.nombre}`}><Pencil className="h-5 w-5" aria-hidden="true" /></button>
              <button className="icon-button" onClick={onBaja} aria-label={`Dar de baja ${nodo.nombre}`}><Trash2 className="h-5 w-5" aria-hidden="true" /></button>
            </>
          )}
        </div>
      </div>
    </li>
  )
}

function PanelAsignar({ puesto, onCerrar, onAsignar }) {
  const [q, setQ] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setBuscando(true)
      puestosAPI.lookupPersonal({ q, limit: 15 })
        .then(res => setResultados(res.data || []))
        .catch(() => setResultados([]))
        .finally(() => setBuscando(false))
    }, 350)
    return () => clearTimeout(t)
  }, [q])

  return (
    <section className="card-base p-6 mb-6 border-l-4 border-l-primary-500" aria-label={`Asignar persona a ${puesto.nombre}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-surface-900">Asignar persona a {puesto.nombre}</h2>
          <p className="text-sm text-surface-600">Cada puesto tiene una sola persona y cada persona ocupa un solo puesto: si ya tenía otro, se mueve a este.</p>
        </div>
        <button className="icon-button" onClick={onCerrar} aria-label="Cerrar"><X className="h-5 w-5" aria-hidden="true" /></button>
      </div>
      <label className="block mt-4 max-w-md">
        <span className="label-base">Buscar</span>
        <input className="input-base" value={q} onChange={e => setQ(e.target.value)} placeholder="Nombre, apellido o email" autoFocus />
      </label>
      <ul className="mt-3 divide-y divide-surface-200" aria-busy={buscando}>
        {resultados.map(p => (
          <li key={p.id} className="py-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-surface-900 truncate">{nombrePersona(p)}</p>
              <p className="text-sm text-surface-600 truncate">
                {p.email}{p.sede ? ` · ${p.sede.nombre_sede}` : ''}{p.puesto ? ` · hoy: ${p.puesto.nombre}` : ''}
              </p>
            </div>
            <button className="btn-secondary shrink-0" disabled={p.puesto?.id === puesto.id} onClick={() => onAsignar(p)}>
              {p.puesto?.id === puesto.id ? 'Ya asignada' : 'Asignar'}
            </button>
          </li>
        ))}
        {!buscando && !resultados.length && <li className="py-3 text-sm text-surface-600">Sin resultados</li>}
      </ul>
    </section>
  )
}
