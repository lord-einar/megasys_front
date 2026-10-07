import { useEffect, useState } from 'react'
import { AlertTriangle, Building2, Briefcase, LogOut, UserCheck, PackagePlus } from 'lucide-react'
import MicrosoftLogo from '../components/MicrosoftLogo'
import { autogestionAPI, sesionAutogestion } from '../services/autogestionApi'

// Errores que vuelven de Microsoft o del backend, en lenguaje del usuario
const describirError = (codigo, descripcion) => {
  if (codigo === 'access_denied') return 'Cancelaste el ingreso con Microsoft.'
  if (codigo === 'sin_personal') return descripcion || 'Tu usuario no figura como personal activo de Megatlon. Consultá con RRHH.'
  return descripcion || 'No se pudo completar el ingreso. Probá de nuevo.'
}

// Toma el token (#token=…) o el error (?error=…) de la vuelta de Microsoft y limpia la URL
function leerVuelta() {
  const hash = new URLSearchParams(window.location.hash.slice(1))
  const query = new URLSearchParams(window.location.search)
  const token = hash.get('token')
  const error = query.get('error') ? describirError(query.get('error'), query.get('error_description')) : null
  if (token || error) window.history.replaceState(null, '', window.location.pathname)
  return { token, error }
}

export default function AutogestionPage() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [ingresando, setIngresando] = useState(false)
  const [usuariosDev, setUsuariosDev] = useState([])

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const res = await autogestionAPI.me()
      setDatos(res.data)
    } catch (err) {
      setDatos(null)
      setError(err.status === 401 ? 'Tu sesión venció: volvé a ingresar.' : err.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    const { token, error: errorVuelta } = leerVuelta()
    if (token) sesionAutogestion.guardar(token)
    if (errorVuelta) setError(errorVuelta)

    if (sesionAutogestion.token()) cargarDatos()
    else setCargando(false)

    if (import.meta.env.DEV) {
      autogestionAPI.devUsuarios().then(res => setUsuariosDev(res.data || [])).catch(() => setUsuariosDev([]))
    }
  }, [])

  const ingresar = async () => {
    setIngresando(true)
    setError(null)
    try {
      const res = await autogestionAPI.urlLogin()
      window.location.href = res.data.authUrl
    } catch (err) {
      setError(err.message || 'No se pudo iniciar el ingreso con Microsoft')
      setIngresando(false)
    }
  }

  const ingresarDev = async (email) => {
    setError(null)
    try {
      const res = await autogestionAPI.devLogin(email)
      sesionAutogestion.guardar(res.data.token)
      await cargarDatos()
    } catch (err) {
      setError(err.message)
    }
  }

  const salir = () => {
    sesionAutogestion.cerrar()
    setDatos(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-nav-bg text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <p className="font-bold">Grupo Megatlon <span className="font-normal text-nav-text">· Pedido de equipos</span></p>
          {datos && (
            <button onClick={salir} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-nav-text hover:text-white">
              <LogOut className="h-4 w-4" aria-hidden="true" /> Salir
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {error && (
          <div className="card-base p-4 flex items-start gap-3 status-stop" role="alert">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {cargando ? (
          <div className="space-y-3" role="status" aria-label="Cargando tus datos">
            <div className="skeleton h-24" />
            <div className="skeleton h-32" />
          </div>
        ) : datos ? (
          <MisDatos datos={datos} />
        ) : (
          <section className="card-base p-6 sm:p-8">
            <h1 className="page-title">Pedí tu equipo</h1>
            <p className="page-description mt-2">
              Ingresá con tu cuenta de Megatlon (Microsoft 365) para pedir un celular, una notebook o una PC.
              Tu pedido le llega a tu superior para que lo apruebe.
            </p>
            <button onClick={ingresar} disabled={ingresando} className="btn-primary mt-6">
              <MicrosoftLogo />
              {ingresando ? 'Abriendo Microsoft…' : 'Ingresar con Microsoft'}
            </button>

            {import.meta.env.DEV && usuariosDev.length > 0 && (
              <div className="mt-8 rounded-lg border border-dashed border-field p-4">
                <p className="label-base">Acceso de desarrollo</p>
                <p className="text-sm text-surface-600 mb-3">Solo en entorno local: usuarios de desarrollo y ocupantes de puestos de prueba.</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {usuariosDev.map(u => (
                    <li key={u.email}>
                      <button onClick={() => ingresarDev(u.email)} className="btn-secondary w-full justify-start text-left">
                        <span className="min-w-0">
                          <span className="block truncate">{u.nombre}</span>
                          {u.puesto && <span className="block truncate text-sm font-normal text-surface-600">{u.puesto}</span>}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

function MisDatos({ datos }) {
  const { aprobador } = datos
  return (
    <>
      <section className="card-base p-6">
        <h1 className="page-title">Hola, {datos.nombre}</h1>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Dato icono={Building2} etiqueta="Sede" valor={datos.sede?.nombre_sede || 'Sin sede asignada'} />
          <Dato icono={Briefcase} etiqueta="Puesto" valor={datos.puesto?.nombre || 'Sin puesto asignado'} />
        </dl>

        <div className="mt-4 rounded-lg bg-surface-50 border border-surface-200 p-4 flex items-start gap-3">
          <UserCheck className="h-5 w-5 mt-0.5 shrink-0 text-primary-600" aria-hidden="true" />
          <div className="text-sm">
            {!datos.puesto ? (
              <p>Todavía no tenés un puesto en el organigrama. Consultá con RRHH antes de pedir un equipo.</p>
            ) : aprobador ? (
              <p>
                Tus pedidos los aprueba <strong>{aprobador.ocupantes.map(o => `${o.nombre} ${o.apellido}`).join(' / ')}</strong>
                {' '}({aprobador.puesto_nombre}{aprobador.escalado ? ', porque tu superior directo está vacante' : ''}).
              </p>
            ) : (
              <p>No tenés un superior asignado: tus pedidos se cargan directamente.</p>
            )}
          </div>
        </div>
      </section>

      <section className="card-base p-6 flex items-start gap-3">
        <PackagePlus className="h-6 w-6 shrink-0 text-surface-400" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-surface-900">Pedir un equipo</h2>
          <p className="text-sm text-surface-600 mt-1">Muy pronto vas a poder pedir tu equipo y seguir el estado de tus pedidos desde acá.</p>
        </div>
      </section>
    </>
  )
}

function Dato({ icono: Icono, etiqueta, valor }) {
  return (
    <div className="flex items-start gap-3">
      <Icono className="h-5 w-5 mt-0.5 shrink-0 text-surface-400" aria-hidden="true" />
      <div>
        <dt className="text-sm text-surface-600">{etiqueta}</dt>
        <dd className="font-semibold text-surface-900">{valor}</dd>
      </div>
    </div>
  )
}
