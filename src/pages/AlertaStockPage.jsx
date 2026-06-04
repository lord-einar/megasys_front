import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config/api'

export default function AlertaStockPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const token = searchParams.get('token')

  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notificando, setNotificando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    if (!token) { setError('Token no encontrado en la URL'); setLoading(false); return }
    fetch(`${API_BASE_URL}/stock-alerts/info?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setInfo(d.data)
        else setError(d.message || 'Enlace inválido o expirado')
      })
      .catch(() => setError('No se pudo cargar la información'))
      .finally(() => setLoading(false))
  }, [token])

  const notificarCompras = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/alerta-stock?token=${token}`)
      return
    }
    setNotificando(true)
    try {
      const authToken = localStorage.getItem('authToken')
      const resp = await fetch(`${API_BASE_URL}/stock-alerts/notificar-compras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ token })
      })
      const d = await resp.json()
      if (d.success) setEnviado(true)
      else setError(d.message || 'Error al notificar')
    } catch {
      setError('Error de conexión')
    } finally {
      setNotificando(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-3" />
        <p className="text-surface-500 font-medium">Cargando información del alerta…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="card-base p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-surface-900 mb-2">Enlace inválido</h1>
        <p className="text-surface-500 text-sm">{error}</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-6">Ir al inicio</button>
      </div>
    </div>
  )

  if (enviado) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="card-base p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-surface-900 mb-2">Compras notificado</h1>
        <p className="text-surface-500 text-sm">
          Se envió un correo al área de Compras solicitando la reposición de <strong>{info?.categoria_nombre}</strong>.
        </p>
        <button onClick={() => navigate('/solicitudes-asignacion/dashboard')} className="btn-primary mt-6">
          Ir al dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="card-base p-8 max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Alerta de stock bajo</p>
            <h1 className="text-xl font-bold text-surface-900">Stock insuficiente</h1>
          </div>
        </div>

        {/* Info de la alerta */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-surface-600">Categoría</span>
            <span className="font-bold text-surface-900">{info.categoria_nombre}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-surface-600">Tipo de equipo</span>
            <span className="font-medium text-surface-900 capitalize">{info.tipo}</span>
          </div>
          <div className="flex justify-between items-center border-t border-amber-200 pt-3">
            <span className="text-sm font-semibold text-surface-600">Unidades disponibles</span>
            <span className="text-2xl font-extrabold text-rose-600">{info.count}</span>
          </div>
          <p className="text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2">
            El stock mínimo recomendado es de 3 unidades. Se recomienda gestionar una reposición.
          </p>
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          <p className="text-sm text-surface-600">
            ¿Querés notificar al área de <strong>Compras</strong> para que gestione el pedido de reposición?
          </p>
          <div className="flex gap-3">
            <button
              onClick={notificarCompras}
              disabled={notificando || !isAuthenticated}
              className="btn-primary flex-1"
            >
              {notificando ? 'Enviando…' : 'Sí, notificar a Compras'}
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary">
              No por ahora
            </button>
          </div>
          {!isAuthenticated && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Necesitás iniciar sesión para confirmar la notificación.{' '}
              <button onClick={() => navigate(`/login?redirect=/alerta-stock?token=${token}`)} className="underline font-semibold">
                Iniciar sesión
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
