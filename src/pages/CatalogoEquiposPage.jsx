import { useEffect, useState } from 'react'
import { catalogoEquiposAPI } from '../services/api'
import Swal from 'sweetalert2'

const TIPOS = [
  { value: 'celular', label: 'Celular' },
  { value: 'notebook', label: 'Notebook' }
]

const FORM_INICIAL = { tipo: 'celular', marca: '', modelo: '', descripcion: '' }

export default function CatalogoEquiposPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [verInactivos, setVerInactivos] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [editandoId, setEditandoId] = useState(null)
  const [saving, setSaving] = useState(false)

  const cargar = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (filtroTipo) params.tipo = filtroTipo
      if (!verInactivos) params.activo = true
      const res = await catalogoEquiposAPI.list(params)
      setItems(Array.isArray(res?.data) ? res.data : [])
    } catch (err) {
      setError(err.message || 'Error cargando catálogo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [filtroTipo, verInactivos])

  const reset = () => {
    setForm(FORM_INICIAL)
    setEditandoId(null)
    setError(null)
  }

  const editar = (item) => {
    setForm({
      tipo: item.tipo,
      marca: item.marca,
      modelo: item.modelo,
      descripcion: item.descripcion || ''
    })
    setEditandoId(item.id)
  }

  const guardar = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (editandoId) {
        await catalogoEquiposAPI.actualizar(editandoId, form)
      } else {
        await catalogoEquiposAPI.crear(form)
      }
      reset()
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const toggleActivo = async (item) => {
    try {
      await catalogoEquiposAPI.actualizar(item.id, { activo: !item.activo })
      await cargar()
    } catch (err) {
      Swal.fire('Error', err.message || 'No se pudo cambiar el estado', 'error')
    }
  }

  const eliminar = async (item) => {
    const result = await Swal.fire({
      title: '¿Eliminar del catálogo?',
      text: `${item.marca} ${item.modelo}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })
    if (!result.isConfirmed) return
    try {
      const res = await catalogoEquiposAPI.eliminar(item.id)
      if (res?.data?.desactivado) {
        Swal.fire('Marcado como inactivo', 'El equipo está referenciado por solicitudes y no se pudo borrar definitivamente. Quedó como inactivo.', 'info')
      }
      await cargar()
    } catch (err) {
      Swal.fire('Error', err.message || 'No se pudo eliminar', 'error')
    }
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      <div className="mb-8">
        <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Solicitudes de compra</p>
        <h1 className="text-2xl font-bold text-surface-900">Catálogo de equipos</h1>
        <p className="text-surface-500 mt-1 font-medium">Marcas y modelos aprobados para asignar a las solicitudes</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 mb-4">
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </div>
      )}

      <form onSubmit={guardar} className="card-base p-5 mb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[150px_1fr_1fr_2fr_auto_auto] gap-4">
        <label>
          <span className="label-base">Tipo</span>
          <select
            value={form.tipo}
            onChange={e => setForm(prev => ({ ...prev, tipo: e.target.value }))}
            className="input-base"
          >
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label>
          <span className="label-base">Marca</span>
          <input
            value={form.marca}
            onChange={e => setForm(prev => ({ ...prev, marca: e.target.value }))}
            className="input-base"
            placeholder="Ej. Samsung"
            required
          />
        </label>
        <label>
          <span className="label-base">Modelo</span>
          <input
            value={form.modelo}
            onChange={e => setForm(prev => ({ ...prev, modelo: e.target.value }))}
            className="input-base"
            placeholder="Ej. A35"
            required
          />
        </label>
        <label>
          <span className="label-base">Descripción</span>
          <input
            value={form.descripcion}
            onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
            className="input-base"
            placeholder="Opcional"
          />
        </label>
        <div className="flex items-end">
          <button className="btn-primary w-full" disabled={saving}>
            {saving ? 'Guardando...' : (editandoId ? 'Actualizar' : 'Agregar')}
          </button>
        </div>
        {editandoId && (
          <div className="flex items-end">
            <button type="button" onClick={reset} className="btn-secondary w-full">Cancelar</button>
          </div>
        )}
      </form>

      <div className="card-base overflow-hidden mb-2">
        <div className="px-6 py-4 border-b border-surface-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-surface-900">Equipos configurados</h2>
            <p className="text-xs text-surface-500 mt-0.5">{items.length} modelos visibles</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            className="input-base w-auto min-w-44"
          >
            <option value="">Todos los tipos</option>
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <label className="inline-flex items-center gap-2 text-sm text-surface-700">
            <input type="checkbox" checked={verInactivos} onChange={e => setVerInactivos(e.target.checked)} />
            Mostrar inactivos
          </label>
          </div>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4" />
            <p className="text-surface-500 font-medium">Cargando catálogo...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-3 text-surface-400">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8 4-8-4m16 0l-8-4-8 4m16 0v10l-8 4m0-10v10m0-10L4 7m8 4l8-4" />
              </svg>
            </div>
            <p className="text-surface-900 font-medium">No hay equipos cargados con estos filtros</p>
            <p className="text-surface-500 text-sm mt-1">Agrega un modelo o cambia el filtro.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {items.map(item => (
              <div key={item.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-surface-50/60 transition-colors">
                <div className="min-w-0">
                  <p className="font-semibold text-surface-900">
                    {item.marca} {item.modelo}
                    {!item.activo && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-surface-100 text-surface-700 border-surface-200">Inactivo</span>}
                  </p>
                  <p className="text-sm text-surface-500 capitalize">{item.tipo}{item.descripcion ? ` · ${item.descripcion}` : ''}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => editar(item)} className="btn-secondary text-xs py-1.5 px-3">Editar</button>
                  <button onClick={() => toggleActivo(item)} className="btn-secondary text-xs py-1.5 px-3">
                    {item.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => eliminar(item)} className="btn-danger text-xs py-1.5 px-3">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
