import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import { authAPI } from '../services/api';
import logo from '../assets/logo.png';
import LoginLoadingScreen from '../components/LoginLoadingScreen';

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [error, setError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [devUsers, setDevUsers] = useState([]);
  const hasProcessedRef = useRef(false);
  const showDevLogin = import.meta.env.DEV;

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
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4 sm:p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 overflow-hidden z-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-primary-500"></div>
      </div>

      <div className="bg-white rounded-xl shadow-xl w-full max-w-[21rem] p-6 sm:max-w-[28rem] sm:p-8 md:p-10 relative z-10 transition-colors duration-200 border border-surface-200 overflow-hidden">

        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Grupo Megatlon" className="h-12 max-w-full w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Portal IT Megatlon</h1>
          <p className="text-surface-500 mt-2 text-sm font-medium">Sistema Integral de Gestión</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-8 flex items-start gap-3 animate-fade-in">
            <svg className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-800">Error de acceso</h3>
              <p className="text-rose-600 text-xs mt-0.5 leading-relaxed">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Login Action */}
        <div className="space-y-8">
          <div className="text-left bg-surface-50 p-5 sm:p-6 rounded-xl border border-surface-100">
            <h3 className="text-sm font-bold text-surface-900 mb-1">
              Acceso Corporativo
            </h3>
            <p className="text-xs text-surface-500 mb-4">
              Utiliza tus credenciales de Microsoft 365
            </p>

            <button
              onClick={handleLoginClick}
              disabled={isLoggingIn}
              className="w-full min-w-0 py-3.5 px-4 bg-surface-900 text-white rounded-lg font-bold text-sm hover:bg-surface-800 transition-colors duration-150 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              {isLoggingIn ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Redirigiendo...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6v-11.4H24V24zM11.4 12.6H0V1.2h11.4v11.4zm12.6 0H12.6V1.2H24v11.4z" />
                  </svg>
                  <span className="truncate">Ingresar con Microsoft</span>
                </>
              )}
            </button>
          </div>

          {showDevLogin && devUsers.length > 0 && (
            <div className="text-left bg-amber-50 p-5 sm:p-6 rounded-xl border border-amber-100">
              <h3 className="text-sm font-bold text-amber-950 mb-1">
                Acceso local de desarrollo
              </h3>
              <p className="text-xs text-amber-700 mb-4">
                Usuarios de prueba para validar permisos y flujos.
              </p>

              <div className="space-y-2">
                {devUsers.map((devUser) => (
                  <button
                    key={devUser.key}
                    type="button"
                    onClick={() => handleDevLoginClick(devUser)}
                    disabled={isLoggingIn}
                    className="w-full py-3 px-4 bg-white text-surface-900 rounded-xl font-bold text-sm hover:bg-amber-100 transition-colors border border-amber-200 flex items-center justify-between gap-3"
                  >
                    <span className="capitalize">{devUser.role.replace('_', ' ')}</span>
                    <span className="text-xs font-medium text-surface-500 truncate">{devUser.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-surface-400 font-medium">
            <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Acceso corporativo protegido</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center border-t border-surface-100 pt-6">
          <p className="text-[10px] text-surface-400 font-bold uppercase tracking-widest">
            Megatlon Infraestructura &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
}
