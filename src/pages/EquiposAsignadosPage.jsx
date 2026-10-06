import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { asignacionesAPI, inventarioAPI, personalAPI, tipoArticuloAPI } from '../services/api'
import Swal from 'sweetalert2'

// Equipos personales: se asignan a una persona y la acompañan si cambia de sede.
// tipoArticulo es el nombre del TipoArticulo en inventario.
const TIPOS = {
  celular: { label: 'Celular', plural: 'Celulares', tipoArticulo: 'Celular' },
  notebook: { label: 'Notebook', plural: 'Notebooks', tipoArticulo: 'Notebook' }
}

export default function EquiposAsignadosPage() {
  const navigate = useNavigate()
  const [asignaciones, setAsignaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [filtroActivos, setFiltroActivos] = useState(true)
  const [tipo, setTipo] = useState('celular')

  useEffect(() => {
    cargar()
  }, [filtroActivos, tipo])

  const cargar = async () => {
    try {
      setLoading(true)
      const params = { tipo_articulo: TIPOS[tipo].tipoArticulo }
      if (filtroActivos) params.activo = true
      const res = await asignacionesAPI.list(params)
      setAsignaciones(res?.data || res || [])
    } catch (err) {
      console.error('Error cargando asignaciones:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const handleCerrar = async (asig) => {
    const result = await Swal.fire({
      title: '¿Confirmar devolución?',
      text: `${asig.inventario?.marca} ${asig.inventario?.modelo} — ${asig.personal?.nombre} ${asig.personal?.apellido}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, devolver',
      cancelButtonText: 'Cancelar'
    })
    if (!result.isConfirmed) return
    try {
      await asignacionesAPI.cerrar(asig.id)
      await cargar()
    } catch (err) {
      Swal.fire('Error', err.message || 'No se pudo cerrar la asignación', 'error')
    }
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-surface-900">Equipos asignados</h1>
            <p className="text-surface-500 mt-1">Celulares y notebooks entregados al personal. El equipo acompaña a la persona si cambia de sede.</p>
          </div>
          <button
            onClick={() => setMostrarModal(true)}
            className="btn-primary"
          >
            + Asignar {TIPOS[tipo].label.toLowerCase()}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(TIPOS).map(([key, t]) => (
            <button
              key={key}
              onClick={() => setTipo(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${tipo === key ? 'bg-surface-900 text-white' : 'bg-white text-surface-600 border border-surface-200'}`}
            >
              {t.plural}
            </button>
          ))}
          <span className="w-px bg-surface-200 mx-1" aria-hidden="true" />
          <button
            onClick={() => setFiltroActivos(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filtroActivos ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 border border-surface-200'}`}
          >
            Activos
          </button>
          <button
            onClick={() => setFiltroActivos(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${!filtroActivos ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 border border-surface-200'}`}
          >
            Todos (incluye historial)
          </button>
        </div>

        <div className="card-base overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-surface-500">Cargando...</div>
          ) : asignaciones.length === 0 ? (
            <div className="py-12 text-center text-surface-500">Sin asignaciones</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">Persona</th>
                    <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">{TIPOS[tipo].label}</th>
                    <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">Sede</th>
                    <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">Fecha asignación</th>
                    <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">Fecha devolución</th>
                    <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">Motivo</th>
                    <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-surface-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {asignaciones.map(a => (
                    <tr key={a.id} className="hover:bg-surface-50/50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/personal/${a.personal?.id}`)}
                          className="font-semibold text-primary-700 hover:underline"
                        >
                          {a.personal?.nombre} {a.personal?.apellido}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium text-surface-900">{a.inventario?.marca} {a.inventario?.modelo}</p>
                        {a.inventario?.numero_serie && (
                          <p className="text-xs text-surface-500">S/N: {a.inventario.numero_serie}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-700">{a.inventario?.sedePrincipal?.nombre_sede || '—'}</td>
                      <td className="px-6 py-4 text-sm text-surface-700">{formatDate(a.fecha_asignacion)}</td>
                      <td className="px-6 py-4 text-sm text-surface-700">{formatDate(a.fecha_devolucion)}</td>
                      <td className="px-6 py-4 text-sm text-surface-600 max-w-xs truncate" title={a.motivo}>{a.motivo}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${a.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-200 text-surface-600'}`}>
                          {a.activo ? 'Activo' : 'Devuelto'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {a.activo && (
                          <button
                            onClick={() => handleCerrar(a)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline"
                          >
                            Registrar devolución
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {mostrarModal && (
        <ModalAsignarEquipo
          tipo={TIPOS[tipo]}
          onClose={() => setMostrarModal(false)}
          onSaved={() => { setMostrarModal(false); cargar() }}
        />
      )}
    </div>
  )
}

function ModalAsignarEquipo({ tipo, onClose, onSaved }) {
  const [inventarios, setInventarios] = useState([])
  const [personales, setPersonales] = useState([])
  const [form, setForm] = useState({
    inventario_id: '',
    personal_id: '',
    fecha_asignacion: new Date().toISOString().slice(0, 10),
    motivo: ''
  })
  const [loading, setLoading] = useState(false)
  const [cargandoListas, setCargandoListas] = useState(true)

  useEffect(() => {
    cargarListas()
  }, [])

  const cargarListas = async () => {
    try {
      setCargandoListas(true)
      const tiposRes = await tipoArticuloAPI.list({ limit: 100 })
      const tipos = tiposRes?.data || []
      const tipoArticulo = tipos.find(t => t.nombre === tipo.tipoArticulo)
      if (!tipoArticulo) {
        setInventarios([])
        return
      }

      const invParams = { limit: 500, estado: 'disponible', tipo_articulo_id: tipoArticulo.id }

      const [invRes, perRes] = await Promise.all([
        inventarioAPI.list(invParams),
        personalAPI.list({ limit: 500 })
      ])
      setInventarios(invRes?.data || [])
      setPersonales(perRes?.data || [])
    } catch (err) {
      console.error('Error cargando listas:', err)
    } finally {
      setCargandoListas(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.inventario_id || !form.personal_id || !form.motivo.trim()) {
      Swal.fire('Datos incompletos', `Seleccioná ${tipo.label.toLowerCase()}, persona y completá el motivo`, 'warning')
      return
    }
    try {
      setLoading(true)
      await asignacionesAPI.crear(form)
      Swal.fire('Éxito', `${tipo.label} asignado correctamente. Queda ubicado en la sede de la persona.`, 'success')
      onSaved()
    } catch (err) {
      Swal.fire('Error', err.message || 'No se pudo asignar', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-surface-900">Asignar {tipo.label.toLowerCase()}</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600">✕</button>
        </div>

        {cargandoListas ? (
          <div className="py-8 text-center text-surface-500">Cargando listas...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-surface-700 mb-1">{tipo.label}</label>
              <select
                value={form.inventario_id}
                onChange={e => setForm({ ...form, inventario_id: e.target.value })}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Seleccionar...</option>
                {inventarios.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.marca} {i.modelo} {i.numero_serie ? `— S/N: ${i.numero_serie}` : ''} {i.sedePrincipal?.nombre_sede ? `(${i.sedePrincipal.nombre_sede})` : ''}
                  </option>
                ))}
              </select>
              {inventarios.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No hay {tipo.plural.toLowerCase()} disponibles en inventario. Cargá uno en /inventario/crear con tipo "{tipo.tipoArticulo}".</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-surface-700 mb-1">Persona</label>
              <select
                value={form.personal_id}
                onChange={e => setForm({ ...form, personal_id: e.target.value })}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Seleccionar...</option>
                {personales.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-surface-700 mb-1">Fecha de asignación</label>
              <input
                type="date"
                value={form.fecha_asignacion}
                onChange={e => setForm({ ...form, fecha_asignacion: e.target.value })}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-surface-700 mb-1">Motivo</label>
              <textarea
                value={form.motivo}
                onChange={e => setForm({ ...form, motivo: e.target.value })}
                rows={3}
                placeholder="Ej: Nuevo ingreso, cambio por robo, cambio por rotura..."
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Guardando...' : 'Asignar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
