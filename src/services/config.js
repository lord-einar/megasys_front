// ============================================
// src/services/config.js
// Configuraciones centralizadas de la aplicación
// ============================================

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
}

// Azure AD Configuration
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return
        switch (level) {
          case 'Error':
            console.error(message)
            break
          case 'Info':
            console.info(message)
            break
          case 'Verbose':
            console.debug(message)
            break
          case 'Warning':
            console.warn(message)
            break
          default:
            console.log(message)
        }
      },
      piiLoggingEnabled: false,
    },
    windowHashTimeout: 60000,
    iframeHashTimeout: 6000,
    loadFrameTimeout: 0,
  },
}

// Login request configuration
export const loginRequest = {
  scopes: ['User.Read', 'profile', 'email', 'openid'],
  prompt: 'select_account',
}

// Graph API request configuration
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphMePhotoEndpoint: 'https://graph.microsoft.com/v1.0/me/photo/$value',
}

// App Constants
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Megasys',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema de Gestión Empresarial',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
  
  // Local Storage Keys
  STORAGE_KEYS: {
    TOKEN: 'megasys_token',
    USER: 'megasys_user',
    EMPRESA: 'megasys_empresa_actual',
    THEME: 'megasys_theme',
    PREFERENCES: 'megasys_preferences',
  },
  
  // File Upload
  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: {
      IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    },
  },
  
  // Estados y constantes de negocio
  ESTADOS: {
    REMITO: {
      PREPARADO: 'preparado',
      EN_TRANSITO: 'en_transito',
      ENTREGADO: 'entregado',
      CONFIRMADO: 'confirmado',
    },
    INVENTARIO: {
      DISPONIBLE: 'disponible',
      EN_USO: 'en_uso',
      PRESTADO: 'prestado',
      EN_TRANSITO: 'en_transito',
      EN_REPARACION: 'en_reparacion',
      BAJA: 'baja',
    },
    EXTENSION: {
      PENDIENTE: 'pendiente',
      APROBADA: 'aprobada',
      RECHAZADA: 'rechazada',
    },
  },
  
  // Colores por estado
  ESTADO_COLORS: {
    preparado: 'bg-yellow-100 text-yellow-800',
    en_transito: 'bg-blue-100 text-blue-800',
    entregado: 'bg-green-100 text-green-800',
    confirmado: 'bg-emerald-100 text-emerald-800',
    disponible: 'bg-green-100 text-green-800',
    en_uso: 'bg-blue-100 text-blue-800',
    prestado: 'bg-orange-100 text-orange-800',
    en_reparacion: 'bg-red-100 text-red-800',
    baja: 'bg-gray-100 text-gray-800',
    pendiente: 'bg-yellow-100 text-yellow-800',
    aprobada: 'bg-green-100 text-green-800',
    rechazada: 'bg-red-100 text-red-800',
  },
  
  // Formatos de fecha
  DATE_FORMATS: {
    DISPLAY: 'dd/MM/yyyy',
    DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
    API: 'yyyy-MM-dd',
    ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  },
  
  // Configuración de la tabla
  TABLE_CONFIG: {
    DEFAULT_SORT: 'created_at',
    DEFAULT_ORDER: 'desc',
    DEBOUNCE_SEARCH: 300, // ms
  },
}

// Validaciones
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-\+\(\)]+$/,
  SERVICE_TAG: /^[A-Z0-9]{3,}-[A-Z0-9]{4,}-[A-Z0-9]{4,}$/,
  CUIT: /^[0-9]{2}-[0-9]{8}-[0-9]$/,
  
  // Longitudes
  MAX_LENGTHS: {
    NAME: 100,
    DESCRIPTION: 500,
    ADDRESS: 255,
    PHONE: 50,
    EMAIL: 150,
    SERVICE_TAG: 150,
    SERIAL_NUMBER: 150,
  },
}

// Configuración de React Query
export const QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutos
  CACHE_TIME: 10 * 60 * 1000, // 10 minutos
  RETRY: 1,
  RETRY_DELAY: 1000,
  
  // Keys para queries
  KEYS: {
    SEDES: 'sedes',
    PERSONAL: 'personal',
    INVENTARIO: 'inventario',
    REMITOS: 'remitos',
    DASHBOARD: 'dashboard',
    PRESTAMOS: 'prestamos',
    USER: 'user',
    EMPRESAS: 'empresas',
  },
}

// Configuración de permisos
export const PERMISSIONS = {
  GROUPS: {
    INFRAESTRUCTURA: 'Infraestructura',
    SOPORTE: 'Soporte',
    MESA_AYUDA: 'Mesa de ayuda',
  },
  
  ACTIONS: {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    MANAGE: 'manage',
  },
  
  RESOURCES: {
    SEDES: 'sedes',
    PERSONAL: 'personal',
    INVENTARIO: 'inventario',
    REMITOS: 'remitos',
    DASHBOARD: 'dashboard',
    SYSTEM: 'system',
  },
}

export default {
  API_CONFIG,
  msalConfig,
  loginRequest,
  graphConfig,
  APP_CONFIG,
  VALIDATION_RULES,
  QUERY_CONFIG,
  PERMISSIONS,
}