import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { solicitudesCompraAPI, categoriaEquiposAsignacionAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import { Laptop, Smartphone, Monitor, Search, ArrowLeft, User as UserIcon, Building2, History, Plus, Pencil } from 'lucide-react'

const TIPO_LABELS = {
  notebook: 'Notebooks',
  celular: 'Celulares',
  pc_escritorio: 'PC de escritorio'
}

const TIPO_SINGULAR = {
  notebook: 'notebook',
  celular: 'celular',
  pc_escritorio: 'PC de escritorio'
}

const ESTADO_LABELS = {
  disponible: { label: 'Disponible', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  en_uso: { label: 'En uso', cls: 'bg-blue-50 text-blue-700 border-blue-100' },
  en_prestamo: { label: 'Préstamo', cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  mantenimiento: { label: 'Mantenimiento', cls: 'bg-violet-50 text-violet-700 border-violet-100' },
  dado_de_baja: { label: 'Baja', cls: 'bg-rose-50 text-rose-700 border-rose-100' },
  producto_proveedor: { label: 'Proveedor', cls: 'bg-surface-100 text-surface-600 border-surface-200' }
}

export default function StockEquiposPage() {
  const navigate = useNavigate()
  const { canViewSolicitudesCompra, canViewSolicitudesAsignacion, hasLegacyAccess, hasCompras, hasInfraestructura } = usePermissions()
  const [tipo, setTipo] = useState('notebook')
  const [vista, setVista] = useState('todos') // todos | disponibles | entregados
  const [search, setSearch] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('') // filtro por categoría
  const [data, setData] = useState({ items: [], resumen: { total: 0, disponibles: 0, entregados: 0, por_tipo: {} } })
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const canView = canViewSolicitudesCompra || canViewSolicitudesAsignacion
  const canEdit = hasCompras || hasInfraestructura

  useEffect(() => {
    if (!canView) return
    cargarStock()
    setCategoriaFiltro('')
  }, [tipo])

  useEffect(() => {
    // Cargar categorías del tipo seleccionado
    categoriaEquiposAsignacionAPI.list({ tipo, activo: true })
      .then(r => setCategorias(r?.data || []))
      .catch(() => setCategorias([]))
  }, [tipo])

  const cargarStock = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = { tipo }
      const resp = await solicitudesCompraAPI.stockEquipos(params)
      const payload = resp?.data || resp
      setData(payload || { items: [], resumen: { total: 0, disponibles: 0, entregados: 0, por_tipo: {} } })
    } catch (err) {
      setError(err.message || 'Error al cargar el stock')
    } finally {
      setLoading(false)
    }
  }

  if (!canView) {
    return <div className="p-8 text-center"><p className="text-surface-500">No tenés permisos para ver esta sección.</p></div>
  }

  const esEntregado = (item) => item.titular_tipo === 'persona' || item.titular_tipo === 'sede'

  const itemsFiltrados = data.items.filter(item => {
    if (vista === 'disponibles' && esEntregado(item)) return false
    if (vista === 'entregados' && !esEntregado(item)) return false
    if (categoriaFiltro && item.categoria?.id !== categoriaFiltro) return false
    if (search) {
      const q = search.toLowerCase()
      const haystack = [
        item.marca, item.modelo, item.numero_serie, item.service_tag,
        item.titular_personal?.nombre, item.titular_personal?.apellido,
        item.titular_personal?.email, item.sede?.nombre_sede,
        item.categoria?.nombre
      ].filter(Boolean).join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  const resumenTipo = data.resumen.por_tipo[tipo.toLowerCase()] || data.resumen.por_tipo[TIPO_LABELS[tipo]?.toLowerCase()] || data.resumen

  // Resumen por categoría (solo disponibles)
  const disponiblesPorCategoria = useMemo(() => {
    const map = {}
    data.items.forEach(item => {
      if (item.estado === 'disponible') {
        const key = item.categoria?.id || '__sin_categoria__'
        const nombre = item.categoria?.nombre || 'Sin categoría'
        if (!map[key]) map[key] = { nombre, count: 0 }
        map[key].count++
      }
    })
    return Object.values(map).sort((a, b) => b.count - a.count)
  }, [data.items])

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/solicitudes-compra/dashboard')}
            className="text-surface-500 hover:text-primary-600 transition-colors"
            aria-label="Volver al dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="page-title">Stock de equipos</h1>
            <p className="page-description">Notebooks, celulares y PC de escritorio: disponibles y entregados</p>
          </div>
        </div>
        {(hasCompras || hasInfraestructura) && (
          <button
            onClick={() => navigate(`/solicitudes-compra/ingreso/${tipo}`)}
            className="btn-accent flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ingresar {TIPO_SINGULAR[tipo]}
          </button>
        )}
      </div>

      {/* Tabs por tipo */}
      <div className="flex gap-2 mb-6">
        <TipoTab active={tipo === 'notebook'} onClick={() => setTipo('notebook')} icon={<Laptop className="w-4 h-4" />} label="Notebooks" />
        <TipoTab active={tipo === 'celular'} onClick={() => setTipo('celular')} icon={<Smartphone className="w-4 h-4" />} label="Celulares" />
        <TipoTab active={tipo === 'pc_escritorio'} onClick={() => setTipo('pc_escritorio')} icon={<Monitor className="w-4 h-4" />} label="PC de escritorio" />
      </div>

      {error && (
        <div className="card-base p-4 mb-6 border-l-4 border-l-rose-500 bg-rose-50/50">
          <p className="text-sm text-rose-700 font-medium">{error}</p>
        </div>
      )}

      {/* Resumen totales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <SummaryCard label="Total" value={resumenTipo.total || 0} tone="primary" onClick={() => { setVista('todos'); setCategoriaFiltro('') }} active={vista === 'todos' && !categoriaFiltro} />
        <SummaryCard label="Disponibles" value={resumenTipo.disponibles || 0} tone="emerald" onClick={() => { setVista('disponibles'); setCategoriaFiltro('') }} active={vista === 'disponibles' && !categoriaFiltro} />
        <SummaryCard label="Entregados" value={resumenTipo.entregados || 0} tone="amber" onClick={() => { setVista('entregados'); setCategoriaFiltro('') }} active={vista === 'entregados' && !categoriaFiltro} />
      </div>

      {/* Disponibles por categoría */}
      {disponiblesPorCategoria.length > 0 && (
        <div className="card-base p-5 mb-4">
          <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Disponibles por categoría</p>
          <div className="flex flex-wrap gap-2">
            {disponiblesPorCategoria.map(cat => {
              const catId = categorias.find(c => c.nombre === cat.nombre)?.id || ''
              const activa = categoriaFiltro === catId
              return (
                <button
                  key={cat.nombre}
                  onClick={() => { setCategoriaFiltro(activa ? '' : catId); setVista('disponibles') }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    activa
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span className="font-bold">{cat.count}</span>
                  <span>{cat.nombre}</span>
                </button>
              )
            })}
            {categoriaFiltro && (
              <button onClick={() => setCategoriaFiltro('')} className="px-3 py-1.5 text-xs text-surface-500 hover:text-surface-700 underline">
                ver todas
              </button>
            )}
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="card-base p-4 mb-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-surface-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por marca, modelo, número de serie, titular o sede…"
          className="flex-1 bg-transparent outline-none text-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-surface-400 hover:text-surface-700">
            limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="card-base overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-3" />
            <p className="text-surface-500 font-medium">Cargando stock…</p>
          </div>
        ) : itemsFiltrados.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-surface-900 font-medium">No hay equipos para mostrar</p>
            <p className="text-surface-500 text-sm mt-1">Probá cambiar de filtro o limpiar la búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Equipo</th>
                  <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Serie / Tag</th>
                  {tipo === 'celular' && (
                    <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">IMEI</th>
                  )}
                  <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Titular</th>
                  <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Sede</th>
                  <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Categoría</th>
                  <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Motivo / Asignación</th>
                  {canEdit && (
                    <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider text-right">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {itemsFiltrados.map(item => (
                  <FilaEquipo
                    key={item.id}
                    item={item}
                    mostrarImei={tipo === 'celular'}
                    onClickPersonal={(pid) => navigate(hasLegacyAccess ? `/personal/${pid}` : `/solicitudes-asignacion/historial-equipos/personal/${pid}`)}
                    onClickSede={(sid) => navigate(hasLegacyAccess ? `/sedes/${sid}` : `/solicitudes-asignacion/historial-equipos/sede/${sid}`)}
                    onHistorial={(pid) => navigate(`/solicitudes-asignacion/historial-equipos/personal/${pid}`)}
                    canEdit={canEdit}
                    onEditar={(iid) => navigate(`/solicitudes-compra/equipo/${iid}/editar`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function TipoTab({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-bold ${active
        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
        : 'bg-white text-surface-600 border-surface-200 hover:border-primary-300 hover:text-primary-600'
        }`}
    >
      {icon}
      {label}
    </button>
  )
}

function SummaryCard({ label, value, tone, onClick, active }) {
  const tones = {
    primary: { value: 'text-primary-600', ring: 'ring-primary-300', label: 'text-primary-700' },
    emerald: { value: 'text-emerald-600', ring: 'ring-emerald-300', label: 'text-emerald-700' },
    amber: { value: 'text-amber-600', ring: 'ring-amber-300', label: 'text-amber-700' }
  }
  const t = tones[tone] || tones.primary
  return (
    <button
      onClick={onClick}
      className={`card-base p-5 text-left transition-all hover:-translate-y-0.5 ${active ? `ring-2 ${t.ring}` : ''}`}
    >
      <p className={`text-xs font-bold ${t.label} uppercase tracking-wider mb-1`}>{label}</p>
      <p className={`text-3xl font-extrabold ${t.value} tracking-tight`}>{value}</p>
    </button>
  )
}

function FilaEquipo({ item, mostrarImei, onClickPersonal, onClickSede, onHistorial, canEdit, onEditar }) {
  const estado = ESTADO_LABELS[item.estado] || { label: item.estado, cls: 'bg-surface-50 text-surface-600 border-surface-200' }
  return (
    <tr className="hover:bg-surface-50/60 transition-colors">
      <td className="px-4 py-3">
        <p className="font-semibold text-surface-900">{item.marca} {item.modelo}</p>
        <p className="text-xs text-surface-500">{item.tipo}</p>
      </td>
      <td className="px-4 py-3 text-sm text-surface-700">
        {item.numero_serie && <p className="font-mono">{item.numero_serie}</p>}
        {item.service_tag && <p className="font-mono text-xs text-surface-500">TAG: {item.service_tag}</p>}
        {!item.numero_serie && !item.service_tag && <span className="text-surface-400 italic">—</span>}
      </td>
      {mostrarImei && (
        <td className="px-4 py-3 text-sm text-surface-700">
          {item.imei
            ? <p className="font-mono">{item.imei}</p>
            : <span className="text-surface-400 italic">—</span>
          }
        </td>
      )}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${estado.cls}`}>
          {estado.label}
        </span>
      </td>
      <td className="px-4 py-3">
        {item.titular_personal ? (
          <div className="flex items-center gap-2">
            <button onClick={() => onClickPersonal(item.titular_personal.id)} className="flex items-center gap-1.5 text-sm text-primary-700 hover:text-primary-900 hover:underline">
              <UserIcon className="w-3.5 h-3.5" />
              {item.titular_personal.apellido}, {item.titular_personal.nombre}
            </button>
            <button
              onClick={() => onHistorial(item.titular_personal.id)}
              title="Ver historial de equipos"
              className="text-surface-400 hover:text-primary-600 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : item.titular_tipo === 'sede' && item.sede ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-surface-700">
            <Building2 className="w-3.5 h-3.5 text-surface-400" />
            Sede
          </span>
        ) : (
          <span className="text-surface-400 text-sm italic">Sin asignar</span>
        )}
      </td>
      <td className="px-4 py-3">
        {item.sede ? (
          <button onClick={() => onClickSede(item.sede.id)} className="flex items-center gap-1.5 text-sm text-surface-700 hover:text-primary-700 hover:underline">
            <Building2 className="w-3.5 h-3.5 text-surface-400" />
            {item.sede.nombre_sede}
          </button>
        ) : (
          <span className="text-surface-400 text-sm italic">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-surface-700">
        {item.categoria?.nombre || <span className="text-surface-400 italic">—</span>}
      </td>
      <td className="px-4 py-3 text-sm text-surface-700 max-w-xs">
        {item.asignacion_actual?.motivo ? (
          <div>
            <p className="line-clamp-2">{item.asignacion_actual.motivo}</p>
            {item.asignacion_actual.fecha_asignacion && (
              <p className="text-xs text-surface-400 mt-0.5">
                Desde {new Date(item.asignacion_actual.fecha_asignacion).toLocaleDateString('es-AR')}
              </p>
            )}
          </div>
        ) : (
          <span className="text-surface-400 italic">—</span>
        )}
      </td>
      {canEdit && (
        <td className="px-4 py-3 text-right">
          <button
            onClick={() => onEditar(item.id)}
            title="Editar equipo"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-surface-500 hover:text-primary-600 border border-surface-200 hover:border-primary-300 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </button>
        </td>
      )}
    </tr>
  )
}
