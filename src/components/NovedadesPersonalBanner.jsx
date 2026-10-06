import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRightLeft, X } from 'lucide-react'
import { novedadesPersonalAPI } from '../services/api'

const RUTA_NOVEDADES = '/personal/novedades'
const STORAGE_KEY = 'novedadesPersonalBannerOcultoHasta'

const leerOculto = () => {
  try {
    return Number(sessionStorage.getItem(STORAGE_KEY)) || 0
  } catch {
    return 0
  }
}

/**
 * Aviso para super_admin: la sincronización con Entra ID detectó cambios de sede
 * del personal que todavía no se confirmaron. Se puede ocultar durante la sesión;
 * vuelve a aparecer si llegan más novedades.
 */
export default function NovedadesPersonalBanner() {
  const location = useLocation()
  const navigate = useNavigate()
  const [pendientes, setPendientes] = useState(0)
  const [ocultoHasta, setOcultoHasta] = useState(leerOculto)

  useEffect(() => {
    let cancelado = false
    novedadesPersonalAPI.resumen()
      .then(res => { if (!cancelado) setPendientes(res?.data?.pendientes || 0) })
      .catch(() => { if (!cancelado) setPendientes(0) })
    return () => { cancelado = true }
  }, [location.pathname])

  const ocultar = () => {
    setOcultoHasta(pendientes)
    try {
      sessionStorage.setItem(STORAGE_KEY, String(pendientes))
    } catch {
      // Sin sessionStorage el aviso solo se oculta hasta recargar
    }
  }

  if (pendientes === 0 || pendientes <= ocultoHasta || location.pathname === RUTA_NOVEDADES) {
    return null
  }

  return (
    <div role="status" className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
      <ArrowRightLeft className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
      <p className="flex-1 min-w-[12rem] text-sm text-amber-900">
        <span className="font-bold">
          {pendientes === 1 ? 'Hay 1 novedad' : `Hay ${pendientes} novedades`} de movimiento de personal
        </span>{' '}
        detectadas por la sincronización con Microsoft 365. Revisalas para mover sus equipos asignados.
      </p>
      <button onClick={() => navigate(RUTA_NOVEDADES)} className="btn-primary text-sm">
        Ver novedades
      </button>
      <button
        onClick={ocultar}
        className="p-1.5 rounded-md text-amber-700 hover:bg-amber-100"
        aria-label="Ocultar aviso"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
