import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { categoriaEquiposAsignacionAPI } from '../services/api'
import { normalizeApiResponse } from '../utils/apiResponseNormalizer'
import { Plus, RefreshCw, Pencil, ArrowLeft } from 'lucide-react'

const TIPO_LABELS = {
  notebook: 'Notebook',
  celular: 'Celular',
  pc: 'PC de escritorio',
  ambos: 'Ambos'
}

const FORM_INICIAL = { nombre: '', descripcion: '', tipo: 'ambos' }

export default function CategoriaEquiposAsignacionPage() {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  // Formulario (null = cerrado, {} = nueva, { id, ... } = edición)
  const [formData, setFormData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  const cargar = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await categoriaEquiposAsignacionAPI.list()
      setCategorias(normalizeApiResponse(res, 200).data)
    } catch (err) {
      setError(err.message || 'Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const abrirNueva = () => {
    setFormData({ ...FORM_INICIAL })
    setFormError(null)
  }

  const abrirEdicion = (cat) => {
    setFormData({ id: cat.id, nombre: cat.nombre, descripcion: cat.descripcion || '', tipo: cat.tipo || 'ambos' })
    setFormError(null)
  }

  const cerrarForm = () => {
    setFormData(null)
    setFormError(null)
  }

  const setField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const guardar = async (e) => {
    e.preventDefault()
    if (!formData.nombre.trim()) {
      setFormError('El nombre es obligatorio')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      const payload = { nombre: formData.nombre, descripcion: formData.descripcion, tipo: formData.tipo }
      if (formData.id) {
        await categoriaEquiposAsignacionAPI.actualizar(formData.id, payload)
        setMensaje('Categoría actualizada correctamente')
      } else {
        await categoriaEquiposAsignacionAPI.crear(payload)
        setMensaje('Categoría creada correctamente')
      }
      cerrarForm()
      await cargar()
      setTimeout(() => setMensaje(null), 3000)
    } catch (err) {
      setFormError(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const eliminar = async (cat) => {
    if (!window.confirm(`¿Desactivar/eliminar la categoría "${cat.nombre}"?`)) return
    try {
      const res = await categoriaEquiposAsignacionAPI.eliminar(cat.id)
      if (res?.eliminado === false) {
        setMensaje('Categoría desactivada (está en uso por solicitudes existentes)')
      } else {
        setMensaje('Categoría eliminada correctamente')
      }
      await cargar()
      setTimeout(() => setMensaje(null), 4000)
    } catch (err) {
      setError(err.message || 'Error al eliminar')
    }
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/solicitudes-asignacion/dashboard')}
            className="text-surface-500 hover:text-primary-600 transition-colors"
            aria-label="Volver al dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Solicitudes de asignación</p>
            <h1 className="page-title">Categorías de equipo</h1>
            <p className="page-description">ABM de categorías para clasificar equipos asignados</p>
          </div>
        </div>
        <div className="responsive-actions">
          <button onClick={cargar} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Recargar
          </button>
          <button onClick={abrirNueva} className="btn-primary">
            <Plus className="w-4 h-4" />
            Nueva categoría
          </button>
        </div>
      </div>

      {mensaje && (
        <div className="card-base p-4 mb-5 border-l-4 border-l-emerald-500 bg-emerald-50/50">
          <p className="text-sm text-emerald-800 font-medium">{mensaje}</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 mb-4">
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </div>
      )}

      {/* Formulario inline */}
      {formData !== null && (
        <div className="card-base p-6 mb-6 border-l-4 border-l-primary-500">
          <h2 className="font-bold text-surface-900 mb-4">
            {formData.id ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <form onSubmit={guardar} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="md:col-span-1">
              <span className="label-base">Nombre</span>
              <input
                value={formData.nombre}
                onChange={e => setField('nombre', e.target.value)}
                className="input-base"
                placeholder="Ej: Estándar ejecutivo"
                required
              />
            </label>
            <label>
              <span className="label-base">Tipo</span>
              <select
                value={formData.tipo}
                onChange={e => setField('tipo', e.target.value)}
                className="input-base"
              >
                <option value="ambos">Ambos</option>
                <option value="notebook">Notebook</option>
                <option value="celular">Celular</option>
                <option value="pc">PC de escritorio</option>
              </select>
            </label>
            <label>
              <span className="label-base">Descripción (opcional)</span>
              <input
                value={formData.descripcion}
                onChange={e => setField('descripcion', e.target.value)}
                className="input-base"
                placeholder="Descripción breve"
              />
            </label>
            {formError && (
              <div className="md:col-span-3">
                <p className="text-sm text-rose-700 font-medium">{formError}</p>
              </div>
            )}
            <div className="md:col-span-3 flex gap-3 justify-end border-t border-surface-100 pt-4">
              <button type="button" onClick={cerrarForm} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (formData.id ? 'Guardar cambios' : 'Crear categoría')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de categorías */}
      <div className="card-base overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-200">
          <h2 className="font-bold text-surface-900">Categorías</h2>
          <p className="text-xs text-surface-500 mt-0.5">{categorias.length} registros</p>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4" />
            <p className="text-surface-500 font-medium">Cargando categorías...</p>
          </div>
        ) : categorias.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-surface-900 font-medium">No hay categorías definidas</p>
            <p className="text-surface-500 text-sm mt-1">Crea la primera categoría con el botón de arriba.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Descripción</th>
                  <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Activo</th>
                  <th className="px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {categorias.map(cat => (
                  <tr key={cat.id} className="hover:bg-surface-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-surface-900">{cat.nombre}</td>
                    <td className="px-4 py-3 text-sm text-surface-700">{TIPO_LABELS[cat.tipo] || cat.tipo || '—'}</td>
                    <td className="px-4 py-3 text-sm text-surface-500 max-w-xs truncate">{cat.descripcion || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        cat.activo !== false
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-surface-100 text-surface-600 border-surface-200'
                      }`}>
                        {cat.activo !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => abrirEdicion(cat)}
                          className="text-xs text-primary-700 hover:text-primary-900 font-medium flex items-center gap-1"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Editar
                        </button>
                        <button
                          onClick={() => eliminar(cat)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                          title="Eliminar / desactivar"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
