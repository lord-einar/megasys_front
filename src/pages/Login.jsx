import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import logo from '../assets/logo.png';
import '../styles/Login.css';

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
        console.log('Callback already processed, skipping...');
        return;
      }

      const authData = searchParams.get('auth_data');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log('🔍 Checking for auth_data:', authData ? 'YES' : 'NO');
      console.log('🔍 Checking for error:', errorParam ? 'YES' : 'NO');

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
          console.log('📦 Processing auth_data from URL...');

          // Decodificar los datos del Base64 (usando atob para el navegador)
          const decodedString = atob(authData);
          const decodedData = JSON.parse(decodedString);

          console.log('✅ Decoded auth data:', decodedData);
          console.log('👤 User:', decodedData.user);
          console.log('🔑 Token:', decodedData.token?.substring(0, 20) + '...');

          if (decodedData.user && decodedData.token) {
            console.log('✅ Auth data is valid');
            console.log('📝 Calling login() with user:', {
              id: decodedData.user.id,
              email: decodedData.user.email,
              firstName: decodedData.user.firstName,
              lastName: decodedData.user.lastName,
              role: decodedData.user.role,
              tokenLength: decodedData.token.length
            });

            // Guardar token en localStorage antes de navegar
            localStorage.setItem('authToken', decodedData.token);
            localStorage.setItem('authUser', JSON.stringify(decodedData.user));

            // Llamar login para actualizar el contexto
            login(decodedData.user, decodedData.token, decodedData.profilePhotoUrl);

            console.log('✅ login() executed');
            console.log('🚀 Navigating to /dashboard');

            // Limpiar parámetros de URL para evitar reprocessing
            setSearchParams('');

            // Navegar inmediatamente (el token ya está en localStorage)
            if (isMounted) {
              // Usar replace para evitar que el usuario pueda volver atrás
              navigate('/dashboard', { replace: true });
            }
          } else {
            console.error('❌ Auth data validation failed');
            console.error('   - User present:', !!decodedData.user);
            console.error('   - Token present:', !!decodedData.token);

            if (isMounted) {
              setError('Respuesta de autenticación incompleta');
              setIsLoggingIn(false);
            }
          }
        } catch (err) {
          console.error('❌ Error processing auth_data:', err);
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
      console.error('Login error:', err);
      setIsLoggingIn(false);
    }
  };

  if (loading || isLoggingIn) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="spinner"></div>
          <p className="text-center text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Logo Section */}
        <div className="login-header">
          <div className="logo-placeholder">
            <img src={logo} alt="Grupo Megatlon Logo" className="h-20 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Gestión Empresarial</h1>
          <p className="text-gray-600 mt-2">Sistema Integral de Administración</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="error-close"
            >
              ✕
            </button>
          </div>
        )}

        {/* Login Form */}
        <div className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Corporativo
            </label>
            <input
              type="email"
              id="email"
              placeholder="tu.email@empresa.com"
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              value="Inicia sesión con tu cuenta de Azure"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se utilizará tu cuenta de Microsoft 365 / Azure AD
            </p>
          </div>

          <button
            onClick={handleLoginClick}
            disabled={isLoggingIn}
            className="login-button"
          >
            {isLoggingIn ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Conectando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6v-11.4H24V24zM11.4 12.6H0V1.2h11.4v11.4zm12.6 0H12.6V1.2H24v11.4z" />
                </svg>
                Iniciar sesión con Microsoft
              </>
            )}
          </button>
        </div>

        {/* Info Section */}
        <div className="login-info">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">¿Por qué usar Azure AD?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Seguridad empresarial
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Sin contraseña adicional
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Roles y permisos automáticos
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p className="text-xs text-gray-500">
            © 2025 Sistema de Gestión Empresarial. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
