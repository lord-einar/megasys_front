import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import { inventarioAPI } from '../../services/api'

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
]

function agrupar(items, campo, maxItems = 10) {
  const map = {}
  let sinDatos = 0
  items.forEach(item => {
    const val = item[campo]?.trim()
    if (!val) { sinDatos++; return }
    map[val] = (map[val] || 0) + 1
  })
  const resultado = Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, maxItems)
  return { datos: resultado, sinDatos }
}

function agruparTipoArticulo(items, maxItems = 10) {
  const map = {}
  let sinDatos = 0
  items.forEach(item => {
    const val = item.tipoArticulo?.nombre?.trim()
    if (!val) { sinDatos++; return }
    map[val] = (map[val] || 0) + 1
  })
  const datos = Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, maxItems)
  return { datos, sinDatos }
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-surface-900 mb-0.5 truncate max-w-[200px]">{label}</p>
      <p className="text-primary-600 font-bold">{payload[0].value} equipo{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  )
}

function ReporteCard({ titulo, subtitulo, datos, sinDatos, loading }) {
  const total = datos.reduce((s, d) => s + d.value, 0)
  const hayDatos = datos.length > 0

  return (
    <div className="card-base bg-white p-6">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider">{titulo}</h3>
        {subtitulo && <p className="text-xs text-surface-400 mt-0.5">{subtitulo}</p>}
      </div>

      {loading ? (
        <div className="h-52 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-surface-200 border-t-primary-600 animate-spin" />
        </div>
      ) : !hayDatos ? (
        <div className="h-52 flex flex-col items-center justify-center text-surface-400">
          <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium">Sin datos registrados</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={Math.max(180, datos.length * 36)}>
            <BarChart
              data={datos}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={160}
                tick={{ fontSize: 11, fill: '#475569' }}
                tickFormatter={v => v.length > 22 ? v.slice(0, 22) + '…' : v}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {datos.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {sinDatos > 0 && (
            <p className="text-[11px] text-surface-400 mt-3 text-right">
              {sinDatos} equipo{sinDatos !== 1 ? 's' : ''} sin datos en este campo
            </p>
          )}
          <p className="text-[11px] text-surface-400 text-right">
            Total con datos: <span className="font-semibold text-surface-600">{total}</span>
          </p>
        </>
      )}
    </div>
  )
}

export default function InventarioReportes() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true)
        const res = await inventarioAPI.list({ limit: 500, page: 1 })
        const data = res?.data?.inventario || res?.data || []
        setItems(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error cargando datos para reportes:', err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const tipo = agruparTipoArticulo(items)
  const marca = agrupar(items, 'marca')
  const procesador = agrupar(items, 'procesador')
  const memoria = agrupar(items, 'memoria')
  const disco = agrupar(items, 'disco')
  const so = agrupar(items, 'sistema_operativo')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Resumen */}
      {!loading && (
        <div className="card-base bg-primary-50 border border-primary-100 px-6 py-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-primary-700 font-medium">
            Análisis sobre <span className="font-bold">{items.length}</span> artículo{items.length !== 1 ? 's' : ''} en inventario
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReporteCard
          titulo="Por Tipo de Artículo"
          subtitulo="Distribución por categoría"
          datos={tipo.datos}
          sinDatos={tipo.sinDatos}
          loading={loading}
        />
        <ReporteCard
          titulo="Por Marca"
          subtitulo="Top 10 marcas"
          datos={marca.datos}
          sinDatos={marca.sinDatos}
          loading={loading}
        />
        <ReporteCard
          titulo="Por Procesador"
          subtitulo="Top 10 procesadores"
          datos={procesador.datos}
          sinDatos={procesador.sinDatos}
          loading={loading}
        />
        <ReporteCard
          titulo="Por Memoria RAM"
          subtitulo="Distribución de memoria"
          datos={memoria.datos}
          sinDatos={memoria.sinDatos}
          loading={loading}
        />
        <ReporteCard
          titulo="Por Disco"
          subtitulo="Distribución de almacenamiento"
          datos={disco.datos}
          sinDatos={disco.sinDatos}
          loading={loading}
        />
        <ReporteCard
          titulo="Por Sistema Operativo"
          subtitulo="Top 10 sistemas operativos"
          datos={so.datos}
          sinDatos={so.sinDatos}
          loading={loading}
        />
      </div>
    </div>
  )
}
