import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { solicitudesCompraAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import HistorialEquipos from '../components/solicitudesCompra/HistorialEquipos'
import { ArrowLeft, Building2 } from 'lucide-react'

export default function HistorialEquiposSedePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canViewSolicitudesCompra } = usePermissions()
  const [sede, setSede] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!canViewSolicitudesCompra) return
    cargar()
  }, [id])

  const cargar = async () => {
    try {
      setLoading(true)
      const resp = await solicitudesCompraAPI.historialEquiposSede(id)
      setSede((resp?.data || resp)?.sede || null)
    } catch (err) {
      setError(err.message || 'No se pudo cargar el historial')
    } finally {
      setLoading(false)
    }
  }

  if (!canViewSolicitudesCompra) {
    return <div className="p-8 text-center"><p className="text-surface-500">No tenés permisos para ver esta sección.</p></div>
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-surface-500 hover:text-primary-600 transition-colors" aria-label="Volver">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-500" />
              {loading ? 'Cargando…' : sede?.nombre_sede || 'Sede'}
            </h1>
            <p className="page-description">Historial de notebooks y celulares vinculados a la sede</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="card-base p-4 mb-6 border-l-4 border-l-rose-500 bg-rose-50/50">
          <p className="text-sm text-rose-700 font-medium">{error}</p>
        </div>
      )}

      <div className="card-base p-6">
        <HistorialEquipos scope="sede" id={id} showHeader={false} />
      </div>
    </div>
  )
}
