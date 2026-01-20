import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('authUser');

      if (savedToken && savedUser) {
        try {
          // Primero intenta con el usuario guardado localmente
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setToken(savedToken);

          // Luego valida el token con el backend en background con timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

          try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${savedToken}`,
                'Content-Type': 'application/json'
              },
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              // Si el token no es válido, limpiar localStorage
              localStorage.removeItem('authToken');
              localStorage.removeItem('authUser');
              setUser(null);
              setToken(null);
            }
          } catch (fetchErr) {
            clearTimeout(timeoutId);
            // Mantener la sesión en caso de timeout o error de red - mejor UX
          }
        } catch (err) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData, authToken, profilePhotoUrl) => {
    // Asegurarse de que userData tiene la estructura correcta
    const completeUser = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      fullName: userData.fullName || userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`,
      role: userData.role || 'user',
      groups: userData.groups || [],
      permissions: userData.permissions || {},
      groupAnalysis: userData.groupAnalysis || {},
      profilePhotoUrl: profilePhotoUrl || null
    };
    setUser(completeUser);
    setToken(authToken);
    localStorage.setItem('authToken', authToken);
    // Guardar el usuario completo en localStorage para reutilizarlo al recargar
    localStorage.setItem('authUser', JSON.stringify(completeUser));
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (err) {
      // Error silenciado en producción
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  };

  const refreshToken = async (refreshTokenValue) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue })
      });
      if (response.ok) {
        const data = await response.json();
        login(data.user, data.token);
        return data.token;
      } else {
        logout();
        return null;
      }
    } catch (err) {
      logout();
      return null;
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!token && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
