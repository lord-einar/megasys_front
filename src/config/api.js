/**
 * API Configuration
 * Dynamically configures API endpoints based on environment
 *
 * URLs are determined by environment variables or constructed from current location.
 * This allows the same build to work with different domains (Azure, personalizado, etc.)
 */

// Determine API base URL from environment variables or construct from current location
const getAPIBaseURL = () => {
  // In production, use the backend host
  if (import.meta.env.MODE === 'production') {
    // Get backend URL from environment variable or use Azure default
    const backendHost = import.meta.env.VITE_BACKEND_HOST || 'megasys-api.azurewebsites.net'
    return `https://${backendHost}/api`
  }

  // Try to get from environment variable (Vite) - for explicit configuration (dev only)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // Development: assume backend is on localhost:4000
  return 'http://localhost:4000/api'
}

// Determine Backend base URL for file downloads
const getBackendBaseURL = () => {
  // Try to get from environment variable (Vite) - for explicit configuration
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL
  }

  // In production, use the same origin as frontend or configured backend host
  if (import.meta.env.MODE === 'production') {
    // Get backend URL from environment or use Azure default
    const backendHost = import.meta.env.VITE_BACKEND_HOST || 'megasys-api.azurewebsites.net'
    return `https://${backendHost}`
  }

  // Development: assume backend is on localhost:4000
  return 'http://localhost:4000'
}

export const API_BASE_URL = getAPIBaseURL()
export const BACKEND_BASE_URL = getBackendBaseURL()

console.log('🔧 API Configuration:', {
  mode: import.meta.env.MODE,
  apiBaseUrl: API_BASE_URL,
  backendBaseUrl: BACKEND_BASE_URL
})
