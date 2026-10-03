import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import { authAPI } from '../services/api';
import logo from '../assets/logo.png';
import LoginLoadingScreen from '../components/LoginLoadingScreen';
import { AlertTriangle, X } from 'lucide-react';

const ROL_DEV = { super_admin: 'Infraestructura', rrhh: 'RRHH', compras: 'Compras' };

// Errores habituales del inicio de sesión de Microsoft, en lenguaje del usuario.
// El detalle técnico original se conserva como segunda línea.
const ERRORES_MICROSOFT = {
  access_denied: 'Cancelaste el ingreso o tu cuenta no dio permiso al portal.',
  consent_required: 'Tu cuenta necesita autorización de un administrador para usar el portal.',
  interaction_required: 'Microsoft necesita que vuelvas a ingresar.',
  login_required: 'Microsoft necesita que vuelvas a ingresar.'
};

// Microsoft a veces envía solo la descripción (p. ej. "AADSTS65004: User declined to consent").
const CODIGOS_AADSTS = { AADSTS65004: 'access_denied', AADSTS50105: 'consent_required', AADSTS65001: 'consent_required' };

const describirError = (mensaje) => {
  const aadsts = Object.keys(CODIGOS_AADSTS).find(c => mensaje.includes(c));
  const codigo = aadsts ? CODIGOS_AADSTS[aadsts] : Object.keys(ERRORES_MICROSOFT).find(c => mensaje.includes(c));
  if (codigo) return { titulo: 'No se pudo ingresar', detalle: ERRORES_MICROSOFT[codigo] };
  if (/conexi[oó]n/i.test(mensaje)) {
    return { titulo: 'No hay conexión con el portal', detalle: 'Revisá tu conexión a internet y volvé a intentar.' };
  }
  return { titulo: 'No se pudo ingresar', detalle: mensaje };
};

