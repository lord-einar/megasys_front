import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { solicitudesAsignacionAPI } from '../services/api'
import StatusBadgeAsignacion from '../components/solicitudesAsignacion/StatusBadgeAsignacion'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'
import { usePermissions } from '../hooks/usePermissions'
import { Plus, Laptop, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'

const ESTADOS_TARJETA = [
  'pendiente_infra',
  'pendiente_rrhh',
  'aprobada',
  'remito_generado',
  'finalizada',
  'rechazada'
]

// remito_generado es el estado final de la solicitud: ya no requiere acción.
const ESTADOS_PENDIENTES = ['pendiente_infra', 'pendiente_rrhh', 'aprobada']
const ESTADOS_COMPLETADAS = ['remito_generado', 'finalizada']

export default function SolicitudesAsignacionDashboard() {
  const navigate = useNavigate()
  const { hasInfraestructura } = usePermissions()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    solicitudesAsignacionAPI.list({ limit: 100 })
      .then(res => setSolicitudes(normalizeApiResponse(res, 100).data))
      .catch(err => setError(err.message || 'No se pudo cargar el panel'))
      .finally(() => setLoading(false))
  }, [])

  const counts = ESTADOS_TARJETA.reduce((acc, estado) => {
    acc[estado] = solicitudes.filter(s => s.estado === estado).length
    return acc
  }, {})

  const totalActivas = solicitudes.filter(s => !['remito_generado', 'finalizada', 'rechazada', 'cancelada'].includes(s.estado)).length
  const totalFinalizadas = solicitudes.filter(s => ESTADOS_COMPLETADAS.includes(s.estado)).length
  const totalRechazadas = solicitudes.filter(s => s.estado === 'rechazada').length

  const pendientes = solicitudes.filter(s => ESTADOS_PENDIENTES.includes(s.estado)).slice(0, 8)

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Solicitudes de asignación</h1>
          <p className="page-description">Panel operativo para Infraestructura, RRHH y Compras</p>
        </div>
        <div className="responsive-actions">
          <button onClick={() => navigate('/solicitudes-compra/stock')} className="btn-secondary flex items-center gap-2">
            <Laptop className="w-4 h-4" />
            Stock de equipos
          </button>
          <button onClick={() => navigate('/solicitudes-asignacion')} className="btn-secondary">Ver listado</button>
          {hasInfraestructura && (
            <button onClick={() => navigate('/categoria-equipos-asignacion')} className="btn-secondary">Categorías</button>
          )}
          <button
            onClick={() => navigate('/solicitudes-asignacion/nueva')}
            className="btn-accent"
          >
            <Plus className="w-4 h-4" />
            Nueva solicitud
          </button>
        </div>
      </div>

      {error && (
        <div className="card-base p-4 mb-6 border-l-4 border-l-rose-500 bg-rose-50/50">
          <p className="text-sm text-rose-700 font-medium">{error}</p>
        </div>
      )}

      {/* Indicadores principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard
          title="Activas"
          value={totalActivas}
          subtitle="En curso"
          accent="primary"
          iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <SummaryCard
          title="Completadas"
          value={totalFinalizadas}
          subtitle="Con remito generado"
          accent="emerald"
          iconPath="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
        <SummaryCard
          title="Rechazadas"
          value={totalRechazadas}
          subtitle="Sin curso"
          accent="rose"
          iconPath="M6 18L18 6M6 6l12 12"
        />
      </div>

      {/* Distribución por estado */}
      <div className="card-base p-6 mb-8">
        <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-4">Distribución por estado</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {ESTADOS_TARJETA.map(estado => (
            <div key={estado} className="flex flex-col gap-2">
              <StatusBadgeAsignacion estado={estado} />
              <p className="text-2xl font-extrabold text-surface-900">{counts[estado] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Guía del flujo */}
      <GuiaFlujo navigate={navigate} hasInfraestructura={hasInfraestructura} />

      {/* Pendientes de acción */}
      <div className="card-base overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-surface-900">Pendientes de acción</h2>
            <p className="text-xs text-surface-500 mt-0.5">Las primeras 8 solicitudes que requieren intervención</p>
          </div>
          <button
            onClick={() => navigate('/solicitudes-asignacion')}
            className="text-sm text-primary-700 hover:text-primary-800 font-medium hover:underline"
          >
            Ver todas →
          </button>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4" />
            <p className="text-surface-500 font-medium">Cargando solicitudes…</p>
          </div>
        ) : pendientes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-3 text-surface-400">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-surface-900 font-medium">No hay solicitudes pendientes</p>
            <p className="text-surface-500 text-sm mt-1">Cuando se carguen aparecerán acá</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {pendientes.map(s => (
              <button
                key={s.id}
                onClick={() => navigate(`/solicitudes-asignacion/${s.id}`)}
                className="w-full text-left px-4 sm:px-6 py-4 hover:bg-surface-50/60 transition-colors flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-surface-900">SA-{String(s.numero).padStart(4, '0')}</p>
                  <p className="text-sm text-surface-500 truncate">
                    {s.beneficiario ? `${s.beneficiario.apellido}, ${s.beneficiario.nombre}` : 'Sin beneficiario'}
                    <span className="text-surface-300 mx-1.5">·</span>
                    <span className="capitalize">{s.tipo_equipo}</span>
                    <span className="text-surface-300 mx-1.5">·</span>
                    <span className="capitalize">{(s.motivo || '').replaceAll('_', ' ')}</span>
                  </p>
                </div>
                <StatusBadgeAsignacion estado={s.estado} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Guía del flujo de asignación
// ─────────────────────────────────────────────────────────────────────────────

const PASOS = [
  {
    num: 1,
    titulo: 'Crear la solicitud',
    quien: 'RRHH o Infraestructura',
    color: 'sky',
    icon: 'M12 4v16m8-8H4',
    descripcion: 'Cualquier miembro de RRHH o Infraestructura puede iniciar una solicitud de asignación de equipo.',
    detalle: [
      'Ingresá a Asignación de equipos → Nueva solicitud',
      'Seleccioná el beneficiario (la persona que recibirá el equipo)',
      'Elegí el tipo de equipo: Notebook o Celular',
      'Indicá el motivo: nuevo ingreso, nuevo puesto, reposición por robo/rotura/pérdida, cambio de equipo u otro',
      'Para reposiciones por robo: adjuntá la denuncia policial',
      'Para reposiciones por rotura: adjuntá foto del equipo dañado',
      'Agregá una observación con el contexto técnico o administrativo',
      'Enviá la solicitud → queda en estado "En revisión Infra"',
    ],
    tip: 'El número de solicitud SA-XXXX se genera automáticamente y queda registrado en el historial del beneficiario.',
    estado: 'pendiente_infra'
  },
  {
    num: 2,
    titulo: 'Infra revisa y Compras puede asignar',
    quien: 'Infraestructura / Compras',
    color: 'violet',
    icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
    descripcion: 'Infraestructura revisa la solicitud. Compras puede asignar celulares mientras estén pendientes las aprobaciones de Infra o RRHH.',
    detalle: [
      'Ingresá al detalle de la solicitud',
      'En la sección "Asignar equipo", seleccioná primero la categoría del equipo (ej: Gerente, Ejecutivo)',
      'Al elegir la categoría, se cargan automáticamente los equipos disponibles de esa categoría en el depósito',
      'Seleccioná el equipo específico (marca, modelo, número de serie)',
      'Si es una reposición, indicá qué hacer con el equipo anterior (mantenimiento o baja)',
      'Infra debe aprobar explícitamente para que la solicitud pase a "Pendiente RRHH"',
      'Compras solo puede asignar celulares; el equipo queda reservado pero todavía no se genera el borrador de remito',
    ],
    tip: 'El borrador de remito requiere equipo asignado y las aprobaciones de Infra y RRHH.',
    estado: 'pendiente_rrhh'
  },
  {
    num: 3,
    titulo: 'RRHH aprueba',
    quien: 'Recursos Humanos',
    color: 'indigo',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    descripcion: 'RRHH revisa y aprueba la solicitud. Una vez aprobada, Compras e Infraestructura reciben una notificación por mail.',
    detalle: [
      'RRHH recibe una notificación de la solicitud pendiente',
      'Ingresá al detalle de la solicitud y revisá los datos: beneficiario, equipo asignado, motivo',
      'Si todo está correcto, hacé click en "Aprobar"',
      'Podés agregar una observación opcional (ej: "aprobado en línea con incorporación planificada")',
      'Al aprobar, Compras e Infra reciben un mail de notificación automático',
      'La solicitud pasa a estado "Aprobada"',
    ],
    tip: 'Si algo no está bien, RRHH puede rechazar la solicitud. Infra también puede rechazarla antes de que llegue a RRHH.',
    estado: 'aprobada'
  },
  {
    num: 4,
    titulo: 'Se habilita el remito',
    quien: 'Infraestructura',
    color: 'teal',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    descripcion: 'Con el equipo y las dos aprobaciones completas se habilita el remito. Si asignó Compras, se crea como borrador para que Infra lo complete.',
    detalle: [
      'Si el equipo fue asignado por Compras, el borrador se genera automáticamente al completar la última condición',
      'Infra ingresa al borrador, completa el técnico y los datos de entrega',
      'Si el equipo fue asignado por Infra, Infra genera el remito desde la solicitud aprobada',
      'El remito incluye: beneficiario como solicitante, técnico asignado, sede origen y destino',
      'El número de remito REM-XXXX queda vinculado a la solicitud',
      'Podés ver el remito completo haciendo click en "Ver remito" desde el detalle de la solicitud',
    ],
    tip: 'La solicitud queda fija al vincular el remito; los estados posteriores del remito no modifican la solicitud.',
    estado: 'remito_generado'
  }
]

const COLOR_MAP = {
  sky:     { bg: 'bg-sky-50',     border: 'border-sky-200',    text: 'text-sky-700',     num: 'bg-sky-600',     badge: 'bg-sky-100 text-sky-700 border-sky-200'     },
  violet:  { bg: 'bg-violet-50',  border: 'border-violet-200', text: 'text-violet-700',  num: 'bg-violet-600',  badge: 'bg-violet-100 text-violet-700 border-violet-200' },
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-200', text: 'text-indigo-700',  num: 'bg-indigo-600',  badge: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  teal:    { bg: 'bg-teal-50',    border: 'border-teal-200',   text: 'text-teal-700',    num: 'bg-teal-600',    badge: 'bg-teal-100 text-teal-700 border-teal-200'   },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700', num: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
}

function GuiaFlujo({ navigate, hasInfraestructura }) {
  const [abierto, setAbierto] = useState(false)
  const [pasoActivo, setPasoActivo] = useState(null)

  return (
    <div className="card-base overflow-hidden mb-8">
      {/* Header colapsable */}
      <button
        onClick={() => setAbierto(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-50/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-600" />
          </div>
          <div className="text-left">
            <p className="font-bold text-surface-900">¿Cómo funciona la asignación de equipos?</p>
            <p className="text-xs text-surface-500 mt-0.5">Guía paso a paso del flujo completo</p>
          </div>
        </div>
        {abierto ? <ChevronUp className="w-5 h-5 text-surface-400" /> : <ChevronDown className="w-5 h-5 text-surface-400" />}
      </button>

      {abierto && (
        <div className="border-t border-surface-200 p-6">
          {/* Intro */}
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-6">
            <p className="text-sm text-primary-900 leading-relaxed">
              El módulo de <strong>Asignación de equipos</strong> permite gestionar la entrega de notebooks y celulares del stock a los colaboradores de la empresa.
              El proceso involucra <strong>RRHH</strong>, <strong>Infraestructura</strong> y opcionalmente <strong>Compras</strong>, garantizando trazabilidad y control en cada etapa.
            </p>
          </div>

          {/* Línea de tiempo visual */}
          <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
            {PASOS.map((paso, idx) => {
              const c = COLOR_MAP[paso.color]
              return (
                <div key={paso.num} className="flex items-center shrink-0">
                  <button
                    onClick={() => setPasoActivo(pasoActivo === paso.num ? null : paso.num)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                      pasoActivo === paso.num ? `${c.badge} border-current shadow-sm` : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full ${pasoActivo === paso.num ? c.num : 'bg-surface-300'} text-white text-xs flex items-center justify-center font-extrabold shrink-0`}>
                      {paso.num}
                    </span>
                    <span className="whitespace-nowrap">{paso.titulo}</span>
                  </button>
                  {idx < PASOS.length - 1 && (
                    <div className="w-6 h-px bg-surface-300 mx-1 shrink-0" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Detalle del paso activo */}
          {pasoActivo ? (
            (() => {
              const paso = PASOS.find(p => p.num === pasoActivo)
              const c = COLOR_MAP[paso.color]
              return (
                <div className={`${c.bg} border ${c.border} rounded-xl p-5 animate-fade-in`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${c.num} flex items-center justify-center shrink-0`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={paso.icon} />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className={`font-bold text-surface-900`}>Paso {paso.num}: {paso.titulo}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${c.badge}`}>
                          {paso.quien}
                        </span>
                        <StatusBadgeAsignacion estado={paso.estado} />
                      </div>
                      <p className={`text-sm ${c.text} font-medium`}>{paso.descripcion}</p>
                    </div>
                  </div>

                  <ol className="space-y-2 mb-4 ml-2">
                    {paso.detalle.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-surface-800">
                        <span className={`w-5 h-5 rounded-full ${c.num} text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold`}>
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ol>

                  <div className="flex items-start gap-2 bg-white/70 border border-white rounded-lg px-4 py-3">
                    <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-xs text-surface-600"><strong className="text-amber-700">Tip:</strong> {paso.tip}</p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {pasoActivo > 1 && (
                      <button onClick={() => setPasoActivo(p => p - 1)} className="btn-secondary text-xs">
                        ← Paso anterior
                      </button>
                    )}
                    {pasoActivo < PASOS.length && (
                      <button onClick={() => setPasoActivo(p => p + 1)} className={`text-xs font-bold px-4 py-2 rounded-xl ${c.num} text-white hover:opacity-90 transition-opacity`}>
                        Siguiente paso →
                      </button>
                    )}
                    {pasoActivo === 1 && (
                      <button onClick={() => navigate('/solicitudes-asignacion/nueva')} className="btn-accent text-xs ml-auto">
                        Crear solicitud ahora →
                      </button>
                    )}
                  </div>
                </div>
              )
            })()
          ) : (
            /* Vista general cuando no hay paso activo */
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {PASOS.map(paso => {
                const c = COLOR_MAP[paso.color]
                return (
                  <button
                    key={paso.num}
                    onClick={() => setPasoActivo(paso.num)}
                    className={`${c.bg} border ${c.border} rounded-xl p-4 text-left hover:shadow-sm transition-all hover:-translate-y-0.5`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${c.num} flex items-center justify-center mb-3`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={paso.icon} />
                      </svg>
                    </div>
                    <p className={`text-xs font-bold ${c.text} mb-1`}>Paso {paso.num}</p>
                    <p className="text-sm font-bold text-surface-900 leading-tight">{paso.titulo}</p>
                    <p className="text-xs text-surface-500 mt-1">{paso.quien}</p>
                  </button>
                )
              })}
            </div>
          )}

          {/* Alerta de stock automática */}
          <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900 mb-0.5">Control automático de stock</p>
              <p className="text-sm text-amber-800 leading-relaxed">
                El sistema revisa el stock disponible por categoría todos los días a las 8 AM.
                Cuando el stock de una categoría cae por debajo de <strong>3 unidades</strong>,{' '}
                <strong>Compras recibe un aviso automático por mail</strong> para gestionar el pedido de reposición,
                indicando la categoría y la cantidad actual disponible.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-surface-100 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-surface-400">
              El sistema envía notificaciones por mail en cada transición de estado.
              El historial completo de cada solicitud queda registrado para auditoría.
            </p>
            {hasInfraestructura && (
              <button
                onClick={() => navigate('/categoria-equipos-asignacion')}
                className="text-xs text-primary-700 hover:underline font-medium"
              >
                Configurar categorías de equipo →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ title, value, subtitle, accent, iconPath }) {
  const accentClasses = {
    primary: 'text-primary-600 bg-primary-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    rose: 'text-rose-600 bg-rose-50'
  }
  return (
    <div className="card-base p-6 hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-surface-400 mb-1.5 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-surface-900 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-surface-500 mt-2 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${accentClasses[accent] || accentClasses.primary}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
        </div>
      </div>
    </div>
  )
}
