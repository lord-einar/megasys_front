import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  Inbox,
  Laptop,
  Monitor,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Smartphone,
  X
} from 'lucide-react'
import { solicitudesAsignacionAPI } from '../services/api'
import { useListData } from '../hooks/useListData'
import StatusBadgeAsignacion, { EtapasAsignacion } from '../components/solicitudesAsignacion/StatusBadgeAsignacion'
import ListPagination from '../components/ListPagination'
import { esCompraPendiente } from '../utils/solicitudAsignacionPolicy'

const TIPOS_EQUIPO = {
  celular: { label: 'Celular', Icon: Smartphone },
  notebook: { label: 'Notebook', Icon: Laptop },
  pc_escritorio: { label: 'PC de escritorio', Icon: Monitor }
}

const MOTIVOS = {
  nuevo_ingreso: 'Nuevo ingreso',
  nuevo_puesto: 'Nuevo puesto',
  reposicion_robo: 'Reposición por robo',
  reposicion_perdida: 'Reposición por pérdida',
  reposicion_rotura: 'Reposición por rotura',
  cambio_equipo: 'Cambio de equipo',
  otro: 'Otro'
}

// Vistas agrupadas del filtro de estado (el backend acepta varios estados).
const GRUPOS_ESTADO = {
  en_curso: { label: 'En curso', estados: ['pendiente_infra', 'pendiente_rrhh', 'aprobada', 'remito_generado'] },
  cerradas: { label: 'Cerradas', estados: ['finalizada', 'rechazada', 'cancelada'] }
}

const ESTADOS = {
  pendiente_infra: 'En revisión Infra',
  pendiente_rrhh: 'En revisión RRHH',
  aprobada: 'Aprobada, falta entregar',
  remito_generado: 'Remito listo, falta entregar',
  finalizada: 'Equipo entregado',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada'
}

const CLAVES_FILTRO = ['q', 'estado', 'tipo', 'motivo']

const etiquetaFiltro = {
  estado: (v) => GRUPOS_ESTADO[v]?.label || ESTADOS[v] || v,
  tipo: (v) => TIPOS_EQUIPO[v]?.label || v,
  motivo: (v) => MOTIVOS[v] || v,
  q: (v) => `“${v}”`
}

// Traduce los parámetros de la URL a los filtros que entiende la API.
const filtrosDesdeUrl = (params) => {
  const estado = params.get('estado')
  return {
    q: params.get('q') || undefined,
    estado: GRUPOS_ESTADO[estado]?.estados || estado || undefined,
    tipo_equipo: params.get('tipo') || undefined,
    motivo: params.get('motivo') || undefined
  }
}

// "23 jul 2026": compacta y sin ambigüedad día/mes
const formatoFecha = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
const fecha = (valor) => {
  if (!valor) return ''
  const partes = Object.fromEntries(formatoFecha.formatToParts(new Date(valor)).map(p => [p.type, p.value]))
  return `${partes.day} ${partes.month.replace('.', '')} ${partes.year}`
}
const codigo = (s) => `SA-${String(s.numero).padStart(4, '0')}`
const nombreBeneficiario = (s) =>
  s.beneficiario ? `${s.beneficiario.apellido}, ${s.beneficiario.nombre}` : 'Sin beneficiario'

function EquipoAsignado({ solicitud }) {
  const inv = solicitud.inventarioAsignado
  if (inv) {
    return <span className="text-surface-700">{[inv.marca, inv.modelo].filter(Boolean).join(' ') || 'Equipo asignado'}</span>
  }
  if (esCompraPendiente(solicitud)) {
    return (
      <span className="status status-buy">
        <ShoppingCart aria-hidden="true" strokeWidth={2.25} />
        Compra pendiente
      </span>
    )
  }
  return <span className="text-surface-500">Sin equipo asignado</span>
}