// Logo de Microsoft en sus colores oficiales, sobre un recuadro blanco para que
// se lea sobre el botón petróleo.
function MicrosoftLogo() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-white" aria-hidden="true">
      <svg viewBox="0 0 21 21" className="h-4 w-4">
        <rect x="0" y="0" width="10" height="10" fill="#f25022" />
        <rect x="11" y="0" width="10" height="10" fill="#7fba00" />
        <rect x="0" y="11" width="10" height="10" fill="#00a4ef" />
        <rect x="11" y="11" width="10" height="10" fill="#ffb900" />
      </svg>
    </span>
  );
}

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [error, setError] = useState(null);
  // Si se vuelve de Microsoft con la sesión en la URL, se muestra la espera desde
  // el primer render: así no aparece el formulario un instante antes del portal.
  const [isLoggingIn, setIsLoggingIn] = useState(() => !!searchParams.get('auth_data'));
  const [devUsers, setDevUsers] = useState([]);
  const hasProcessedRef = useRef(false);
  const showDevLogin = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEV_LOGIN === 'true';

  // Handle Azure AD callback
  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      // Prevent double processing usando ref persistente
      if (hasProcessedRef.current) {
        return;
      }

      const authData = searchParams.get('auth_data');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam) {
        hasProcessedRef.current = true;
        if (isMounted) {
          setError(`Error de autenticación: ${errorDescription || errorParam}`);
          setIsLoggingIn(false);
        }
        return;
      }

      if (authData) {
        hasProcessedRef.current = true;
        if (isMounted) {
          setIsLoggingIn(true);
        }

        try {
          // Decodificar los datos del Base64 (usando atob para el navegador)
          const decodedString = atob(authData);
          const decodedData = JSON.parse(decodedString);

          if (decodedData.user && decodedData.token) {
            // Guardar token en localStorage antes de navegar
            localStorage.setItem('authToken', decodedData.token);
            localStorage.setItem('authUser', JSON.stringify(decodedData.user));

            // Llamar login para actualizar el contexto
            login(decodedData.user, decodedData.token, decodedData.profilePhotoUrl);

            // Limpiar parámetros de URL para evitar reprocessing
            setSearchParams('');

            // Navegar inmediatamente (el token ya está en localStorage)
            if (isMounted) {
              // Usar replace para evitar que el usuario pueda volver atrás
              navigate('/dashboard', { replace: true });
            }
          } else {
            if (isMounted) {
              setError('Respuesta de autenticación incompleta');
              setIsLoggingIn(false);
            }
          }
        } catch (err) {
          if (isMounted) {
            setError('Error al procesar la autenticación: ' + err.message);
            setIsLoggingIn(false);
          }
        }
      }
    };

    if (!loading) {
      handleCallback();
    }

    return () => {
      isMounted = false;
    };
  }, [searchParams, login, navigate, loading]);

  useEffect(() => {
    if (!showDevLogin) return;

    authAPI.devUsers()
      .then((response) => {
        const users = response?.data?.users || [];
        setDevUsers(users);
      })
      .catch(() => {
        setDevUsers([]);
      });
  }, [showDevLogin]);

  const handleLoginClick = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`);
      if (response.ok) {
        const data = await response.json();
        // Redirect to Microsoft login URL
        const authUrl = data.data?.authUrl || data.authUrl;
        if (authUrl) {
          window.location.href = authUrl;
        } else {
          setError('No se pudo obtener la URL de autenticación');
          setIsLoggingIn(false);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al iniciar sesión');
        setIsLoggingIn(false);
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      setIsLoggingIn(false);
    }
  };

  const handleDevLoginClick = async (devUser) => {
    setIsLoggingIn(true);
    setError(null);

    try {
      const response = await authAPI.devLogin(devUser.key);
      const authData = response?.data;

      if (!authData?.user || !authData?.token) {
        throw new Error('Respuesta de autenticación incompleta');
      }

      login(authData.user, authData.token, authData.profilePhotoUrl);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión local');
      setIsLoggingIn(false);
    }
  };

  if (loading || isLoggingIn) {
    return <LoginLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-surface-50 lg:grid lg:grid-cols-[minmax(22rem,5fr)_7fr]">
      {/* Marca: franja superior en móvil/tablet, columna en escritorio */}
      <aside className="bg-nav-bg text-white px-6 py-6 sm:px-10 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12">
        {/* El PNG trae ~20/234 de margen a la izquierda: se compensa para alinear con el texto */}
        <img src={logo} alt="Grupo Megatlon" className="-ml-[14px] h-7 w-auto self-start invert mix-blend-screen lg:-ml-[18px] lg:h-9" />

        <div className="hidden lg:block">
          {/* Riel de etapas: la misma firma visual que el seguimiento de solicitudes */}
          <div className="mb-8 flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-14 rounded-full bg-nav-mark" />
            <span className="h-2.5 w-14 rounded-full bg-nav-mark" />
            <span className="h-2.5 w-14 rounded-full ring-2 ring-inset ring-nav-mark" />
          </div>
          <p className="max-w-[18ch] text-4xl font-bold leading-tight">
            Portal IT de Megatlon
          </p>
          <p className="mt-4 max-w-[36ch] text-lg leading-relaxed text-nav-text">
            Sedes, inventario, remitos, asignación de equipos y visitas técnicas en un solo lugar.
          </p>
        </div>

        <p className="hidden text-sm text-nav-text lg:block">Infraestructura IT, Grupo Megatlon</p>
      </aside>

      <main className="flex items-start justify-center px-6 py-10 sm:px-10 sm:py-16 lg:items-center lg:py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-[1.75rem] font-bold leading-tight text-surface-900">Ingresá al Portal IT</h1>
          <p className="mt-2 text-base text-surface-600">
            Usá tu cuenta corporativa de Microsoft 365.
          </p>

          {error && (
            <div role="alert" className="mt-6 flex items-start gap-3 rounded-lg border border-error-500/40 bg-error-50 p-4 motion-safe:animate-fade-in">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-error-700" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-error-700">{describirError(error).titulo}</p>
                <p className="mt-0.5 text-sm text-error-700 break-words">{describirError(error).detalle}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                aria-label="Cerrar aviso"
                className="-m-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-error-700 hover:bg-error-500/10"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleLoginClick}
            disabled={isLoggingIn}
            className="btn-primary mt-8 w-full min-h-12 text-base"
          >
            <MicrosoftLogo />
            Ingresar con Microsoft
          </button>

          <p className="mt-4 text-sm text-surface-600">
            Si no tenés acceso al portal, pedilo al equipo de Infraestructura.
          </p>

          {showDevLogin && devUsers.length > 0 && (
            <section aria-labelledby="titulo-dev" className="mt-10 rounded-lg border border-dashed border-warning-500 bg-warning-50 p-4">
              <h2 id="titulo-dev" className="text-base font-bold text-warning-700">Acceso de desarrollo</h2>
              <p className="mt-1 text-sm text-warning-700">Solo en entorno local. Entrá como un usuario de prueba de cada área.</p>
              <ul className="mt-3 space-y-2">
                {devUsers.map((devUser) => (
                  <li key={devUser.key}>
                    <button
                      type="button"
                      onClick={() => handleDevLoginClick(devUser)}
                      disabled={isLoggingIn}
                      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md border border-warning-500/50 bg-white px-3 py-2 text-left hover:bg-warning-50"
                    >
                      <span className="font-semibold text-surface-900">{ROL_DEV[devUser.role] || devUser.role}</span>
                      <span className="truncate text-sm text-surface-600">{devUser.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
