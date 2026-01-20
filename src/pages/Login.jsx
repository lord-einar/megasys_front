import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import logo from '../assets/logo.png';

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [error, setError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const hasProcessedRef = useRef(false);

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

  if (loading || isLoggingIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900 p-4">
        <div className="bg-white rounded-2xl p-10 w-full max-w-md text-center shadow-2xl">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-primary-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Conectando con el servidor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 p-4 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-900/20 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-navy-800/30 blur-[100px]"></div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 md:p-10 relative z-10 transition-all duration-300">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Grupo Megatlon Logo" className="h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Gestión Empresarial</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Sistema Integral de Administración</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error-50 border border-error-100 rounded-lg p-4 mb-6 flex items-start gap-3 animate-pulse">
            <span className="text-error-600 text-lg">⚠️</span>
            <p className="text-error-700 text-sm flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-error-500 hover:text-error-700 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Login Form */}
        <div className="space-y-6">
          <div className="text-left">
            <label htmlFor="email" className="block text-sm font-semibold text-navy-900 mb-2">
              Acceso Corporativo
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                disabled
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm focus:outline-none cursor-not-allowed"
                value="Autenticación vía Microsoft Azure AD"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Serás redirigido al portal de Microsoft para validar tus credenciales.
            </p>
          </div>

          <button
            onClick={handleLoginClick}
            disabled={isLoggingIn}
            className="w-full py-3.5 px-4 bg-navy-900 text-white rounded-lg font-bold text-sm hover:bg-navy-800 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-95"
          >
            {isLoggingIn ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Iniciando sesión...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6v-11.4H24V24zM11.4 12.6H0V1.2h11.4v11.4zm12.6 0H12.6V1.2H24v11.4z" />
                </svg>
                Ingresar con Microsoft
              </>
            )}
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="bg-primary-50/50 rounded-xl p-4 border border-primary-100/50">
            <h3 className="text-xs font-bold text-navy-900 mb-2 uppercase tracking-wide">Beneficios de Azure AD</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-xs text-slate-600 font-medium">
                <svg className="w-3.5 h-3.5 mr-2 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Máxima seguridad empresarial
              </li>
              <li className="flex items-center text-xs text-slate-600 font-medium">
                <svg className="w-3.5 h-3.5 mr-2 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Single Sign-On (SSO)
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            © 2025 Megasys • Sistema de Gestión
          </p>
        </div>
      </div>
    </div>
  );
}
