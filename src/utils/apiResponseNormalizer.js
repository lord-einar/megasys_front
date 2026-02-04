/**
 * Normaliza las respuestas de la API a un formato consistente
 *
 * El backend puede devolver datos en diferentes formatos:
 * - { data: [...] }
 * - { data: { rows: [...], pagination: {...} } }
 * - { rows: [...], pagination: {...} }
 * - [...] (array directo)
 *
 * Esta función normaliza todos estos formatos a:
 * {
 *   data: [...],
 *   total: number,
 *   totalPages: number,
 *   currentPage: number
 * }
 *
 * @param {Object|Array} response - Respuesta de la API
 * @param {number} limit - Límite de items por página
 * @returns {Object} Respuesta normalizada
 */
export const normalizeApiResponse = (response, limit = 10) => {
  // Si la respuesta es null o undefined
  if (!response) {
    return {
      data: [],
      total: 0,
      totalPages: 0,
      currentPage: 1
    }
  }

  // Si la respuesta es un array directo
  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
      totalPages: Math.ceil(response.length / limit) || 1,
      currentPage: 1
    }
  }

  // Extraer datos del response
  let data = []
  let pagination = {}

  // Intentar obtener datos en diferentes estructuras
  if (response.data?.rows) {
    // Formato: { data: { rows: [...], pagination: {...} } }
    data = response.data.rows
    pagination = response.data.pagination || {}
  } else if (response.rows) {
    // Formato: { rows: [...], pagination: {...} }
    data = response.rows
    pagination = response.pagination || {}
  } else if (response.data) {
    // Formato: { data: [...] }
    data = Array.isArray(response.data) ? response.data : []
    pagination = response.pagination || response.meta || {}
  } else {
    // Fallback: intentar usar response directamente
    data = Array.isArray(response) ? response : []
  }

  // Normalizar información de paginación
  const total = pagination.total || data.length || 0
  const totalPages = pagination.pages || Math.ceil(total / limit) || 1
  const currentPage = pagination.currentPage || pagination.page || 1

  return {
    data: Array.isArray(data) ? data : [],
    total,
    totalPages,
    currentPage
  }
}

/**
 * Normaliza datos de estadísticas que pueden venir en diferentes formatos
 *
 * @param {Object} response - Respuesta de la API con estadísticas
 * @returns {Object} Estadísticas normalizadas
 */
export const normalizeStatsResponse = (response) => {
  if (!response) return null

  // Si viene en response.data
  if (response.data) {
    return response.data
  }

  // Si viene directamente
  return response
}

/**
 * Normaliza un item individual que puede venir envuelto en data o directo
 *
 * @param {Object} response - Respuesta de la API
 * @returns {Object} Item normalizado
 */
export const normalizeItemResponse = (response) => {
  if (!response) return null

  // Si viene en response.data
  if (response.data) {
    return response.data
  }

  // Si viene directamente
  return response
}
