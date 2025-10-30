/**
 * API Configuration
 * Dynamically configures API endpoints based on environment
 */

// Determine API base URL from environment variables or construct from current location
const getAPIBaseURL = () => {
  // Try to get from environment variable (Vite)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // In production, use the same origin as frontend
  // In development, use localhost:4000
  if (import.meta.env.MODE === 'production') {
    // In production, APIs should be at same domain (served by reverse proxy)
    return `${window.location.origin}/api`
  }

  // Development: assume backend is on localhost:4000
  return 'http://localhost:4000/api'
}

// Determine Backend base URL for file downloads
const getBackendBaseURL = () => {
  // Try to get from environment variable (Vite)
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL
  }

  // In production, use the same origin as frontend
  if (import.meta.env.MODE === 'production') {
    return window.location.origin
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
