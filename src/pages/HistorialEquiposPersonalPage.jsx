import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { solicitudesCompraAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import HistorialEquipos from '../components/solicitudesCompra/HistorialEquipos'
import { ArrowLeft, User as UserIcon } from 'lucide-react'

export default function HistorialEquiposPersonalPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canViewSolicitudesCompra, canViewSolicitudesAsignacion } = usePermissions()
  const canView = canViewSolicitudesCompra || canViewSolicitudesAsignacion
  const [personal, setPersonal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!canView) return
    cargar()
  }, [id])

  const cargar = async () => {
    try {
      setLoading(true)
      const resp = await solicitudesCompraAPI.historialEquiposPersonal(id)
      setPersonal((resp?.data || resp)?.personal || null)
    } catch (err) {
      setError(err.message || 'No se pudo cargar el historial')
    } finally {
      setLoading(false)
    }
  }

  if (!canView) {
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
              <UserIcon className="w-5 h-5 text-primary-500" />
              {loading ? 'Cargando…' : personal ? `${personal.apellido}, ${personal.nombre}` : 'Persona'}
            </h1>
            <p className="page-description">Historial de notebooks y celulares asignados</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="card-base p-4 mb-6 border-l-4 border-l-rose-500 bg-rose-50/50">
          <p className="text-sm text-rose-700 font-medium">{error}</p>
        </div>
      )}

      <div className="card-base p-6">
        <HistorialEquipos scope="personal" id={id} showHeader={false} />
      </div>
    </div>
  )
}