function TipoEquipo({ tipo }) {
  const { label, Icon } = TIPOS_EQUIPO[tipo] || { label: tipo, Icon: Monitor }
  return (
    <span className="inline-flex items-center gap-2 font-semibold text-surface-900">
      <Icon className="h-[18px] w-[18px] text-surface-600" aria-hidden="true" strokeWidth={2} />
      {label}
    </span>
  )
}

function FilasCargando() {
  return Array.from({ length: 5 }, (_, i) => (
    <div key={i} className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[8rem_1.4fr_1.2fr_1.3fr] md:gap-6 md:px-6">
      <div className="skeleton h-5 w-20" />
      <div className="skeleton h-5 w-40" />
      <div className="skeleton h-5 w-32" />
      <div className="skeleton h-5 w-36" />
    </div>
  ))
}

export default function SolicitudesAsignacionListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [texto, setTexto] = useState(searchParams.get('q') || '')
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)

  // Filtros iniciales leídos de la URL una sola vez, para no pedir dos veces al montar.
  const [filtrosIniciales] = useState(() => filtrosDesdeUrl(searchParams))
  const {
    data,
    loading,
    error,
    page,
    limit,
    totalPages,
    totalRecords,
    updateFilters,
    goToPage,
    previousPage,
    nextPage,
    reload
  } = useListData(solicitudesAsignacionAPI.list, {
    initialLimit: 15,
    initialFilters: filtrosIniciales
  })

  // La URL es la fuente de verdad de los filtros: se pueden compartir y
  // sobreviven al volver desde el detalle.
  const claveFiltros = searchParams.toString()
  const ultimaClave = useRef(claveFiltros)
  useEffect(() => {
    if (ultimaClave.current === claveFiltros) return
    ultimaClave.current = claveFiltros
    updateFilters(filtrosDesdeUrl(searchParams))
  }, [claveFiltros, searchParams, updateFilters])

  const setFiltro = (clave, valor) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (valor) next.set(clave, valor)
      else next.delete(clave)
      return next
    }, { replace: true })
  }

  // Búsqueda con espera corta para no consultar en cada tecla.
  useEffect(() => {
    const valor = texto.trim()
    if (valor === (searchParams.get('q') || '')) return
    const t = setTimeout(() => setFiltro('q', valor), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto])

  const activos = useMemo(
    () => CLAVES_FILTRO.filter(c => searchParams.get(c)).map(c => ({ clave: c, valor: searchParams.get(c) })),
    [searchParams]
  )
  const cantidadSelects = activos.filter(f => f.clave !== 'q').length

  const limpiarFiltros = () => {
    setTexto('')
    setSearchParams({}, { replace: true })
  }

  const quitarFiltro = (clave) => {
    if (clave === 'q') setTexto('')
    setFiltro(clave, '')
  }

  const primeraCarga = loading && data.length === 0
  const actualizando = loading && data.length > 0

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Solicitudes de asignación</h1>
          <p className="page-description">
            Pedidos de celulares, notebooks y PCs: en qué etapa está cada uno y qué falta para entregarlo.
          </p>
        </div>
        <div className="responsive-actions">
          <Link to="/solicitudes-asignacion/nueva" className="btn-primary">
            <Plus className="h-5 w-5" aria-hidden="true" />
            Nueva solicitud
          </Link>
        </div>
      </div>

      {/* Filtros: búsqueda siempre visible; los selects se pliegan en móvil */}
      <section aria-label="Filtros" className="mb-5">
        <div className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Buscar beneficiario por nombre o email</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-500" aria-hidden="true" />
            <input
              type="search"
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Buscar beneficiario"
              className="input-base pl-10"
            />
          </label>
          <button
            type="button"
            className="btn-secondary md:hidden"
            aria-expanded={filtrosAbiertos}
            aria-controls="filtros-avanzados"
            onClick={() => setFiltrosAbiertos(v => !v)}
          >
            <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
            Filtros
            {cantidadSelects > 0 && (
              <span className="rounded-full bg-primary-600 px-1.5 text-xs font-bold text-white">{cantidadSelects}</span>
            )}
          </button>
        </div>

        <div
          id="filtros-avanzados"
          className={`${filtrosAbiertos ? 'grid' : 'hidden'} mt-3 grid-cols-1 gap-3 rounded-lg border border-surface-200 bg-white p-4 md:mt-3 md:grid md:grid-cols-3 md:border-0 md:bg-transparent md:p-0 lg:grid-cols-[1fr_1fr_1fr_auto]`}
        >
          <label>
            <span className="label-base">Estado</span>
            <select value={searchParams.get('estado') || ''} onChange={e => setFiltro('estado', e.target.value)} className="input-base">
              <option value="">Todos</option>
              <optgroup label="Vistas">
                {Object.entries(GRUPOS_ESTADO).map(([v, g]) => <option key={v} value={v}>{g.label}</option>)}
              </optgroup>
              <optgroup label="Estado exacto">
                {Object.entries(ESTADOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </optgroup>
            </select>
          </label>
          <label>
            <span className="label-base">Tipo de equipo</span>
            <select value={searchParams.get('tipo') || ''} onChange={e => setFiltro('tipo', e.target.value)} className="input-base">
              <option value="">Todos</option>
              {Object.entries(TIPOS_EQUIPO).map(([v, t]) => <option key={v} value={v}>{t.label}</option>)}
            </select>
          </label>
          <label>
            <span className="label-base">Motivo</span>
            <select value={searchParams.get('motivo') || ''} onChange={e => setFiltro('motivo', e.target.value)} className="input-base">
              <option value="">Todos</option>
              {Object.entries(MOTIVOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          {activos.length > 0 && (
            <div className="flex items-end md:col-span-3 lg:col-span-1">
              <button type="button" onClick={limpiarFiltros} className="btn-secondary w-full lg:w-auto">
                <X className="h-5 w-5" aria-hidden="true" />
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Con el panel cerrado en móvil, los filtros activos siguen a la vista */}
        {!filtrosAbiertos && cantidadSelects > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2 md:hidden" aria-label="Filtros aplicados">
            {activos.filter(f => f.clave !== 'q').map(f => (
              <li key={f.clave}>
                <button
                  type="button"
                  onClick={() => quitarFiltro(f.clave)}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-primary-500/40 bg-primary-50 px-3 text-sm font-semibold text-primary-700"
                >
                  {etiquetaFiltro[f.clave](f.valor)}
                  <X className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">(quitar filtro)</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && (
        <div role="alert" className="mb-5 flex flex-col gap-3 rounded-lg border border-error-500/40 bg-error-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-error-700" aria-hidden="true" />
            <div>
              <p className="font-semibold text-error-700">No se pudo cargar el listado</p>
              <p className="text-sm text-error-700">{error}</p>
            </div>
          </div>
          <button type="button" onClick={reload} className="btn-secondary shrink-0">
            <RefreshCw className="h-5 w-5" aria-hidden="true" />
            Reintentar
          </button>
        </div>
      )}

      {/* Con error y sin datos, el aviso de arriba ya explica todo */}
      {!(error && data.length === 0 && !loading) && (
      <section className="card-base overflow-hidden" aria-labelledby="titulo-resultados" aria-busy={loading}>
        <div className="flex items-center justify-between gap-4 border-b border-surface-200 px-4 py-3 md:px-6">
          <h2 id="titulo-resultados" className="text-base font-bold" aria-live="polite">
            {primeraCarga
              ? 'Cargando solicitudes…'
              : `${totalRecords} ${totalRecords === 1 ? 'solicitud' : 'solicitudes'}`}
          </h2>
          <button type="button" onClick={reload} disabled={loading} className="btn-secondary min-h-9 px-3">
            <RefreshCw className={`h-4 w-4 ${loading ? 'motion-safe:animate-spin' : ''}`} aria-hidden="true" />
            {actualizando ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>

        {primeraCarga ? (
          <FilasCargando />
        ) : data.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Inbox className="mx-auto mb-3 h-10 w-10 text-surface-400" aria-hidden="true" strokeWidth={1.75} />
            {activos.length > 0 ? (
              <>
                <p className="text-lg font-semibold text-surface-900">Ninguna solicitud coincide con estos filtros</p>
                <p className="mt-1 text-surface-600">Probá con otro estado o quitá la búsqueda.</p>
                <button type="button" onClick={limpiarFiltros} className="btn-secondary mt-5">Limpiar filtros</button>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-surface-900">Todavía no hay solicitudes</p>
                <p className="mt-1 text-surface-600">Cuando alguien pida un equipo, va a aparecer acá.</p>
                <Link to="/solicitudes-asignacion/nueva" className="btn-primary mt-5">
                  <Plus className="h-5 w-5" aria-hidden="true" />
                  Nueva solicitud
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className={`transition-opacity duration-150 ${actualizando ? 'opacity-60' : ''}`}>
            {/* Tablet y escritorio: tabla. Cada fila completa abre el detalle. */}
            <table className="hidden w-full text-left md:table">
              <thead className="bg-surface-50 text-sm text-surface-700">
                <tr>
                  <th scope="col" className="w-36 px-6 py-3 font-semibold">Solicitud</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Beneficiario</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Equipo</th>
                  <th scope="col" className="px-3 py-3 pr-6 font-semibold">Etapa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {data.map(s => (
                  <tr key={s.id} className="relative align-top transition-colors duration-150 hover:bg-surface-50 focus-within:bg-surface-50">
                    <td className="px-6 py-4">
                      <Link
                        to={`/solicitudes-asignacion/${s.id}`}
                        className="font-bold text-primary-700 underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:-outline-offset-3 focus-visible:after:outline-primary-500"
                      >
                        {codigo(s)}
                        <span className="sr-only">, {nombreBeneficiario(s)}</span>
                      </Link>
                      <p className="mt-1 whitespace-nowrap text-sm text-surface-600">
                        <time dateTime={s.created_at}>{fecha(s.created_at)}</time>
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-semibold text-surface-900">{nombreBeneficiario(s)}</p>
                      <p className="mt-1 text-sm text-surface-600">{MOTIVOS[s.motivo] || s.motivo}</p>
                    </td>
                    <td className="px-3 py-4">
                      <TipoEquipo tipo={s.tipo_equipo} />
                      <p className="mt-1 text-sm"><EquipoAsignado solicitud={s} /></p>
                    </td>
                    <td className="px-3 py-4 pr-6">
                      <EtapasAsignacion estado={s.estado} className="mb-2" />
                      <StatusBadgeAsignacion estado={s.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Móvil: una tarjeta por solicitud, ordenada por lo que se lee primero */}
            <ul className="divide-y divide-surface-200 md:hidden">
              {data.map(s => (
                <li key={s.id}>
                  <Link
                    to={`/solicitudes-asignacion/${s.id}`}
                    className="block px-4 py-4 active:bg-surface-100 focus-visible:-outline-offset-3"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-bold text-primary-700">{codigo(s)}</span>
                      <time dateTime={s.created_at} className="text-sm text-surface-600">{fecha(s.created_at)}</time>
                    </div>
                    <p className="mt-1 text-lg font-semibold leading-snug text-surface-900">{nombreBeneficiario(s)}</p>
                    <p className="mt-1 text-surface-600">{MOTIVOS[s.motivo] || s.motivo}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                      <TipoEquipo tipo={s.tipo_equipo} />
                      <EquipoAsignado solicitud={s} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <EtapasAsignacion estado={s.estado} />
                      <StatusBadgeAsignacion estado={s.estado} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!primeraCarga && (
          <ListPagination
            page={page}
            limit={limit}
            totalPages={totalPages}
            totalRecords={totalRecords}
            goToPage={goToPage}
            previousPage={previousPage}
            nextPage={nextPage}
          />
        )}
      </section>
      )}
    </div>
  )
}
